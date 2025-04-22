export const dynamic = "force-dynamic";

import Footer from "@/features/landing/components/Footer";
import Header from "@/features/landing/components/Header";
import Subscribe from "@/features/landing/components/sections/Subscribe";
import {baseURL} from "@/../next.config";
import {PlansInterface} from "@/types/subscription";
import React, {Suspense} from "react";
import {Loader} from "lucide-react";


const Page = async () => {
    const response = await fetch(baseURL + '/plans');
    const json = await response.json();
    const data: PlansInterface[] = json.data.data;

    return <>
        <div>
            <Header/>
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader
                className="animate-spin"/>&nbsp;Loading...</div>}>
                {data && <Subscribe plans={data}/>}
            </Suspense>
            <Footer/>
        </div>

    </>

}

export default Page;