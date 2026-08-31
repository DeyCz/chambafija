import './globals.css';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  metadataBase: new URL('https://chambafija.vercel.app'),
  title: {
    default: 'Chamba Fija Pasco | Empleos y Convocatorias en Cerro de Pasco',
    template: '%s | Chamba Fija Pasco',
  },
  description: 'Bolsa de trabajo en Cerro de Pasco. Encuentra empleos en el sector privado y convocatorias públicas del Estado (DIRESA, DRE, GORE) de forma directa.',
  keywords: [
    'Chamba Fija',
    'Cerro de Pasco',
    'Empleos Pasco',
    'Trabajo Cerro de Pasco',
    'Convocatorias CAS Pasco',
    'DIRESA Pasco',
    'GORE Pasco',
    'Bolsa de trabajo Pasco',
  ],
  authors: [{ name: 'Chamba Fija Pasco' }],
  creator: 'Chamba Fija',
  publisher: 'Chamba Fija',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Chamba Fija Pasco | Bolsa de Trabajo y Convocatorias',
    description: 'Encuentra las mejores oportunidades laborales del sector privado y procesos oficiales del Estado en Cerro de Pasco.',
    url: 'https://chambafija.vercel.app',
    siteName: 'Chamba Fija Pasco',
    images: [
      {
        url: 'https://chambafija.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chamba Fija Pasco - Empleos y Convocatorias',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chamba Fija Pasco | Empleos en Cerro de Pasco',
    description: 'Encuentra ofertas laborales del sector privado y convocatorias del Estado en Cerro de Pasco.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">

      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex flex-col antialiased">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}