import {clientRequestGateway} from "@/services/backend-api";


export const apartmentApiRequests = {
    getApartments: () => {
        return clientRequestGateway.get(
            `/apartment`
        )
    },
    showApartment: (payload: object) => {
        return clientRequestGateway.post(
            { url: `/apartment/`, payload }
        )
    },
};
