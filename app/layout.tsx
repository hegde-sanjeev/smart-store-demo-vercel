import type { Metadata } from 'next';
import './globals.css';
import DragScroll from '@/components/DragScroll';

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
          cursor: 'grab',
        }}
      >
        <DragScroll />
        {children}
      </body>
    </html>
  );
}
