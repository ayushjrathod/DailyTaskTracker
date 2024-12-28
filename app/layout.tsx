import { ThemeSwitch } from "@/components/theme-switch";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "dailydoer",
  description: "Track your daily tasks and boost productivity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.className}`}>
        <Providers themeProps={{ attribute: "class" }}>
          <div className="relative flex flex-col min-h-screen">
            <div className="fixed bottom-6 right-6 z-50">
              <div className="p-3 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <ThemeSwitch />
              </div>
            </div>
            <main className="container mx-auto flex flex-col items-center justify-center flex-grow">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
