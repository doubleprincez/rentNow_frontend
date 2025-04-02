import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";
import Home from "@/features/landing/components/Home";
import ComfortLiving from "@/features/landing/components/ComfortLiving";
import PointContact from "@/features/landing/components/PointContact";
import Reviews from "@/features/landing/components/Reviews";
import BecomeAgent from "@/features/landing/components/BecomeAgent";
import Subscribe from "@/features/landing/components/Subscribe";
import WhatsAppFloater from "./WhatsappFloater";
import { baseURL } from "../../next.config";
import type { ApiResponse } from "@/types/apartment";

const fetchApartments = async (): Promise<ApiResponse | null> => {
    try {
        const response = await fetch(`${baseURL}/apartments`, { cache: "no-store" }); // Avoid caching
        const res = await response.json();
        return res.success ? res : null;
    } catch (error) {
        return null;
    }
};

const Page = async () => {
    const data = await fetchApartments();

    return (
        <WhatsAppFloater>
            <Header />
            <Home />
            {data ? (
                <>
                    <ComfortLiving initialData={data} />
                    <PointContact apartments={data.data.data} />
                </>
            ) : (
                <div className="flex justify-center items-center min-h-screen">
                    <span className="text-red-500">Failed to load apartments.</span>
                </div>
            )}
            <Reviews />
            <BecomeAgent />
            <Subscribe />
            <Footer />
        </WhatsAppFloater>
    );
};

export default Page;
