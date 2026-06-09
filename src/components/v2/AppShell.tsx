'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Nav from './Nav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname === '/chat';

  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className={`flex-1 min-w-0 ${isChat ? 'h-screen' : 'pb-20 lg:pb-0'}`}>
        {children}
      </main>
    </div>
  );
}
