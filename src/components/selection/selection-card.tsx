'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SelectionCardProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  selected: boolean;
  onClick: () => void;
}

export function SelectionCard({ label, description, icon, selected, onClick }: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-xl border-2 px-6 py-5',
        'transition-all duration-300 ease-out cursor-pointer',
        'hover:shadow-md hover:-translate-y-0.5',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'min-w-[140px] sm:min-w-[160px]',
        selected
          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
          : 'border-border bg-card hover:border-primary/40'
      )}
    >
      {/* Selection indicator dot */}
      <div
        className={cn(
          'absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full transition-all duration-300',
          selected ? 'bg-primary scale-100' : 'bg-border scale-75'
        )}
      />

      {/* Icon */}
      {icon && (
        <div
          className={cn(
            'text-2xl transition-transform duration-300',
            selected ? 'scale-110' : 'group-hover:scale-105'
          )}
        >
          {icon}
        </div>
      )}

      {/* Label */}
      <span
        className={cn(
          'text-sm font-semibold text-center leading-snug transition-colors duration-200',
          selected ? 'text-primary' : 'text-foreground'
        )}
      >
        {label}
      </span>

      {/* Optional description */}
      {description && (
        <span className="text-xs text-muted-foreground text-center leading-tight">
          {description}
        </span>
      )}
    </button>
  );
}
