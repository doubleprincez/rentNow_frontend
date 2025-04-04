import "./globals.css";
import {Providers} from './providers';
import {Metadata} from 'next';
import {frontendURL} from "../../next.config";

const img = frontendURL + '/favicon.ico';
export const metadata: Metadata = {
    url: frontendURL,
    siteName: "RentNow.ng",
    title: "Welcome to Rent Now",
    description: "Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria",
    openGraph: {
        url: frontendURL,
        title: 'Welcome to Rent Now',
        description: "Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria",
        images: [
            {
                url: img,
                width: 800,
                height: 600,
                alt: 'RentNow.ng',
                type: 'image/png',
            },

        ],
        siteName: "RentNow.ng",
    }

}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">

        <body className="w-full flex flex-col">
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}