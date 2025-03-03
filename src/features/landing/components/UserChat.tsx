'use client'
import React, {useEffect, useState} from 'react';
import {Tabs, TabsTrigger, TabsContent, TabsList} from '@/components/ui/tabs';
import {Banknote, MapPin, Clock} from 'lucide-react';
import {useRouter} from 'next/navigation';
import type {
    Apartment,
    ApiResponse,
    FindHomesProps,
    ApartmentCardProps
} from '@/types/apartment';
import ChatDialog from "./ChatDialog";


const UserChat = () => {
    // fetch all previous chats from this url
    // http://localhost:8000/api/conversations

    return <>
        <div

            className="relative bg-gray-100 w-full min-h-screen pt-[64px] md:pt-[75px]"
        >
            <div className="bg-opacity-60 pt-5">

                <div className="relative mx-auto w-[90%] flex items-center justify-center">

                <h3 className={"text-black"}>Previous Conversations</h3>

            {/*display all previously contacted clients then when one is selected, chat him /her up using the component*/}

            {/*<ChatDialog*/}
            {/*    agentId={apartment.agent_id}*/}
            {/*    agentName={apartment.agent}*/}
            {/*/>*/}


        </div>
        </div>
        </div>


    </>
}

export default UserChat;












