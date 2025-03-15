"use client"
import { Button } from "@/components/ui/button";
import { AxiosApi, formatAmountNumber, getFormData, hasFormData, saveFormData } from "@/lib/utils";
import { PlansInterface,  TransactionHistory } from "@/types/subscription";
import { useEffect, useState } from "react";
import { baseURL, frontendURL } from "@/../next.config";

import {  LucideLoader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { redirect ,useRouter} from "next/navigation";  
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAlert } from "@/contexts/AlertContext";



interface BankTransferI{
    plan?:PlansInterface,
    onCompleted?:any,
    onGoBack: () => void
}



// provide user with the bank account to pay, get the payment

const BankTransfer  =({plan,onCompleted}:BankTransferI)=>{
        const { showAlert } = useAlert();
        const router = useRouter();

 
    const user = useSelector((state: any) => state.user); 

    const [loading,setLoading] = useState(false);
    const [loadingRef,setLoadingRef] = useState(false);
    const [reference ,setReference] = useState();
    const [subscription,setSubscription] = useState<TransactionHistory>();
    const [pendingSubs,setPendingsubs] = useState<TransactionHistory[]>();
    const [invoice,setInvoice] =useState();

 
// on refresh or check if subscription exists
const checkSubscription =async ()=>{
    if(loading) return ;
    setLoading(true);
// if exists set the subscription
     await AxiosApi().get(baseURL+'/transaction/unpaid')
        
    .then(response=>{
        // set subscription
        if(response.data.subscription){
            setPendingsubs(response.data.subscription) ;
        }
    
    })
    .finally(()=>setLoading(false));
}

const fetchReference=async()=>{
    if(loadingRef) return;
    setLoadingRef(true);
    await AxiosApi().post(baseURL+'/transaction/generateKey')
    .then((res:any)=>{ setReference(res.data.data.transaction_reference)})
        .finally(()=>setLoadingRef(false));

}
// check current state and return the response
    useEffect(()=>{ 
    fetchReference();
    checkSubscription();

    },[]);

  const [counter,setCounter] = useState(0);

const generateSubscription =async()=>{
 
    if(loading) return;
    setLoading(true);

    if(!user.isLoggedIn){ 
        saveFormData('intended_url','/subscribe');
        saveToken();
        return redirect('auth/login?next=subscribe');
    }
    if(!reference && counter < 4){
        console.log('this is working');
        setCounter(()=>counter+1);
        fetchReference().then(r=>generateSubscription()).then(r=>setCounter(0));
    }
// generate new subscription if no current one
if(reference){
     
   await AxiosApi().post(baseURL+'/transaction/initiate',{
    plan_id:plan?.id,
    reference:reference,
    gateway:'bank_transfer',
    amount:plan?.price,
    currency:plan?.currency,
    callback_url:frontendURL+'/invoice/'+reference
   })
    .then(response=>{ 
            showAlert("Transaction Invoice Generated Successful", "success");
        // return subscription 
        if(response.data.data.transaction.callback_url){
            router.push(response.data.data.transaction.callback_url);
        }

    //    if(response?.invoice){
    //     setInvoice(response.invoice)
    //    } 
    
    })
    .catch((error: any)=> showAlert(
      error?.response?.data?.message||  error.message || "Unable to Process, Please try again.",
        "error"
    ))
    .finally(()=>setLoading(false));
 
}else{
    
}

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
<div className=" mt-20 w-full md:w-3/4 border border-gray-300 min-h-[300px] p-3">
    <h3 className="text-center text-2xl mb-4">Direct Bank Transfer</h3>

<div>
    
    {
        loading?<div className="min-h-[300px] flex justify-center items-center"><LucideLoader2 className="animate-spin" /></div>:
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
        <div>
            <label className="text-lg font-bold">User Details</label>
            <div className="p-3 space-y-2">
                <div><label>Full Name: </label>
                {user?.firstName} {user?.lastName}
                </div>
                <div>
                    <label>Address: </label>
                    {user?.address}

                </div>
                
                <div><label>Email: </label>
                    {user?.email}
                </div>

            </div>
        </div>
        <div className="pt-[126px]">
           <Button disabled={loading} className="bg-green-500 hover:bg-green-600  text-gray-100" onClick={()=>generateSubscription()}>Pay Now</Button>
        </div>

        <div className="mt-[20px]">
            <h2>  Pending Subscriptions</h2>
            <div className="py-3 px-2">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow> 
                            <TableHead>Reference</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : !Array.isArray(pendingSubs) || pendingSubs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No Pending Inovice found
                                </TableCell>
                            </TableRow>
                        ) : (
                            pendingSubs.map((sub:TransactionHistory) => (
                                <TableRow key={sub.id}>
                                     
                                    <TableCell>
                                         {sub?.payable?.name??sub?.payable?.title}
                                    </TableCell>
                                    <TableCell>{sub?.currency} {formatAmountNumber(sub?.amount)}</TableCell>
                                    <TableCell>{`${sub?.payable?.invoice_duration}, ${sub?.payable?.invoice_interval}`}</TableCell>
                                    <TableCell>{sub?.status}</TableCell>
                                    {/* <TableCell className={'flex '}>
                                        <Link  className={"mt-1"} href={"/admin/dashboard/edit-apartment/"+apartment.id}>
                                            <Pencil />
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className='bg-red-500 text-white px-4 py-1 mx-3 rounded-md'
                                            onClick={() => handleDelete(apartment.id)}
                                        >
                                            Delete
                                        </Button>
                                        {
                                             !apartment.published ? <Button
                                                variant="outline"
                                                size="sm"
                                                className='bg-green-500 text-white px-4 py-1 mx-3 rounded-md'
                                                onClick={() => handlePublish(apartment.id, true)}
                                            >
                                                Publish
                                            </Button> : <Button
                                                variant="outline"
                                                size="sm"
                                                className='bg-red-500 text-white px-4 py-1 mx-3 rounded-md'
                                                onClick={() => handlePublish(apartment.id, false)}
                                            >
                                                UnPublish
                                            </Button>
                                        }

                                    </TableCell> */}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
             </div>
        </div>
    </div>
    }
</div>
   
</div>
</>
}



export default BankTransfer;
 
