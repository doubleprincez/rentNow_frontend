'use client'

import {useParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {baseURL} from "@/../next.config";
import EditApartmentForm, {PropertyFormData} from "./EditApartmentForm";
import {AxiosApi} from "@/lib/utils";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";


const EditApartment: React.FC = () => {
    const params = useParams();
    const {id} = params; // Extract the `id` parameter

    const [apartment, setApartment] = useState<PropertyFormData>();
    const [pageState, setPageState] = useState('loading');
    const [loading, setLoading] = useState(false);
    const token = useSelector((state: RootState) => state.admin.token);


    useEffect(() => {
        fetchApartment();
    }, [id]);

    const fetchApartment = async () => {
        if (loading) return;
        setLoading(()=>true);
        setPageState('loading');
        await AxiosApi('admin', token ?? '')
            .get(baseURL + '/apartment/' + id + '?raw=true')
            .then((res: any) => {
                setApartment(res.data.data);
            })

            .finally(() => {
                setPageState('loaded');
                setLoading(()=>false);
            })
        ;
    }
    return <div className='w-full'>

        {
            pageState == 'loading' ?
                <div className={"text-3xl mx-auto w-full text-center py-8 "}><span>Loading...</span></div> :
                apartment ? <EditApartmentForm property={apartment}/> :
                    <p className={"text-3xl mx-auto w-full text-center py-8 "}>Loading Failed</p>
        }

    </div>

}


export default EditApartment;