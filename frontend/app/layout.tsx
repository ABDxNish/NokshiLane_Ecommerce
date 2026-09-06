import type {
  Metadata,
} from 'next';

import {
  Inter,
  Playfair_Display,
} from 'next/font/google';

import './globals.css';

import {
  AuthProvider,
} from '@/components/AuthProvider';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import RealtimeNotifications from '@/components/RealtimeNotifications';


const inter =
  Inter({
    subsets: [
      'latin',
    ],

    variable:
      '--font-inter',
  });


const playfair =
  Playfair_Display({
    subsets: [
      'latin',
    ],

    variable:
      '--font-playfair',
  });


export const metadata:
  Metadata = {
    title:
      'NokshiLane — Fashion & Lifestyle',

    description:
      'A modern Bangladesh-focused fashion and lifestyle e-commerce platform.',
  };


export default function RootLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={
        `${inter.variable} ${playfair.variable}`
      }
    >
      <body>
        <AuthProvider>
          <Navbar />

          <RealtimeNotifications />

          <main>
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}