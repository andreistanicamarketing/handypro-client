import type { Metadata, Viewport } from 'next';
// Leaflet qui e non in MapView: importato dal componente non veniva incluso in tutte le pagine
import 'leaflet/dist/leaflet.css';
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
  // iOS ingrandisce la pagina al focus degli input <16px (la ricerca usa 14–15px)
  maximumScale: 1,
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
          {/* pb-bottom-nav riserva spazio alla tab bar flottante su mobile */}
          <main className="pb-bottom-nav md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
