import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapClient from "../components/BootstrapClient"; // Componente cliente para cargar JS de Bootstrap
import "bootstrap-icons/font/bootstrap-icons.css";
import { BackgroundProvider } from "@/context/BackgroundContext";
import { ToastProvider } from "@/components/ToastProvider"; // Importa el ToastProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PrettyNails", // Cambia el título aquí
  description: "Gestión de clientes y citas para PrettyNails.",
  icons: {
    icon: "/favicon2.ico", // Ruta al archivo de ícono
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
  rel="stylesheet"
/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackgroundProvider>
          <ToastProvider> {/* Proveedor de Toasts */}
            <BootstrapClient>{children}</BootstrapClient>
          </ToastProvider>
        </BackgroundProvider>
      </body>
    </html>
  );
}
