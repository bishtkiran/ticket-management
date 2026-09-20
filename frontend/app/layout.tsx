import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ticket Management',
  description: 'Support ticket management dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
