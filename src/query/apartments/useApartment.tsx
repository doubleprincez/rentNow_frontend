import {ApiError} from "next/dist/server/api-utils";
import {clientRequest} from "@/services";
import {APIResponse} from "@/types/apartment";
import {useMutation, useQueryClient} from "@tanstack/react-query";
interface MutationData {
    data:  any
}
export const useApartment = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {mutate, isPending} = useMutation<
        APIResponse,
        ApiError,
        MutationData
    >({

        mutationFn: ({data}) => {
            return clientRequest.apartment.getApartments();
        },
        onSuccess: async (response: APIResponse) => {
            await queryClient.invalidateQueries({queryKey: ["apartments"]})
            if (response?.success) {
                onSuccess?.()
            }
        },
        onError: (error: ApiError) => {
            // showToast(error);
        },
    });

    return {mutate, isPending};
};
