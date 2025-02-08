'use client'
import React, { useEffect, useState } from 'react';
import { Tabs, TabsTrigger, TabsContent, TabsList } from '@/components/ui/tabs';
import Image from 'next/image';
import { Banknote, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Apartment, ApiResponse } from '@/types/apartment';
import House from '@/components/assets/house1.jpeg';
import House2 from '@/components/assets/house2.jpeg';
import House3 from '@/components/assets/house3.jpeg';
import House4 from '@/components/assets/house4.jpeg';
import House5 from '@/components/assets/house5.jpeg';

const tabs = [
    {image:House},
    {image:House2},
    {image:House3},
    {image:House4},
    {image:House5},
    {image:House},
]

const ApartmentCard = ({ apartment, onClick }: { apartment: Apartment, onClick: (apartment: Apartment) => void }) => (
    <div 
        className='flex flex-col gap-4 p-2 md:p-4 bg-white shadow-md rounded-2xl cursor-pointer hover:shadow-lg transition-shadow'
        onClick={() => onClick(apartment)}
    >
        <div className='flex flex-col gap-2'>
            <div className='flex w-full h-[150px] mdl:h-[200px] rounded-lg overflow-hidden'>
                <img 
                    src={Object.values(apartment.images)[0]?.preview_url || '/placeholder.jpg'}
                    alt={apartment.title} 
                    className='w-full h-full object-cover'
                />
            </div>
            <div className='flex flex-col gap-2'>
                <p className='text-[.9em] mdl:text-[1.2em] font-semibold text-gray-700'>{apartment.title}</p>
                <div className='flex items-center gap-2'>
                    <MapPin className='text-orange-500' size={16}/>
                    <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{`${apartment.city_code}, ${apartment.country_code}`}</p>
                </div>
                <div className='flex items-center gap-2'>
                    <Banknote className='text-orange-500' size={16}/>
                    <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apartment.amount}</p>
                </div>
            </div>
        </div>
    </div>
);

