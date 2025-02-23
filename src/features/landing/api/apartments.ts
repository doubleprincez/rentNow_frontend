import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        const response = await axios({
            method: 'GET',
            url: 'https://api.rent9ja.com.ng/api/apartments',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        return NextResponse.json(response.data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error: any) {
        //console.error('Error fetching apartments:', error);
        return NextResponse.json(
            { error: error.response?.data?.message || 'Failed to fetch apartments' },
            { status: error.response?.status || 500 }
        );
    }
}