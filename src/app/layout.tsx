import "./globals.css";
import {Providers} from './providers';
import {Metadata} from 'next';
import {frontendURL} from "../../next.config";
import Metas from "@/features/metas";

const img = frontendURL + '/favicon.ico';
export const metadata: Metadata = {
    title: "Welcome to Rent Now",
    description: "Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria",
    siteName: "RentNow.ng",
    openGraph: {
        url: frontendURL,
        title: "Welcome to Rent Now",
        description: "Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria",
        images: [
            {
                url: img,
                width: 800,
                height: 600,
                alt: "RentNow.ng",
                type: "image/png",
            },
        ],
        siteName: "RentNow.ng",
    },
    twitter: {
        card: "summary_large_image", // Best card for large images
        site: "@RentNowNG", // Twitter handle
        title: "Welcome to Rent Now",
        description: "Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria",
        image: img,
    },
    robots: {
        index: true,
        follow: true, // Allow search engines to follow links
    },
}

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <Metas metadata={metadata}/>
        <body className="w-full flex flex-col">
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}