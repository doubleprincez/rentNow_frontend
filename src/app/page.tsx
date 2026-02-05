import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";
import Home from "@/features/landing/components/Home";
import ComfortLiving from "@/features/landing/components/ComfortLiving";
import PointContact from "@/features/landing/components/PointContact";
import Reviews from "@/features/landing/components/Reviews";
import BecomeAgent from "@/features/landing/components/BecomeAgent";
import Subscribe from "@/features/landing/components/Subscribe";
import WhatsAppFloater from "./WhatsappFloater";
import {baseURL, frontendURL} from "../../next.config";
import type {ApiResponse} from "@/types/apartment";
import {NextSeo} from "next-seo";

const Page = async () => {
    return (
        <WhatsAppFloater>
            <Header/>
            <Home/>
            <ComfortLiving />
            <PointContact />
            <Reviews/>
            <BecomeAgent/>
            <Subscribe/>
            <Footer/>
        </WhatsAppFloater>
    );
};

export default Page;
