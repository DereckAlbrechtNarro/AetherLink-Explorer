import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AetherLink Explorer | Off-Grid Connectivity',
  description: 'Stay connected anywhere on Earth. Satellite kits, rugged power & adventure gear.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-linear-to-br from-gray-50 to-gray-100 text-gray-800 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}