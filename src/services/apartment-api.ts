import {clientRequestGateway} from "@/services/backend-api";


export const apartmentApiRequests = {
    getApartments: () => {
        return clientRequestGateway.get(
            `/apartments`
        )
    },
    showApartment: (payload: object) => {
        return clientRequestGateway.post(
            { url: `/apartment/`, payload }
        )
    },
};
