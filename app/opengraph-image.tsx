// Anteprima link condivisi (WhatsApp, Instagram, Telegram…): logo esteso + claim.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Handy Pro — Il tuo professionista, a portata di mano';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  // Stesso file del kit logo (logo-dp/logo-esteso/handypro-colore.svg)
  const svg = await readFile(join(process.cwd(), 'app/handypro-colore.svg'));
  const logo = `data:image/svg+xml;base64,${svg.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF6F0',
          color: '#152238',
        }}
      >
        <img src={logo} width={640} height={121} alt="" />
        <div style={{ marginTop: 56, fontSize: 44, fontWeight: 700 }}>
          Il tuo professionista, a portata di mano
        </div>
        <div style={{ marginTop: 16, fontSize: 30, color: '#5C6B82' }}>
          Recensioni verificate da lavori reali
        </div>
      </div>
    ),
    size
  );
}
