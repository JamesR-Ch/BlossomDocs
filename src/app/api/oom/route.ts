import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const SPREADSHEET_ID = '1u1VsaEBf7paOx0Kpt1kGgtobSmax8j1mB5LTlkgvn6o';
const RANGE = 'Master Sch.!A:V';

const COL_TEAM       = 0;
const COL_DATE       = 2;
const COL_TIME       = 3;
const COL_SIZE       = 7;
const COL_BUNDLE     = 8;
const COL_SETUP      = 9;
const COL_BACKGROUND = 20;
const COL_PROCESS    = 21;

const START_YEAR  = 2026;
const START_MONTH = 3; // April (0-indexed)

export interface OomEvent {
  team:       string;
  date:       string;
  time:       string;
  size:       string;
  bundle:     string;
  setup:      string;
  background: string;
  process:    string;
  isTextDate: boolean;
  sortDate:   number; // timestamp for sorting, 0 for text dates
}

function parseSheetDate(raw: string): Date | null {
  const parts = raw.trim().split('/');
  if (parts.length !== 3) return null;
  const nums = parts.map(Number);
  if (nums.some(isNaN)) return null;
  const [d, m, y] = nums;
  const year = y < 100 ? 2000 + y : y;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return new Date(year, m - 1, d);
}

export async function GET() {
  // --- Credentials ---
  let credentials: Record<string, string>;
  const credJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credJson) {
    try {
      credentials = JSON.parse(credJson);
    } catch {
      return NextResponse.json({ error: 'GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON' }, { status: 500 });
    }
  } else {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
    const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? '';
    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;
    if (!email || !privateKey) {
      return NextResponse.json({ error: 'Missing GOOGLE_APPLICATION_CREDENTIALS_JSON (or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY)' }, { status: 500 });
    }
    credentials = { client_email: email, private_key: privateKey };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    const rows = (response.data.values ?? []) as string[][];

    const startCutoff = new Date(START_YEAR, START_MONTH, 1);
    const exact: OomEvent[] = [];
    const textDates: OomEvent[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawDate = (row[COL_DATE] ?? '').trim();
      if (!rawDate || rawDate.toLowerCase() === 'date') continue;

      const parsed = parseSheetDate(rawDate);
      const event: OomEvent = {
        team:       row[COL_TEAM]       ?? '',
        date:       rawDate,
        time:       row[COL_TIME]       ?? '',
        size:       row[COL_SIZE]       ?? '',
        bundle:     row[COL_BUNDLE]     ?? '',
        setup:      row[COL_SETUP]      ?? '',
        background: row[COL_BACKGROUND] ?? '',
        process:    row[COL_PROCESS]    ?? '',
        isTextDate: parsed === null,
        sortDate:   parsed ? parsed.getTime() : 0,
      };

      if (parsed === null) {
        textDates.push(event);
      } else if (parsed >= startCutoff) {
        exact.push(event);
      }
    }

    exact.sort((a, b) => a.sortDate - b.sortDate);

    return NextResponse.json({ events: [...exact, ...textDates] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[oom] Unexpected error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
