'use client'
import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/variants';
import { HomeIcon, Star, Target } from "lucide-react";
import House from '@/components/assets/house1.jpeg';
import House2 from '@/components/assets/house2.jpeg';
import House3 from '@/components/assets/house4.jpeg';
import House4 from '@/components/assets/house5.jpeg';

const Home: React.FC = () => {
    const images = [
        House,
        House2,
        House3,
        House4
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<boolean[]>(new Array(images.length).fill(false));
    const [isReady, setIsReady] = useState(false);

    // Preload images
    useEffect(() => {
        const imagePromises = images.map((image, index) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = image.src;
                img.onload = () => {
                    setLoadedImages(prev => {
                        const newState = [...prev];
                        newState[index] = true;
                        return newState;
                    });
                    resolve(true);
                };
            });
        });

        Promise.all(imagePromises).then(() => {
            setIsReady(true);
        });
    }, []);

    // Start slideshow only when images are loaded
    useEffect(() => {
        if (!isReady) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isReady, images.length]);

    // Loading screen
    if (!isReady) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white">
                <div className="text-white text-lg">
                    
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {images.map((src, index) => (
                <div
                    key={index}
                    className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
                        index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                        backgroundImage: `url(${src.src})`,
                        backgroundSize: 'cover',
                    }}
                    aria-hidden={index !== currentImageIndex}
                />
            ))}

            {/* Image loading indicators (optional, for debugging) */}
            <div className="hidden">
                {images.map((src, index) => (
                    <img 
                        key={`preload-${index}`}
                        src={src.src} 
                        alt="" 
                        className="hidden" 
                        onLoad={() => {
                            setLoadedImages(prev => {
                                const newState = [...prev];
                                newState[index] = true;
                                return newState;
                            });
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex items-center w-full h-full bg-black bg-opacity-40">
                {/* Rest of your existing JSX code remains the same */}
                <div className="w-full flex flex-col gap-6 px-2 md:px-6">
                    <motion.div 
                        variants={fadeIn('down', 0.1)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{ once: false, amount: 0.1 }}
                        className="w-full flex flex-col items-center lg:items-start gap-2"
                    >
                        <h1 className="text-[3em] md:text-[4em] lg:text-[5em] font-semibold text-orange-500">
                            Rent<span className="text-green-500">Naija</span>
                        </h1>
                        <p className="text-[1em] lg:text-[1.5em] text-center md:text-start md:leading-9 lg:max-w-[50%] font-semibold text-white">
                            Perfect Firm For Selling Or Leasing Houses, Flats, And Villas.
                        </p>
                    </motion.div>
                    
                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{ once: false, amount: 0.1 }}
                        className="p-2 md:p-4 rounded-lg md:rounded-2xl bg-white shadow-lg w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 items-center gap-2 md:gap-4"
                    >
                        <input
                            type="text"
                            placeholder="Type of property"
                            className="w-full px-2 py-4 h-8 md:h-12 text-[.8em] md:text-[.9em] rounded-md md:rounded-xl border border-gray-200 outline-none bg-gray-100"
                        />

                        <input
                            type="text"
                            placeholder="State"
                            className="w-full px-2 py-4 h-8 md:h-12 text-[.8em] md:text-[.9em] rounded-md md:rounded-xl border border-gray-200 outline-none bg-gray-100"
                        />

                        <input
                            type="text"
                            placeholder="Country"
                            className="w-full px-2 py-4 h-8 md:h-12 text-[.8em] md:text-[.9em] rounded-md md:rounded-xl border border-gray-200 outline-none bg-gray-100"
                        />

                        <button className="w-full px-2 py-2 h-9 md:h-12 text-[.9em] text-white rounded-md md:rounded-xl border border-gray-200 outline-none bg-orange-500">
                            Search
                        </button>
                    </motion.div>

                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{ once: false, amount: 0.1 }}
                        className="w-[350px] mx-auto md:mx-0 md:w-full flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
                    >
                        <div className="flex items-center gap-3 bg-black bg-opacity-70 backdrop-blur-md px-4 py-4 rounded-lg">
                            <HomeIcon className="text-orange-500 w-5 md:w-6 h-5 md:h-6"/>
                            <span className="text-[.8em] md:text-[.9em] text-white">
                                12a, Location Street, City, Country.
                            </span>
                        </div>

                        <div className="flex items-center gap-3 bg-black bg-opacity-70 backdrop-blur-md px-4 py-4 rounded-lg">
                            <Target className="text-orange-500 w-5 md:w-6 h-5 md:h-6"/>
                            <span className="text-[.8em] md:text-[.9em] text-white">
                                Fast and Reliable.
                            </span>
                        </div>

                        <div className="flex items-center gap-3 bg-black bg-opacity-70 backdrop-blur-md px-4 py-4 rounded-lg">
                            <div className="flex">
                                <Star className="fill-orange-500 w-5 md:w-6 h-5 md:h-6"/>
                                <Star className="fill-orange-500 w-5 md:w-6 h-5 md:h-6"/>
                                <Star className="fill-orange-500 w-5 md:w-6 h-5 md:h-6"/>
                                <Star className="fill-orange-500 w-5 md:w-6 h-5 md:h-6"/>
                                <Star className="fill-orange-500 w-5 md:w-6 h-5 md:h-6"/>
                            </div>
                            <span className="text-[.8em] md:text-[.9em] text-white">
                                4.8 Reviewed by people.
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Home;