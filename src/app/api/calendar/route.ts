import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const SPREADSHEET_ID = '1u1VsaEBf7paOx0Kpt1kGgtobSmax8j1mB5LTlkgvn6o';
const RANGE = 'Master Sch.!A:K';

const COL_TEAM     = 0;
const COL_DATE     = 2;
const COL_TIME     = 3;
const COL_LOCATION = 4;
const COL_NAME     = 5;
const COL_NOTE     = 10;

export interface CalendarEvent {
  team: string;
  date: string;
  time: string;
  location: string;
  name: string;
  note: string;
  isTextDate: boolean;
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

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');

  // --- Credentials ---
  // Option A (Vercel): paste the entire service-account JSON as GOOGLE_APPLICATION_CREDENTIALS_JSON
  // Option B (local): separate GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY in .env
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

  if (!dateParam) {
    return NextResponse.json({ error: 'Missing ?date=YYYY-MM-DD parameter' }, { status: 400 });
  }

  const [y, m, d] = dateParam.split('-').map(Number);
  const queryDate = new Date(y, m - 1, d);

  try {
    // --- Auth ---
    let auth: InstanceType<typeof google.auth.GoogleAuth>;
    try {
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } catch (authErr) {
      const msg = `Auth init failed: ${authErr instanceof Error ? authErr.message : String(authErr)}`;
      console.error('[calendar]', msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // --- Sheets call ---
    let rows: string[][];
    try {
      const sheets = google.sheets({ version: 'v4', auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      });
      rows = (response.data.values ?? []) as string[][];
    } catch (sheetsErr: unknown) {
      const gErr = sheetsErr as { code?: number; message?: string };
      const msg = `Sheets API error ${gErr.code ?? '?'}: ${gErr.message ?? String(sheetsErr)}`;
      console.error('[calendar]', msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // --- Filter rows ---
    const exact: CalendarEvent[] = [];
    const textDates: CalendarEvent[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawDate = (row[COL_DATE] ?? '').trim();
      // Skip empty cells and the header row ("Date")
      if (!rawDate || rawDate.toLowerCase() === 'date') continue;

      const parsed = parseSheetDate(rawDate);
      const event: CalendarEvent = {
        team:       row[COL_TEAM]     ?? '',
        date:       rawDate,
        time:       row[COL_TIME]     ?? '',
        location:   row[COL_LOCATION] ?? '',
        name:       row[COL_NAME]     ?? '',
        note:       row[COL_NOTE]     ?? '',
        isTextDate: parsed === null,
      };

      if (parsed === null) textDates.push(event);
      else if (isSameDay(parsed, queryDate)) exact.push(event);
    }

    return NextResponse.json({ events: [...exact, ...textDates] });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[calendar] Unexpected error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
