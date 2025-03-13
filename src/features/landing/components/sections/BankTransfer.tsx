"use client"
import { Button } from "@/components/ui/button";
import { formatAmountNumber } from "@/lib/utils";
import { PlansInterface, SubscriptionInterface } from "@/types/subscription";
import { useEffect, useState } from "react";
import { baseURL } from "@/../next.config";
import axios from "axios";
import { Loader } from "lucide-react";
import { useSelector } from "react-redux";



interface BankTransferI{
    plan?:PlansInterface,
    onCompleted?:any
}



// provide user with the bank account to pay, get the payment

const BankTransfer  =({plan,onCompleted}:BankTransferI)=>{
    const token = useSelector((state: any) => state.agent.token);
  

    const [loading,setLoading] = useState(false);
    const [subscription,setSubscription] = useState<SubscriptionInterface>();
    const [invoice,setInvoice] =useState();


// on refresh or check if subscription exists
const checkSubscription =async ()=>{
    if(loading) return ;
    setLoading(true);
// if exists set the subscription
     await axios.get(baseURL+'/check-pending-subscription',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
    .then(response=>{
        // set subscription
       setSubscription(response.data) ;
    
    })
    .finally(()=>setLoading(false));
}


// check current state and return the response
useEffect(()=>{
checkSubscription()
},[]);

const generateSubscription =async()=>{
    if(loading) return ;
    setLoading(true);
// generate new subscription if no current one
   await axios.get(baseURL+'/new-subscription/'+plan?.id,  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
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
<div className="w-3/4 border border-gray-300 p-3">
    <h3 className="text-center text-2xl mb-4">Direct Bank Transfer</h3>

    {
        loading?<Loader/>:
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
           <Button className="bg-green-400 hover:bg-green-500  text-gray-100" onClick={()=>generateSubscription}>Pay Now</Button>
        </p>

    </div>
    }
   
</div>
</>
}



export default BankTransfer;