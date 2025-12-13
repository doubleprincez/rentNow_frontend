import "./globals.css";
import {Providers} from './providers';
import {frontendURL} from "../../next.config";
import Metas from "@/features/metas";
import Script from "next/script";

const img = frontendURL + '/uploads/logo.png';
export const metadata: any = {
    title: "Welcome to Rent Now - Find Your Perfect Home in Nigeria",
    description: "Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria. Browse thousands of properties available for rent.",
    siteName: "RentNow.ng",
    openGraph: {
        type: 'website',
        url: frontendURL,
        title: "Welcome to Rent Now - Find Your Perfect Home in Nigeria",
        description: "Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria. Browse thousands of properties available for rent.",
        siteName: "RentNow.ng",
        locale: 'en_NG',
        images: [
            {
                url: img,
                width: 1200,
                height: 630,
                alt: "RentNow.ng - Find Your Perfect Home",
                type: "image/png",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@RentNowNG",
        title: "Welcome to Rent Now - Find Your Perfect Home in Nigeria",
        description: "Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria. Browse thousands of properties available for rent.",
        images: [img],
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: frontendURL,
    },
}

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <Script id="mcjs" dangerouslySetInnerHTML={{
            __html: `!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/0feba5ce7cae39884be450679/7d38f0ddc4c0fa64073bc0bba.js");`}} >
        </Script>
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3051384019314375"
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
        <Metas metadata={metadata}/>
        <body className="w-full flex flex-col">
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}