'use client';
import { AxiosApi } from "@/lib/utils";
import { TransactionHistory } from "@/types/subscription";
import { Suspense, useEffect, useState } from "react";
import { baseURL } from "@/../next.config";
import { useAlert } from "@/contexts/AlertContext";
import Invoice from "../subscription/Invoice";
import { Loader } from "lucide-react";


interface TransactionI {
    reference:number|string
}


const Transaction =({reference}:TransactionI)=>{

        const { showAlert } = useAlert();
    
const [transaction,setTransaction] = useState<TransactionHistory>();
const [loading,setLoading] = useState(false);

    const fetchTransaction =async ()=>{
        
        if(loading) return;
        setLoading(()=>true);
        await AxiosApi().get(baseURL+'/transaction/invoice/'+reference)
            .then((res:any)=>{ 
                setTransaction(res.data.data);
            })
            .catch((error: any)=> showAlert(
                error?.response?.data?.message||  error.message || "Unable to Process, Please try again.",
                "error"
            ))
            .finally(()=>setLoading(()=>false));
    }
 
    
    useEffect(()=>{

         return ()=>{

        fetchTransaction();
         }
    },[reference]);


    return (<div className="relative min-h-screen pt-28"  >
        <h2 className="text-center text-2xl font-bold">Transaction Invoice</h2>
        <div className="p-3">
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader className="animate-spin"/>&nbsp;Loading...</div>}>
        {
            transaction && <Invoice transaction={transaction} />
        }
        </Suspense>
    </div>
    </div>)
}
export default Transaction;