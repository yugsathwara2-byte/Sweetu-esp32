'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]">{title}</h1>
          {badge && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border)]">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
