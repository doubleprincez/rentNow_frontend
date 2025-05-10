import { PlansInterface } from "@/types/subscription";
import { PaystackButton } from 'react-paystack';
import { useEffect, useState, useCallback } from "react";
import { AxiosApi, formatAmountNumber } from "@/lib/utils";
import { baseURL, frontendURL, PAYSTACK_PUBLIC_KEY } from "@/../next.config";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useAlert } from "@/contexts/AlertContext";
import { LucideLoader2 } from "lucide-react";
import "../../styles/paystack.css";

interface PaystackI {
    plan?: PlansInterface;
    onCompleted?: any;
    onGoBack: () => void;
}

const Paystack = ({ plan, onCompleted }: PaystackI) => {
    if (!plan) {
        return null; // Or some other fallback UI
    }

    const { showAlert } = useAlert();
    const router = useRouter();
    const user = useSelector((state: any) => state.user);
    const publicKey = PAYSTACK_PUBLIC_KEY;

    const [loading, setLoading] = useState(false);
    const [loadingRef, setLoadingRef] = useState(false);
    const [reference, setReference] = useState<string | null>(null); // More specific type
    const [paymentRetried, setPaymentRetried] = useState(false);

    const initiate = useCallback(async (newReference: string) => {
        if (loadingRef) return;
        setLoadingRef(true);
        try {
            const res = await AxiosApi('user', user.token, {}, true).post(baseURL + '/transaction/initiate', {
                plan_id: plan.id,
                ref: newReference,
                gateway: 'paystack',
                amount: plan.price,
                currency: plan.currency,
                callback_url: frontendURL + '/callback',
            });

            setLoading(false);
            const pendingTransaction = res.data.data?.transaction;

            if (pendingTransaction?.reference_paystack) {
                showAlert("Previous payment found. Checking verification status...", "info");
                verifyExistingTransaction(pendingTransaction.reference_paystack, pendingTransaction.reference);
            } else {
                setReference(pendingTransaction?.reference || null);
            }
        } catch (error: any) {
            showAlert(
                error?.response?.data?.message || error.message || "Unable to Process, Please try again.",
                "error"
            );
        } finally {
            setLoadingRef(false);
        }
    }, [AxiosApi, baseURL, frontendURL, plan, showAlert, user.token]);

    const fetchReference = useCallback(async () => {
        if (loadingRef) return;
        setLoadingRef(true);
        try {
            const res = await AxiosApi('user', user.token, {}, true).post(baseURL + '/transaction/generateKey');
            initiate(res.data.data.transaction_reference);
        } catch (error: any) {
            showAlert(
                error?.response?.data?.message || error.message || "Failed to generate payment reference.",
                "error"
            );
        } finally {
            setLoadingRef(false);
        }
    }, [AxiosApi, baseURL, initiate, showAlert, user.token]);

    const verifyExistingTransaction = useCallback(async (trxref: string, pendingReference: string) => {
        if (loadingRef) return;
        setLoadingRef(true);
        try {
            const verificationResult = await AxiosApi(
                'user',
                user.token,
                {},
                true
            ).post(baseURL + '/transaction/paystack/verify', {
                trxref,
                plan_id: plan.id,
                internalReference: pendingReference
            });

            if (verificationResult.data?.status === 'success') {
                showAlert("Payment confirmed! Redirecting to Invoice...", "success");
                router.push(frontendURL + '/invoice/' + verificationResult.data.reference);
                if (onCompleted) {
                    onCompleted();
                }
            } else {
                showAlert("Previous payment not yet confirmed. You can retry or wait.", "warning");
                setReference(null);
            }
        } catch (error: any) {
            showAlert("Error checking payment status. You can retry or wait.", "error");
            setReference(null);
        } finally {
            setLoadingRef(false);
        }
    }, [AxiosApi, baseURL, frontendURL, onCompleted, plan, router, showAlert, user.token]);

    useEffect(() => {
        fetchReference();
    }, [fetchReference]);

    const onSuccess = useCallback(async (response: any) => {
        const ready = await retrySaveTransactionInfo(response, 3);

        if (ready) {
            if (response?.transaction && response.status !== 'success') {
                setLoading(true);
                showAlert("Processing Payment...", "info");
                try {
                    const verificationResult = await AxiosApi(
                        'user',
                        user.token,
                        {},
                        true
                    ).post(baseURL + '/transaction/paystack/verify', {
                        trxref: response.transaction,
                        plan_id: plan.id,
                        reference: response.transaction
                    });
                    if (verificationResult.data?.status === 'success') {
                        showAlert("Payment Completed Successfully!", "success");
                        router.push(frontendURL + '/invoice/' + reference);
                    } else {
                        showAlert("Payment verification failed.", "error");
                        setPaymentRetried(true); // Allow retry button to show
                    }
                } catch (error: any) {
                    console.error("Error during verification:", error);
                    showAlert(error?.response?.data?.message || "Error verifying payment.", "error");
                    setPaymentRetried(true); // Allow retry button to show
                } finally {
                    setLoading(false);
                }
            } else if (response.status === 'success') {
                showAlert("Payment Completed Successfully!", "success");
                router.push(frontendURL + '/invoice/' + reference);
            } else {
                showAlert("Payment reference not found in Paystack response.", "error");
                setPaymentRetried(true); // Allow retry button to show
            }
        } else {
            showAlert("Failed to save transaction details after multiple retries. Please check your network connection and try again.", "error");
            setPaymentRetried(true); // Allow retry button to show
        }
    }, [AxiosApi, baseURL, frontendURL, plan, reference, router, showAlert, user.token]);

    const retrySaveTransactionInfo = useCallback(async (data: any, maxRetries: number, attempt: number = 1): Promise<boolean> => {
        try {
            const storeRecord = await AxiosApi(
                'user',
                user.token,
                {},
                true
            ).post(baseURL + '/transaction/paystack/store', {
                ...data,
                reference,
                reference_paystack: data?.reference
            });
            return storeRecord.data?.status === 'success';
        } catch (error: any) {
            console.error(`Attempt ${attempt} to save transaction failed:`, error);
            if (attempt < maxRetries) {
                console.log(`Retrying in 2 seconds... (Attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return await retrySaveTransactionInfo(data, maxRetries, attempt + 1);
            } else {
                showAlert(error?.response?.data?.message || "Error saving transaction details.", "error");
                return false;
            }
        }
    }, [AxiosApi, baseURL, reference, showAlert, user.token]);

    const onClose = useCallback(() => {
        showAlert("Subscription Failed, Please Try Again", "error");
        router.push(frontendURL + '/subscribe');
    }, [frontendURL, router, showAlert]);

    const componentProps = useCallback(() => ({
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
            custom_fields: [
                {
                    display_name: "Plan ID",
                    variable_name: "plan_id",
                    value: plan?.id,
                },
                {
                    display_name: "Reference",
                    variable_name: "reference",
                    value: reference,
                },
                {
                    display_name: "Gateway",
                    variable_name: "gateway",
                    value: 'paystack',
                },
                {
                    display_name: "Amount",
                    variable_name: "amount",
                    value: plan?.price,
                },
                {
                    display_name: "First Name",
                    variable_name: "firstName",
                    value: user?.firstName,
                },
                {
                    display_name: "Last Name",
                    variable_name: "lastName",
                    value: user?.lastName,
                },
                {
                    display_name: "Currency",
                    variable_name: "currency",
                    value: plan?.currency,
                },
            ],
        },
        publicKey: publicKey,
        text: paymentRetried ? "Retry Payment" : "Pay Now",
        onSuccess: onSuccess,
        onClose: onClose,
    }), [plan, publicKey, reference, router, showAlert, user, onSuccess, onClose, paymentRetried]);

    return (
        <div className={"rounded-xl p-6 shadow-2xl"}>
            <h3 className={"text-2xl mb-5"}>Paystack Transfer</h3>
            <div>
                {loading ? (
                    <div className="min-h-[300px] flex justify-center items-center">
                        <LucideLoader2 className="animate-spin" />
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
                            {reference && <PaystackButton className="paystack-button" {...componentProps()} />}
                            {!reference && !loading && (
                                <button onClick={fetchReference}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Retry Get Reference
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Paystack;