const ComfortLiving = ({ initialData }: { initialData?: ApiResponse }) => {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [categories, setCategories] = useState<Array<{ value: string, tabImage: typeof House }>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(!initialData);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (initialData) {
            setApartments(initialData.data.data);
            const uniqueCategories = [...new Set(initialData.data.data.map(apt => apt.category))];
            processCategories(uniqueCategories);
            return;
        }

        const fetchApartments = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/apartments');
                const data: ApiResponse = await response.json();
                if (data.success) {
                    setApartments(data.data.data);
                    const uniqueCategories = [...new Set(data.data.data.map(apt => apt.category))];
                    processCategories(uniqueCategories);
                } else {
                    setError(data.message || 'Failed to fetch apartments');
                }
            } catch (error) {
                setError('Failed to fetch apartments');
                console.error('Error fetching apartments:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApartments();
    }, [initialData]);

    const processCategories = (uniqueCategories: string[]) => {
        // Shuffle and limit to 5 categories, assigning images from tabs array
        const shuffledCategories = uniqueCategories
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
            .map((category, index) => ({
                value: category,
                tabImage: tabs[index % tabs.length].image // Cycle through tab images
            }));
        setCategories(shuffledCategories);
    };


    const handleApartmentClick = (apartment: Apartment) => {
        const encodedData = encodeURIComponent(JSON.stringify(apartment));
        router.push(`/find-homes/${apartment.id}?data=${encodedData}`);
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading apartments...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className='w-full px-4 py-10 flex flex-col gap-2 md:gap-4 items-center justify-center bg-gray-100 overflow-hidden'>
            <h1 className='text-[.7em] md:text-[.8em] font-bold text-orange-500'>STYLE OF LIVING</h1>
            <p className='text-gray-700 text-[1.3em] text-center md:text-start md:text-[2em] font-semibold'>
                Comfort Living Solution
            </p>
            
            <Tabs defaultValue='all' className='w-full py-3 md:py-5 flex flex-col gap-8'>
                <TabsList className='w-full flex gap-4'>
                    <div className="w-[800px] py-4 mx-auto flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar md:justify-center">
                        <TabsTrigger value='all' className='p-2 flex gap-2 shadow-md'>
                            <div className='flex w-7 md:w-10 h-7 md:h-10 rounded-lg overflow-hidden'>
                                <Image src={tabs[0].image} alt="All Properties" className='w-full h-full object-cover'/>
                            </div>
                            <span className='text-[.7em] md:text-[.9em]'>All Properties</span>
                        </TabsTrigger>
                        {categories.map((category, index) => (
                            <TabsTrigger key={index} value={category.value} className='p-2 flex gap-2 shadow-md'>
                                <div className='flex w-7 md:w-10 h-7 md:h-10 rounded-lg overflow-hidden'>
                                    <Image src={category.tabImage} alt={category.value} className='w-full h-full object-cover'/>
                                </div>
                                <span className='text-[.7em] md:text-[.9em]'>{category.value}</span>
                            </TabsTrigger>
                        ))}
                    </div>
                </TabsList>

                <TabsContent value='all'>
                    <div className='w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                        {apartments.slice(0, 10).map((apt) => (
                            <ApartmentCard 
                                key={apt.id} 
                                apartment={apt} 
                                onClick={handleApartmentClick}
                            />
                        ))}
                    </div>
                </TabsContent>

                {categories.map((category) => (
                    <TabsContent key={category.value} value={category.value}>
                        <div className='w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                            {apartments
                                .filter((apt) => apt.category === category.value)
                                .slice(0, 10)
                                .map((apt) => (
                                    <ApartmentCard 
                                        key={apt.id} 
                                        apartment={apt} 
                                        onClick={handleApartmentClick}
                                    />
                                ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default ComfortLiving;

// 'use client'
// import React from 'react';
// import { Tabs, TabsTrigger, TabsContent, TabsList } from '@/components/ui/tabs';
// import House from '@/components/assets/house1.jpeg';
// import House2 from '@/components/assets/house2.jpeg';
// import House3 from '@/components/assets/house3.jpeg';
// import House4 from '@/components/assets/house4.jpeg';
// import House5 from '@/components/assets/house5.jpeg';
// import Image from 'next/image';
// import { Banknote, Map, MapPin } from 'lucide-react';

// const ComfortLiving = () => {
//     const tabslist = [
//         {
//             value: 'all',
//             img: House,
//             label: 'All Apartments'
//         },
//         {
//             value: 'flats',
//             img: House2,
//             label: 'Flats'
//         },
//         {
//             value: 'shortlets',
//             img: House3,
//             label: 'Shortlets'
//         },
//         {
//             value: 'villas',
//             img: House4,
//             label: 'Villas'
//         },
//         {
//             value: 'commercial',
//             img: House5,
//             label: 'Commercial'
//         },
//     ]

//     const aptdatails = [
//         {
//             title: '3 Bedroom Apartment',
//             img: House,
//             location: 'Lagos, Nigeria',
//             price: 'N800,000',
//         },
//         {
//             title: '2 Bedroom Apartment',
//             img: House2,
//             location: 'Ibadan, Nigeria',
//             price: 'N600,000',
//         },
//         {
//             title: '4 Bedroom Apartment',
//             img: House4,
//             location: 'Lagos, Nigeria',
//             price: 'N1,500,000',
//         },
//         {
//             title: '3 Bedroom Apartment',
//             img: House5,
//             location: 'Abuja, Nigeria',
//             price: 'N800,000',
//         },
//     ]

//     const flatsdatails = [
//         {
//             title: '4 Bedroom Apartment',
//             img: House4,
//             location: 'Lagos, Nigeria',
//             price: 'N1,500,000',
//         },
//         {
//             title: '3 Bedroom Apartment',
//             img: House5,
//             location: 'Abuja, Nigeria',
//             price: 'N800,000',
//         },
//         {
//             title: '3 Bedroom Apartment',
//             img: House,
//             location: 'Lagos, Nigeria',
//             price: 'N800,000',
//         },
//         {
//             title: '2 Bedroom Apartment',
//             img: House2,
//             location: 'Ibadan, Nigeria',
//             price: 'N600,000',
//         },
//     ]

//   return (
//     <div className='w-full px-4 py-10 flex flex-col gap-2 md:gap-4 items-center justify-center bg-gray-100 overflow-hidden'>
//         <h1 className='text-[.7em] md:text-[.8em] font-bold text-orange-500'>STYLE OF LIVING</h1>
//         <p className='text-gray-700 text-[1.3em] text-center md:text-start md:text-[2em] font-semibold'>
//             Comfort Living Solution
//         </p>
        
//         <Tabs defaultValue='all' className='w-full py-3 md:py-5 flex flex-col gap-8'>
//             <TabsList className='w-full flex gap-4'>
//                 <div className="w-[800px] py-4 mx-auto flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar md:justify-center">
//                     {tabslist.map((tab, index) => (
//                         <TabsTrigger key={index} value={tab.value} className='p-2 flex gap-2 shadow-md'>
//                             <div className='flex w-7 md:w-10 h-7 md:h-10 rounded-lg overflow-hidden'>
//                                 <Image src={tab.img} alt={tab.label} className='w-full h-full object-cover'/>
//                             </div>
//                             <span className='text-[.7em] md:text-[.9em]'>{tab.label}</span>
//                         </TabsTrigger>
//                     ))}
//                 </div>
//             </TabsList>

//             <TabsContent value='all'>
//                 <div className='w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
//                     {aptdatails.map((apt, index) => (
//                         <div key={index} className='flex flex-col gap-4 p-2 md:p-4 bg-white shadow-md rounded-2xl'>
//                             <div className='flex flex-col gap-2'>
//                                 <div className='flex w-full h-[150px] mdl:h-[200px] rounded-lg overflow-hidden'>
//                                     <Image src={apt.img} alt={apt.title} className='w-full h-full object-cover'/>
//                                 </div>
//                                 <div className='flex flex-col gap-2'>
//                                     <p className='text-[.9em] mdl:text-[1.2em] font-semibold text-gray-700'>{apt.title}</p>
//                                     <div className='flex items-center gap-2'>
//                                         <MapPin className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.location}</p>
//                                     </div>
//                                     <div className='flex items-center gap-2'>
//                                         <Banknote className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.price}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </TabsContent>

//             <TabsContent value='flats'>
//                 <div className='w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
//                     {flatsdatails.map((apt, index) => (
//                         <div key={index} className='flex flex-col gap-4 p-2 md:p-4 bg-white shadow-md rounded-2xl'>
//                             <div className='flex flex-col gap-2'>
//                                 <div className='flex w-full h-[150px] mdl:h-[200px] rounded-lg overflow-hidden'>
//                                     <Image src={apt.img} alt={apt.title} className='w-full h-full object-cover'/>
//                                 </div>
//                                 <div className='flex flex-col gap-2'>
//                                     <p className='text-[.9em] mdl:text-[1.2em] font-semibold text-gray-700'>{apt.title}</p>
//                                     <div className='flex items-center gap-2'>
//                                         <MapPin className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.location}</p>
//                                     </div>
//                                     <div className='flex items-center gap-2'>
//                                         <Banknote className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.price}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </TabsContent>

//             <TabsContent value='shortlets'>
//                 <div className='w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
//                     {aptdatails.map((apt, index) => (
//                         <div key={index} className='flex flex-col gap-4 p-2 md:p-4 bg-white shadow-md rounded-2xl'>
//                             <div className='flex flex-col gap-2'>
//                                 <div className='flex w-full h-[150px] mdl:h-[200px] rounded-lg overflow-hidden'>
//                                     <Image src={apt.img} alt={apt.title} className='w-full h-full object-cover'/>
//                                 </div>
//                                 <div className='flex flex-col gap-2'>
//                                     <p className='text-[.9em] mdl:text-[1.2em] font-semibold text-gray-700'>{apt.title}</p>
//                                     <div className='flex items-center gap-2'>
//                                         <MapPin className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.location}</p>
//                                     </div>
//                                     <div className='flex items-center gap-2'>
//                                         <Banknote className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.price}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </TabsContent>

//             <TabsContent value='villas'>
//                 <div className='w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
//                     {aptdatails.map((apt, index) => (
//                         <div key={index} className='flex flex-col gap-4 p-2 md:p-4 bg-white shadow-md rounded-2xl'>
//                             <div className='flex flex-col gap-2'>
//                                 <div className='flex w-full h-[150px] mdl:h-[200px] rounded-lg overflow-hidden'>
//                                     <Image src={apt.img} alt={apt.title} className='w-full h-full object-cover'/>
//                                 </div>
//                                 <div className='flex flex-col gap-2'>
//                                     <p className='text-[.9em] mdl:text-[1.2em] font-semibold text-gray-700'>{apt.title}</p>
//                                     <div className='flex items-center gap-2'>
//                                         <MapPin className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.location}</p>
//                                     </div>
//                                     <div className='flex items-center gap-2'>
//                                         <Banknote className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.price}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </TabsContent>

//             <TabsContent value='commercial'>
//                 <div className='w-full grid grid-cols-1 sml:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
//                     {aptdatails.map((apt, index) => (
//                         <div key={index} className='flex flex-col gap-4 p-2 md:p-4 bg-white shadow-md rounded-2xl'>
//                             <div className='flex flex-col gap-2'>
//                                 <div className='flex w-full h-[150px] mdl:h-[200px] rounded-lg overflow-hidden'>
//                                     <Image src={apt.img} alt={apt.title} className='w-full h-full object-cover'/>
//                                 </div>
//                                 <div className='flex flex-col gap-2'>
//                                     <p className='text-[.9em] mdl:text-[1.2em] font-semibold text-gray-700'>{apt.title}</p>
//                                     <div className='flex items-center gap-2'>
//                                         <MapPin className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.location}</p>
//                                     </div>
//                                     <div className='flex items-center gap-2'>
//                                         <Banknote className='text-orange-500'/>
//                                         <p className='text-[.7em] mdl:text-[.9em] text-gray-600'>{apt.price}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </TabsContent>
//         </Tabs>

//     </div>
//   )
// }

// export default ComfortLiving