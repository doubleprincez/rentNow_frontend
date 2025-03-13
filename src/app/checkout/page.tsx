import Footer from "@/features/landing/components/Footer";
import Header from "@/features/landing/components/Header";
import Checkout from "@/features/landing/components/sections/Checkout";
import { baseURL } from "@/../next.config";
import { PlansInterface } from "@/types/subscription";


const Page = async()=>{ 
 const response = await fetch(baseURL+'/plans');
 const json = await response.json();
 const data:PlansInterface[] = json.data; 

  return <>
    <div>
      <Header/>
      <Checkout plans={data} />
      <Footer/>
    </div>
   
</>

}

export default Page;