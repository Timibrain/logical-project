import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, Space_Mono } from "next/font/google";
import "./globals.css";

// Wells Fargo brand fonts (closest Google Fonts equivalents)
// Playfair Display ≈ Wells Fargo's proprietary serif display font
const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
    variable: "--font-playfair",
});

// Source Sans 3 ≈ Wells Fargo Sans (clean humanist sans-serif)
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
                    ${playfairDisplay.variable}
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
