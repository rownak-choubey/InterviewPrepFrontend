import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProgressProvider } from '@/context/ProgressContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Meru Data — Interview Mastery Blueprint',
  description: 'A comprehensive, interactive roadmap for cracking the Meru Data interview.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ProgressProvider>
              <Navbar />
              {children}
              <Footer />
            </ProgressProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
