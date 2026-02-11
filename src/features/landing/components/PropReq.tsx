'use client'
import React, { useRef, TouchEvent } from 'react';
import { 
    House, 
    ChevronLeft, 
    ChevronRight, 
    Castle, 
    Building, 
    Building2, 
    Hotel, 
    Warehouse 
} from 'lucide-react';


const PropReq: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 220; 
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        if (scrollRef.current) {
            scrollRef.current.dataset.startX = e.touches[0].clientX.toString();
        }
    };

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        const startX = scrollRef.current?.dataset.startX;
        if (startX) {
            const currentX = e.touches[0].clientX;
            const diffX = parseFloat(startX) - currentX;

            if (Math.abs(diffX) > 30) {
                scroll(diffX > 0 ? "right" : "left");
                scrollRef.current!.dataset.startX = ""; 
            }
        }
    };
    
    const data = [
        {
            icon: House,
            title: 'Apartment',
            participants: '4',
        },
        {
            icon: Hotel,
            title: 'Commercial',
            participants: '20',
        },
        {
            icon: Warehouse,
            title: 'Sales Shop',
            participants: '4',
        },
        {
            icon: Building2,
            title: 'Township',
            participants: '50',
        },
        {
            icon: Building,
            title: 'Villa',
            participants: '15',
        },
        {
            icon: Castle,
            title: 'Shortlet',
            participants: '4',
        },
    ]

  return (
    <div className='px-2 md:px-4 py-10 flex flex-col gap-2 md:gap-4 items-center justify-center bg-gray-100'>
        <h1 className='text-[.7em] md:text-[.8em] font-bold text-orange-500'>CURRENTLY LETTING</h1>
        <p className='text-gray-700 text-[1.3em] text-center md:text-[2em] font-semibold'>
            Search by Property Requirement
        </p>

        <div className="relative w-full flex items-center py-2 md:py-4">
            <button
                onClick={() => scroll("left")}
                className="absolute hidden md:flex left-0 md:left-10 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                aria-label="Scroll Left"
            >
                <ChevronLeft className="w-5 md:w-8 h-5 md:h-8 text-gray-600" />
            </button>

            <div
                ref={scrollRef}
                className="w-[800px] py-4 mx-auto flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                {data.map((item, index) => (
                    <div
                    key={index}
                    className="min-w-[120px] md:min-w-[180px] p-2 md:p-4 flex flex-col gap-2 items-start justify-center bg-white rounded-xl md:rounded-3xl overflow-hidden shadow-lg"
                    >
                        <div className="w-14 md:w-20 h-14 md:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                            <item.icon className='w-5 h-5 md:w-6 md:h-6'/>
                        </div>
                        <p className="text-[.8em] md:text-[1em] text-gray-700 font-semibold">
                            {item.title}
                        </p>
                        <p className="text-[.7em] md:text-[.8em] text-gray-600 font-semibold">
                            {item.participants} Participants
                        </p>
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll("right")}
                className="absolute hidden md:flex right-0 md:right-10 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                aria-label="Scroll Right"
            >
                <ChevronRight className="w-5 md:w-8 h-5 md:h-8 text-gray-600" />
            </button>
        </div>
    </div>
  )
}

export default PropReq;