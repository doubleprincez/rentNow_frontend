import ChangePassword from "@/features/auth/components/ChangePassword";
import React from "react";

const Page = async ({params}: any) => {
    const {token} = await params;
    return <>
        <ChangePassword token={token}/>
    </>
}


export default Page;