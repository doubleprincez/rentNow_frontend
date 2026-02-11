"use client";
import Image from 'next/image';
import React from "react";
import Link from "next/link";
import {LucideHome} from "lucide-react";


const ErrorInformation: React.FC = () => {

    const backgroundThumbnail = '/bg.png';
    const errorThumbnail = '/empty.jpg';
    return (
        <div
            className="min-h-screen text-center px-12 py-16 sm:py-20 lg:py-24 xl:py-32 flex items-center justify-center bg-cover bg-no-repeat bg-center"
            style={{
                backgroundImage: `url(${backgroundThumbnail})`,
            }}
        >
            <div className="max-w-md xl:max-w-lg">
                <Image
                    src={errorThumbnail}
                    alt={'Error'}
                    width={150}
                    height={150}
                />

                <h2 className="text-6xl md:text-7xl 2xl:text-8xl font-bold text-brand-dark pt-5 xl:pt-9">
                    Oops
                </h2>
                <p className="text-15px md:text-base 2xl:text-[18px] leading-7 md:leading-8 pt-4 font-medium">
                    Content Unavailable
                </p>
                <div className={"flex mt-10 justify-center align-center items-center"}>
                    <Link href={'/'}
                          className={"text-red-300 font-bold flex space-x-2 gap-2 w-full justify-center items-center align-center"}><LucideHome/>Home</Link>
                </div>
            </div>
        </div>
    );

}
export default ErrorInformation;