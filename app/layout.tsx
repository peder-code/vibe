import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viral24',
  description: 'Most viral videos from the last 24 hours.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
