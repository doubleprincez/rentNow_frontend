import "./globals.css";
import {Providers} from './providers';
import {Metadata} from 'next';
import {frontendURL} from "../../next.config";
import Head from "next/head";

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

export default function RootLayout({ children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
         <Head>
            <meta name="description" content={metadata?.description}/>
            <meta property="og:title" content={metadata?.openGraph?.title}/>
            <meta property="og:description" content={metadata?.openGraph?.description}/>
            <meta property="og:url" content={metadata?.openGraph?.url}/>
            <meta property="og:image" content={metadata?.openGraph?.images[0]?.url}/>
            <meta property="og:image:width" content={String(metadata?.openGraph?.images[0]?.width)}/>
            <meta property="og:image:height" content={String(metadata?.openGraph?.images[0]?.height)}/>
            <meta name="twitter:card" content={metadata?.twitter?.card}/>
            <meta name="twitter:title" content={metadata?.twitter?.title}/>
            <meta name="twitter:description" content={metadata?.twitter?.description}/>
            <meta name="twitter:image" content={metadata?.twitter?.images&&metadata?.twitter?.images[0]?.url??''}/>
        </Head>
        <body className="w-full flex flex-col">
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}