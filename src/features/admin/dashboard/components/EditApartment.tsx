'use client'

import {useParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {Loader} from "lucide-react";
import {baseURL} from "@/../next.config";
import EditApartmentForm, {PropertyFormData} from "./EditApartmentForm";


const EditApartment: React.FC = () => {
    const params = useParams();
    const {id} = params; // Extract the `id` parameter

    const [apartment, setApartment] = useState<PropertyFormData>();
    const [pageState, setPageState] = useState('loading');
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        fetchApartment();

    }, [id]);

    const fetchApartment = async () => {
        if(loading) return;
        setLoading(true);
        setPageState('loading');
        await axios.get(baseURL + '/apartment/' + id+'?raw=true')
            .then((res: any) => {
                setApartment(res.data.data);
            })

            .finally(() => {
                setPageState('loaded');setLoading(false);
            })
        ;
    }
    return <div className='w-full'>

        {
            pageState == 'loading' ?
                <div className={"text-3xl mx-auto w-full text-center py-8 "}><span>Loading...</span></div> :
                apartment ? <EditApartmentForm property={apartment}/> : <p className={"text-3xl mx-auto w-full text-center py-8 "}>Loading Failed</p>
        }

    </div>

}


export default EditApartment;