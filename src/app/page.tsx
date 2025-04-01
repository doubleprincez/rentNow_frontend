import React, {Suspense} from 'react';
import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";
import Home from '@/features/landing/components/Home';
import PropReq from '@/features/landing/components/PropReq';
import Howto from '@/features/landing/components/Howto';
import ComfortLiving from '@/features/landing/components/ComfortLiving';
import PointContact from '@/features/landing/components/PointContact';
import MeetUs from '@/features/landing/components/MeetUs';
import Reviews from '@/features/landing/components/Reviews';
import Subscribe from '@/features/landing/components/Subscribe';
import BecomeAgent from '@/features/landing/components/BecomeAgent';
import WhatsAppFloater from './WhatsappFloater';
import {baseURL} from "../../next.config";
import type {ApiResponse} from "@/types/apartment";
import {Loader} from "lucide-react";
import {CancelIcon} from "@/icons";
import {Button} from "@/components/ui/button";
import Link from "next/link";

const page = async () => {
    let data: ApiResponse = [];

    try {
        const response = await fetch(baseURL + '/apartments');
        const res = await response.json();
        if (!res.success) {
            console.log('false one')
            data = false
        } else {
            data = res;
        }

    } catch (e) {
        console.log('false two', e.message);
        data = false;
    }
    return (
        <WhatsAppFloater>
            <Header/>
            <Home/>
            {/* <PropReq/> */}
            {/* <Howto/> */}
            {/*<Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader*/}
            {/*    className="animate-spin"/>&nbsp;Loading...</div>}>*/}

            {
                data == false ? <div className="flex justify-center items-center min-h-screen">
                        <div>
                        <span className={"flex"}><CancelIcon
                            className=""/>&nbsp;Unable to Load</span> <br/> <Link
                            href={"/"}> Reload</Link></div>
                    </div> :
                    Object.keys(data).length > 0 ? <>
                        <ComfortLiving initialData={data}/>
                        <PointContact apartments={data.data.data}/>
                    </> : <div className="flex justify-center items-center min-h-screen"><Loader
                        className="animate-spin"/>&nbsp;Loading...</div>
            }

            {/*</Suspense>*/}
            {/* <MeetUs/> */}
            <Reviews/>
            <BecomeAgent/>
            <Subscribe/>
            <Footer/>
        </WhatsAppFloater>
    )
}

export default page