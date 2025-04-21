import "./globals.css";
import {Providers} from './providers';
import {frontendURL} from "../../next.config";
import Metas from "@/features/metas";
import Script from "next/script";

const img = frontendURL + '/favicon.ico';
export const metadata: any = {
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
        images: [{
            url: frontendURL,
            width: 800,
            height: 600,
            alt: "RentNow.ng",
            type: "image/png",
        }],
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
        <Script id="mcjs"  strategy="afterInteractive"  type="text/javascript"
            dangerouslySetInnerHTML={{
            __html: `!function(c,h,i,m,p){m = c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/0feba5ce7cae39884be450679/7d38f0ddc4c0fa64073bc0bba.js");`}} >
        </Script>
        <Metas metadata={metadata}/>
        <body className="w-full flex flex-col">
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}