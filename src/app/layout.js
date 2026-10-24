import { Inter } from 'next/font/google';
import './globals.css';
import DragDropProvider from '@/components/dnd/DragDropProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata = {
  title: 'After the Event',
  description: 'Turn events and meetings into meaningful notes, clear actions, and thoughtful follow-ups.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-ink font-sans text-white antialiased">
        <DragDropProvider>{children}</DragDropProvider>
      </body>
    </html>
  );
}
