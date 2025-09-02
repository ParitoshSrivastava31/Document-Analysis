import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Paper Analysis",
  description: "Turn any article/URL/PDF into evidence-backed summaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Paper Analysis
              </h1>
              <p className="text-gray-600">
                Evidence-backed summaries with interactive reasoning trails
              </p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
