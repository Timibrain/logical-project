import type { Metadata } from "next";
import { Barlow, Source_Sans_3, Space_Mono } from "next/font/google";
import "./globals.css";

// Barlow — clean corporate sans-serif, closest freely available match to Wells Fargo Sans
const barlow = Barlow({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    style: ["normal"],
    variable: "--font-barlow",
});

// Source Sans 3 — body text (humanist sans-serif, very close to WF body font)
const sourceSans = Source_Sans_3({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-source-sans",
});

// Monospace for account numbers / codes
const spaceMono = Space_Mono({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "West Bank — Secure Banking",
    description: "Private client banking powered by West Bank.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`
                    ${barlow.variable}
                    ${sourceSans.variable}
                    ${spaceMono.variable}
                    font-sans
                `}
            >
                {children}
            </body>
        </html>
    );
}
