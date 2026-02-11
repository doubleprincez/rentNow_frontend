import {baseURL, MAILCHIMP_API_KEY, MAILCHIMP_API_SERVER, MAILCHIMP_AUDIENCE_ID} from "@/../next.config";
import mailchimp from "@mailchimp/mailchimp_marketing";

import {ApiSubscriptionResponse} from '@/types/subscription';
import {AxiosApi} from '@/lib/utils';


export const getUserSubscriptions = async (page: number = 1, search: string = '', account = 'user') => {
    try {


        const response = await AxiosApi(account).get<ApiSubscriptionResponse>(
            baseURL + `/subscriptions?page=${page}&search=${search}`);

        return response.data;
    } catch (error) {
        throw error;
    }
};


export const subscribeToMailchimp = async (email: string) => {
    // avoid this in production
    mailchimp.setConfig({
        apiKey: MAILCHIMP_API_KEY,
        server: MAILCHIMP_API_SERVER
    });

    const run = async () => {
        return await mailchimp.lists.addListMember(MAILCHIMP_AUDIENCE_ID, {
            email_address: email,
            status: "pending",
        });
    };

    return run();

}