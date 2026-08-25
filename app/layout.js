import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AtmosphericBackground from "@/components/common/AtmosphericBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "MOBILÉ | Flagship Smartphones & Premium Mobile Store",
    template: "%s | MOBILÉ",
  },
  description: "Explore and buy authentic flagship smartphones from Apple, Samsung, Google, OnePlus, Xiaomi, and Nothing with official warranty and free express delivery across India.",
  keywords: ["Smartphones", "Mobile Phones", "iPhone 16", "Samsung Galaxy S25", "Google Pixel", "OnePlus", "Buy Mobiles Online India"],
  openGraph: {
    title: "MOBILÉ | Premium Smartphone Store",
    description: "Authentic smartphones with manufacturer warranty and free express delivery.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AtmosphericBackground />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
