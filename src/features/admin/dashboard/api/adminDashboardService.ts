import axios from 'axios';
import {baseURL} from "@/../next.config";
import {AxiosApi} from "@/lib/utils";

interface Statistics {
    total_apartments: number;
    total_rented_apartment: number;
    total_rent_request: number;
    total_users: number;
    total_agents: number;
    total_admins: number;
    total_amount_generated: number;
    total_deleted_apartments: number;
}

interface ChartData {
    [key: string]: {
        total_rent: string | number;
        total_apartments: string | number;
    };
}

interface DashboardData {
    statistics: Statistics;
    chartData: ChartData;
}

export const fetchDashboardData = async (token: string): Promise<DashboardData> => {
    try {
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        };

        const [statsResponse, chartResponse] = await Promise.all([
            axios.get<{ success: boolean; data: Statistics }>(
                baseURL + '/statistics',
                {headers}
            ),
            axios.get<{ success: boolean; data: ChartData }>(
                baseURL + '/bar-chart',
                {headers}
            )
        ]);

        if (!statsResponse.data.success || !chartResponse.data.success) {
            throw new Error('Failed to fetch dashboard data');
        }

        return {
            statistics: statsResponse.data.data,
            chartData: chartResponse.data.data
        };
    } catch (error) {
        throw new Error('Error fetching dashboard data: ' + error);
    }
};

export const deleteExistingImage = async (uuid: any, token = '') => {
    try {
        const response = await AxiosApi('admin', token).delete(baseURL + `/delete-media/${uuid}`); // Replace with your actual API endpoint
        if (response.data.success) {
            // Optionally handle success feedback here (e.g., show a message)

            return {"response": true, message: `Image with UUID ${uuid} deleted successfully.`};
        } else {

            // Optionally handle error feedback here
            return {"response": false, message: `Failed to delete image with UUID ${uuid}:` + response.data.message};
        }
    } catch (error: any) {
        // Optionally handle error feedback here
        return {"response": true, "message": `Error deleting image with UUID ${uuid}:`};
    }
}
export const deleteExistingVideos = async (uuid: any, token = '') => {
    try {
        const response = await AxiosApi('admin', token).delete(baseURL + `/delete-media/${uuid}`);
        if (response.data.success) {
            // Optionally handle success feedback here (e.g., show a message)

            return {"response": true, message: `Video with UUID ${uuid} deleted successfully.`};
        } else {

            // Optionally handle error feedback here
            return {"response": false, message: `Failed to delete video with UUID ${uuid}:` + response.data.message};
        }
    } catch (error: any) {
        // Optionally handle error feedback here
        return {"response": true, "message": `Error deleting video with UUID ${uuid}:`};
    }
}