import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppButton from '@/components/WhatsAppButton';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Chamba Fija | Pasco",
  description: "Encuentra tu próxima chamba en Cerro de Pasco",
  icons: {
    icon: "/icon.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex flex-col antialiased">
        
        {/* Contenido principal de la página */}
        {children}

        {/* 2. Botón flotante global con rebote y pulsaciones */}
        <WhatsAppButton />

      </body>
    </html>
  );
}