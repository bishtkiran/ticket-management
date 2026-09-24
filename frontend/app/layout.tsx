import './globals.css';
import type { Metadata } from 'next';
import AppShell from '@/app/components/AppShell';

export const metadata: Metadata = {
  title: 'Support Desk',
  description: 'Support ticket management workspace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
