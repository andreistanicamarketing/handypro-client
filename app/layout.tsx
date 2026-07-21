import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Handy Pro — Il tuo professionista, a portata di mano',
  description:
    'Trova idraulici, elettricisti, muratori e altri professionisti nella tua zona. Recensioni verificate, prenotazione online.',
  metadataBase: new URL('https://handypro.it'),
  openGraph: {
    title: 'Handy Pro — Il tuo professionista, a portata di mano',
    description: 'Trova professionisti affidabili nella tua zona con recensioni verificate.',
    locale: 'it_IT',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAF6F0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="bg-cream text-ink">
        <Providers>
          <Navbar />
          {/* pb-bottom-nav riserva spazio alla bottom nav su mobile */}
          <main className="pb-bottom-nav">{children}</main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
