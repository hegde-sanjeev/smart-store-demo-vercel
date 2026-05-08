import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniRetail — Connected Store Experience',
  description: 'Real-time connected retail demo for Innovation Lab.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      </head>
      <body 
        className='min-h-screen'
        style={{
          touchAction: 'pan-y',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitOverflowScrolling: 'touch' as any,
        }}
        >{children}</body>
    </html>
  );
}
