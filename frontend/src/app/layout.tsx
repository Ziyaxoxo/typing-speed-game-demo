import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/auth-context';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'TypingSpeed | 20-Character Speed Challenge',
  description: 'Test your typing speed dexterity with 20 random alphabet sequences, real-time timer, penalty calculations, and global leaderboards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Typing Speed Game Application • Burdenoff Product Engineering Intern Take-Home</p>
              <p>© 2026 Full-Stack GraphQL Yoga & Bun Runtime</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
