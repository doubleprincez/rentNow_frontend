import Header from "@/features/landing/components/Header";
import Footer from "@/features/landing/components/Footer";
import Home from "@/features/landing/components/Home";
import ComfortLiving from "@/features/landing/components/ComfortLiving";
import PointContact from "@/features/landing/components/PointContact";
import Reviews from "@/features/landing/components/Reviews";
import BecomeAgent from "@/features/landing/components/BecomeAgent";
import Subscribe from "@/features/landing/components/Subscribe";
import WhatsAppFloater from "./WhatsappFloater";
import {baseURL} from "../../next.config";

export const dynamic = 'force-dynamic';

async function getInitialApartments() {
    try {
        const response = await fetch(`${baseURL}/apartments`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
        });
        const data = await response.json();
        
        if (data.success && data.data?.data) {
            // Filter sensitive data
            const filtered = data.data.data.map((apt: any) => ({
                id: apt.id,
                category: apt.category,
                country_code: apt.country_code,
                state_code: apt.state_code,
                city_code: apt.city_code,
                title: apt.title,
                description: apt.description,
                amount: apt.amount,
                duration: apt.duration,
                images: apt.images,
                created_at: apt.created_at,
            }));
            
            const categories = [...new Set(filtered.map((a: any) => a.category))].filter(Boolean) as string[];
            const states = [...new Set(filtered.map((a: any) => a.state_code))].filter(Boolean) as string[];
            
            return {
                apartments: filtered,
                categories,
                states,
            };
        }
    } catch (error) {
        console.error('Server fetch error:', error);
    }
    
    return { apartments: [], categories: [], states: [] };
}

const Page = async () => {
    const initialData = await getInitialApartments();
    
    return (
        <WhatsAppFloater>
            <Header/>
            <Home initialData={initialData} />
            <ComfortLiving apartments={initialData.apartments} />
            <PointContact apartments={initialData.apartments} />
            <Reviews/>
            <BecomeAgent/>
            <Subscribe/>
            <Footer/>
        </WhatsAppFloater>
    );
};

export default Page;
