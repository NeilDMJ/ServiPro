import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ServiPro | Servicios para el hogar",
  description:
    "Plataforma para encontrar, contratar y gestionar servicios para el hogar con profesionales verificados.",
};

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/empresas", label: "Empresas" },
  { href: "/prestadores", label: "Prestadores" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/registro", label: "Acceso" },
  { href: "/contacto", label: "Contacto" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full app-body">
        <div className="site-shell">
          <header className="topbar">
            <div className="container topbar-inner">
              <Link href="/" className="brand" aria-label="Ir al inicio de ServiPro">
                ServiPro
              </Link>
              <nav className="main-nav" aria-label="Navegacion principal">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="topbar-actions">
                <Link href="/cuenta" className="nav-link">
                  Mi cuenta
                </Link>
                <Link href="/registro/cliente" className="cta-link">
                  Crear cuenta
                </Link>
              </div>
            </div>
          </header>
          <main className="main-content">{children}</main>
          <footer className="site-footer">
            <div className="container footer-grid">
              <div>
                <p className="footer-title">ServiPro</p>
                <p className="footer-copy">
                  Servicios para el hogar con estandar profesional, soporte y seguimiento en una sola plataforma.
                </p>
              </div>
              <div>
                <p className="footer-title">Explorar</p>
                <ul className="footer-list">
                  <li>
                    <Link href="/servicios">Categorias</Link>
                  </li>
                  <li>
                    <Link href="/prestadores">Equipo</Link>
                  </li>
                  <li>
                    <Link href="/como-funciona">Flujo de trabajo</Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="footer-title">Atencion</p>
                <ul className="footer-list">
                  <li>
                    <Link href="/contacto">Agenda una llamada</Link>
                  </li>
                  <li>
                    <a href="mailto:contacto@servipro.local">contacto@servipro.local</a>
                  </li>
                  <li>
                    <a href="tel:+525500000000">+52 55 0000 0000</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="container footer-bottom">
              <small>(c) {new Date().getFullYear()} ServiPro. Todos los derechos reservados.</small>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
