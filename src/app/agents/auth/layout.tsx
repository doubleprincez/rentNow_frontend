'use client'
import Header from "@/features/agent/landing/AgentHeader";
import Footer from "@/features/landing/components/Footer";
import Bg from '@/components/assets/agent2.jpeg';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full">
        <Header/>
        <div 
        style={{ 
            backgroundImage: `url(${Bg.src})`,
            backgroundSize: 'cover', 
        }}
        className="w-full h-full py-10 md:py-20 flex justify-center items-center"
        >
            <div className="md:mt-10 w-full h-full px-4 py-4 max-w-[300px] md:max-w-[500px] bg-white rounded-lg">
                {children}
            </div>   
        </div>      
        <Footer/>
    </div>
  );
}
