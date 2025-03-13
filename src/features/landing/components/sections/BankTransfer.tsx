"use client"
import { Button } from "@/components/ui/button";
import { AxiosApi, formatAmountNumber, getFormData, hasFormData, saveFormData } from "@/lib/utils";
import { PlansInterface, SubscriptionInterface } from "@/types/subscription";
import { useEffect, useState } from "react";
import { baseURL } from "@/../next.config";
import axios from "axios";
import {  LucideLoader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { redirect } from "next/navigation";



interface BankTransferI{
    plan?:PlansInterface,
    onCompleted?:any
}



// provide user with the bank account to pay, get the payment

const BankTransfer  =({plan,onCompleted}:BankTransferI)=>{ 

    const isLoggedIn = useSelector((state: any) => state.user.isLoggedIn); 

    const [loading,setLoading] = useState(false);
    const [reference ,setReference] = useState();
    const [subscription,setSubscription] = useState<SubscriptionInterface>();
    const [invoice,setInvoice] =useState();





// on refresh or check if subscription exists
const checkSubscription =async ()=>{
    if(loading) return ;
    setLoading(true);
// if exists set the subscription
     await AxiosApi().get(baseURL+'/transaction/pending')
        
    .then(response=>{
        // set subscription
       setSubscription(response.data) ;
    
    })
    .finally(()=>setLoading(false));
}

const fetchReference=async()=>{
    
    await axios.post(baseURL+'/transaction/generateKey')
    .then(res=>{
        console.log('reference',res.data);
        setReference(res.data)})

}
// check current state and return the response
    useEffect(()=>{ 
    fetchReference();
    checkSubscription();

    },[]);

  
const generateSubscription =async()=>{

    if(loading) return;
    setLoading(true);

    if(!isLoggedIn){ 
        saveFormData('intended_url','/checkout');
        saveToken();
        return redirect('auth/login?next=checkout');
    }
    /**
     *    $request->validate([
            'plan_id' => 'required',
            'gateway' => 'required',
            'reference' => 'required',
            'amount' => 'required',
            'currency' => 'required',
            'callback_url' => 'required'
        ]);
     */
// generate new subscription if no current one

   await AxiosApi().post(baseURL+'/transaction/generateKey',{plan_id:plan?.id})
    .then(response=>{
        // return subscription
       setSubscription(response.data);

       if(response?.invoice){
        setInvoice(response.invoice)
       } 
    
    })
    .catch(err=>err)
    .finally(()=>setLoading(false));
 


}

const saveToken = ()=>{
    saveFormData('checkout_plan', plan);
    saveFormData('checkout_type','bank-transfer');

}

// show payment information and invoice generate 


const generateInvoice = ()=>{
    // generate invoice when subscription is confirmed


}

const InvoiceData =()=>{

}

// display subscription details and provide a means of printing invoice
const showSubscriptionDetails =()=>{


    return <>

    </>
}

return <>
<div className="w-3/4 border border-gray-300 min-h-[300px] p-3">
    <h3 className="text-center text-2xl mb-4">Direct Bank Transfer</h3>

    {
        loading?<div className="min-h-[300px] flex justify-center items-center"><LucideLoader2 /></div>:
        subscription?showSubscriptionDetails(): <div className="space-y-3">
        <p> 
        <label>
            Plan Name:   <strong> {plan?.name}</strong>
        </label>
        </p>
        <p>
            <label>Plan Amount: <span>{plan?.currency}{formatAmountNumber(plan?.price)}</span></label>
        </p>
        <p>
            <label>Duration: {plan?.invoice_period} / {plan?.invoice_interval}</label>
        </p>
        <p className="mt-24">
           <Button disabled={loading} className="bg-green-500 hover:bg-green-600  text-gray-100" onClick={()=>generateSubscription()}>Pay Now</Button>
        </p>

    </div>
    }
   
</div>
</>
}



export default BankTransfer;