import "./globals.css";
import { Rethink_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  variable: "--font-rethink",
});

export const metadata = {
  title: "Fably",
  description: "Embark on a magical journey through stories rooted in ancient cultures and modern imagination.",
  
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${rethinkSans.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
