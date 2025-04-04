import Head from "next/head";


const Metas = ({metadata}: { metadata: any }) => {
    return <>
        <Head>
            <meta name="description" content={metadata?.description ?? ''}/>
            <meta property="og:title" content={metadata?.openGraph?.title ?? ''}/>
            <meta property="og:description" content={metadata?.openGraph?.description ?? ''}/>
            <meta property="og:url" content={metadata?.openGraph?.url ?? ''}/>
            <meta property="og:image" content={metadata?.openGraph?.images[0]?.url ?? ''}/>
            <meta property="og:image:width" content={String(metadata?.openGraph?.images[0]?.width)}/>
            <meta property="og:image:height" content={String(metadata?.openGraph?.images[0]?.height)}/>
            <meta name="twitter:card" content={metadata?.twitter?.card ?? ''}/>
            <meta name="twitter:title" content={metadata?.twitter?.title ?? ''}/>
            <meta name="twitter:description" content={metadata?.twitter?.description ?? ''}/>
            <meta name="twitter:image"
                  content={Object.keys(metadata?.twitter?.images).length > 0 ? metadata.twitter.images[0].url : ''}/>
        </Head>
    </>
}

export default Metas