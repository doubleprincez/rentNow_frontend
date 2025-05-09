import {PlansInterface} from "@/types/subscription";
import {PaystackButton} from 'react-paystack';
import {useEffect, useState} from "react";
import {AxiosApi, formatAmountNumber} from "@/lib/utils";
import {baseURL, frontendURL, PAYSTACK_PUBLIC_KEY} from "@/../next.config";
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {useAlert} from "@/contexts/AlertContext";
import {LucideLoader2} from "lucide-react";
import "../../styles/paystack.css";

interface PaystackI {
    plan?: PlansInterface;
    onCompleted?: any;
    onGoBack: () => void;
}

const Paystack = ({plan, onCompleted}: PaystackI) => {
        if (plan) {

            const publicKey = PAYSTACK_PUBLIC_KEY;
            const router = useRouter();
            const user = useSelector((state: any) => state.user);
            const {showAlert} = useAlert();
            const [loading, setLoading] = useState<boolean | null>(false);
            const [loadingRef, setLoadingRef] = useState<boolean | null>(false);
            const [reference, setReference] = useState<boolean | null>();
            const [paymentRetried, setPaymentRetried] = useState<boolean | null>(false);


            const initiate = async (newReference: string) => {
                if (loadingRef) return;
                setLoadingRef(() => true);
                await AxiosApi('user', user.token, {}, true)
                    .post(baseURL + '/transaction/initiate', {
                        plan_id: plan?.id,
                        ref: newReference,
                        gateway: 'paystack',
                        amount: plan?.price,
                        currency: plan?.currency,
                        callback_url: frontendURL + '/callback', // Keep callback URL for Paystack flow
                    })
                    .then((res: any) => {

                        setLoading(false); // Allow Paystack button to render with the existing reference
                        const pendingTransaction = res.data.data?.transaction;

                        if (pendingTransaction?.reference_paystack) {
                            showAlert("Previous payment found. Checking verification status...", "info");
                            verifyExistingTransaction(pendingTransaction?.reference_paystack, pendingTransaction?.reference);
                            return;
                        } else {
                            setReference(() => pendingTransaction?.reference); //New Transaction or pending transaction are merged nw
                            return;
                        }
                    })
                    .catch((error: any) =>
                        showAlert(
                            error?.response?.data?.message || error.message || "Unable to Process, Please try again.",
                            "error"
                        )
                    )
                    .finally(() => setLoading(() => false));
            };

            const fetchReference = async () => {
                if (loadingRef) return;
                setLoadingRef(() => true);
                await AxiosApi('user', user.token, {}, true).post(baseURL + '/transaction/generateKey')
                    .then((res: any) => {
                        setLoading(() => false);
                        // setReference(() => res.data.data.transaction_reference);
                        initiate(res.data.data.transaction_reference); // initiate transaction
                    })
                    .finally(() => setLoadingRef(false));
            }
// check current state and return the response
            useEffect(() => {
                fetchReference();
            }, []);

            const verifyExistingTransaction = async (trxref: string, pendingReference: string) => {
                if (loadingRef) return;
                setLoadingRef(() => true);
                if (plan) {

                    try {
                        const verificationResult = await AxiosApi(
                            'user',
                            user.token,
                            {},
                            true
                        ).post(baseURL + '/transaction/paystack/verify', {
                            trxref: trxref, // Assuming pendingReference is the Paystack trxref
                            plan_id: plan.id,
                            internalReference: pendingReference // Assuming for now it's the same
                        });

                        // console.log("Verification Result of Pending Transaction:", verificationResult.data);

                        if (verificationResult.data?.status === 'success') {
                            showAlert("Payment confirmed! Redirecting to Invoice...", "success");
                            router.push(frontendURL + '/invoice/' + verificationResult.data.reference); // Use backend's reference
                            if (onCompleted) {
                                onCompleted();
                            }
                        } else {
                            showAlert("Previous payment not yet confirmed. You can retry or wait.", "warning");
                            setLoading(() => false);
                            setReference(null); // Allow retry
                        }
                    } catch (error: any) {
                        // console.error("Error verifying pending transaction:", error);
                        showAlert("Error checking payment status. You can retry or wait.", "error");
                        setLoading(() => false);
                        setReference(null); // Allow retry
                    } finally {
                        setLoading(() => false);
                    }
                }
            };


            const componentProps = {
                ref: reference,
                email: user.email,
                amount: Number(plan.price) * 100,
                currency: plan?.currency || "NGN",
                metadata: {
                    plan_id: plan?.id,
                    ref: reference,
                    gateway: 'paystack',
                    amount: plan?.price,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    currency: plan?.currency,
                    custom_fields: [],
                },
                publicKey: publicKey,
                text: paymentRetried ? "Retry Payment" : "Pay Now",
                onSuccess: (response:any) => onSuccess(response),
                onClose: () => onClose(),
            };

            const onSuccess = async (response: any) => {
                const ready = await saveTransactionInfo(response);

                if (ready) {
                    if (response?.transaction && response.status != 'success') {
                        setLoading(() => true);
                        showAlert("Processing Payment...", "info");
                        try {
                            const verificationResult = await AxiosApi(
                                'user',
                                user.token,
                                {},
                                true
                            )
                                .post(baseURL + '/transaction/paystack/verify', {
                                    trxref: response.transaction,
                                    plan_id: plan.id,
                                    reference: response.transaction // Use the current reference for verification
                                });
                            // check if verification Result status is success

                            // else show error message and recheck button

                        } catch (error: any) {

                        } finally {

                        }
                    } else if (response.status == 'success') {
                        showAlert("Payment Completed Successfully!", "success");
                        // redirect to invoice page
                        router.push(frontendURL + '/invoice/' + reference); // Use backend's reference

                    } else {
                        showAlert("Payment reference not found in Paystack response.", "error");
                    }
                }
                setLoading(() => false);
            }

            const saveTransactionInfo = async (data:any) => {
                try {
                    // console.log('store data ', data);
                    //
                    const storeRecord = await AxiosApi(
                        'user',
                        user.token,
                        {},
                        true
                    ).post(baseURL + '/transaction/paystack/store', {
                        ...data,
                        reference: reference,
                        reference_paystack: data?.reference
                    }); // Send the entire response object

                    return storeRecord.data?.status === 'success'; // Return boolean indicating success
                } catch (error: any) {
                    // console.error('Error saving transaction info:', error);
                    showAlert(error?.response?.data?.message || "Error saving transaction details.", "error");
                    return false;
                }
            }


            const onClose = () => {
                showAlert("Subscription Failed, Please Try Again", "error");
                return router.push(frontendURL + '/subscribe');
            };

            return (
                <div className={"rounded-xl p-6 shadow-2xl"}>
                    <h3 className={"text-2xl mb-5"}>Paystack Transfer</h3>
                    <div>
                        {loading ? (
                            <div className="min-h-[300px] flex justify-center items-center">
                                <LucideLoader2 className="animate-spin"/>
                            </div>
                        ) : (
                            <div className="space-y-3 card">
                                <p>
                                    <label>
                                        <strong> Plan Name:</strong> {plan?.name}
                                    </label>
                                </p>
                                <p>
                                    <label>
                                        <strong> Plan Amount:</strong>{" "}
                                        <span>{plan?.currency}{formatAmountNumber(plan?.price)}</span>
                                    </label>
                                </p>
                                <p>
                                    <label>
                                        <strong> Duration: </strong>{plan?.invoice_period} / {plan?.invoice_interval}
                                    </label>
                                </p>
                                <div>
                                    <label className="text-lg font-bold">User Details</label>
                                    <div className="p-3 space-y-2">
                                        <div>
                                            <label>Full Name: </label>
                                            {user?.firstName} {user?.lastName}
                                        </div>
                                        <div>
                                            <label>Address: </label>
                                            {user?.address}
                                        </div>
                                        <div>
                                            <label>Email: </label>
                                            {user?.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-[126px]">
                                    {reference && <PaystackButton className="paystack-button" {...componentProps} />}
                                    {/*{!reference && !loading && (*/}
                                    {/*    <button onClick={fetchReference}*/}
                                    {/*            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">*/}
                                    {/*        Retry Payment*/}
                                    {/*    </button>*/}
                                    {/*)}*/}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    }
;

export default Paystack;