import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/* ── Google Fonts  */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

/* ── Metadata */
export const metadata: Metadata = {
  title:
    "Tokenization Compatibility and Model Specialization for Zero-Shot Cross-Lingual Transfer in Disaster-Response Tweet Classification on Edge Hardware",
  description:
    "A tokenizer walkthrough comparing how seven different NLP tokenizers handle disaster tweets in Hindi, Bengali, Tamil, Telugu, Malayalam, and Marathi.",
  keywords: [
    "NLP",
    "tokenizer",
    "disaster response",
    "multilingual",
    "MuRIL",
    "BERT",
    "crisis classification",
    "Indic languages",
  ],
};

/* ── Root Layout  */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-[#0E1416] text-[#E9EDEC] font-body antialiased">
        {children}
      </body>
    </html>
  );
}
