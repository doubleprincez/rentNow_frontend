import { NextRequest, NextResponse } from 'next/server';
import { baseURL } from '@/../next.config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    const response = await fetch(`${baseURL}/apartments${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch apartments' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter out sensitive information
    if (data.success && data.data?.data) {
      data.data.data = data.data.data.map((apartment: any) => ({
        id: apartment.id,
        category_id: apartment.category_id,
        category: apartment.category,
        title: apartment.title,
        description: apartment.description,
        number_of_rooms: apartment.number_of_rooms,
        amount: apartment.amount,
        security_deposit: apartment.security_deposit,
        duration: apartment.duration,
        amenities: apartment.amenities,
        country_code: apartment.country_code,
        state_code: apartment.state_code,
        city_code: apartment.city_code,
        images: apartment.images,
        videos: apartment.videos,
        thumbnail: apartment.thumbnail,
        views_count: apartment.views_count,
        created_at: apartment.created_at,
      }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
