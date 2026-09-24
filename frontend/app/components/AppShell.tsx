'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type IconName = 'headset' | 'search' | 'bell' | 'chevron';

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    headset: (
      <>
        <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" />
        <path d="M4.5 13.5a2 2 0 0 1 2-2h1v6h-1a2 2 0 0 1-2-2v-2ZM19.5 13.5a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2ZM16.5 18c-.8 1.1-2.1 1.5-3.5 1.5" />
      </>
    ),
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4 4" /></>,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 7H4s2 0 2-7" /><path d="M10 20h4" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
  };

  return (
    <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  );
}

export function AppHeader() {
  return (
    <header className="top-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Support Desk ticket list">
          <span className="brand-mark" aria-hidden="true"><Icon name="headset" size={21} /></span>
          <strong>Support Desk</strong>
        </Link>

        <Link className="header-search" href="/" aria-label="Search tickets">
          <Icon name="search" size={17} />
          <span>Search tickets, users, or keywords...</span>
          <kbd>⌘ K</kbd>
        </Link>

        <div className="header-actions">
          <button
            className="icon-button"
            disabled
            title="Notifications are not available yet"
            type="button"
            aria-label="Notifications"
          >
            <Icon name="bell" />
          </button>
          <span className="avatar header-avatar" aria-hidden="true">ST</span>
          <span className="header-user">
            <strong>Support team</strong>
            <small>Shared workspace</small>
          </span>
          <Icon name="chevron" size={14} />
        </div>
      </div>
      <Link className="mobile-header-search" href="/" aria-label="Search tickets">
        <Icon name="search" size={17} />
        <span>Search tickets...</span>
        <kbd>⌘ K</kbd>
      </Link>
    </header>
  );
}

export function Breadcrumb({ pathname }: { pathname: string }) {
  const ticketId = pathname.match(/^\/tickets\/(\d+)/)?.[1];
  const isEdit = pathname.endsWith('/edit');
  const items = ticketId
    ? ['Support Desk', 'Tickets', `TICKET-${ticketId}`, ...(isEdit ? ['Edit'] : [])]
    : pathname === '/tickets/new'
      ? ['Support Desk', 'Tickets', 'New ticket']
      : ['Support Desk', 'Tickets'];

  return (
    <div className="breadcrumb-bar">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {items.map((item, index) => (
          <span className={index === items.length - 1 ? 'current' : ''} key={`${item}-${index}`}>
            {item}
          </span>
        ))}
      </nav>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <AppHeader />
      <Breadcrumb pathname={pathname} />
      <div className="app-content" id="main-content">
        {children}
      </div>
    </div>
  );
}
