'use server';

import { baseURL } from '@/../next.config';

export async function searchApartments(params: { category?: string; state_code?: string; country_code: string }) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.category && params.category !== 'all') {
      queryParams.append('category', params.category);
    }
    if (params.state_code && params.state_code !== 'all') {
      queryParams.append('state_code', params.state_code);
    }
    queryParams.append('country_code', params.country_code);
    
    const response = await fetch(`${baseURL}/apartments?${queryParams.toString()}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    
    const data = await response.json();
    
    if (data.success && data.data?.data) {
      // Filter sensitive data
      return {
        success: true,
        data: data.data.data.map((apt: any) => ({
          id: apt.id,
          category: apt.category,
          state_code: apt.state_code,
          city_code: apt.city_code,
          title: apt.title,
          description: apt.description,
          amount: apt.amount,
          duration: apt.duration,
          images: apt.images,
          created_at: apt.created_at,
        })),
      };
    }
    
    return { success: false, data: [], message: 'No apartments found' };
  } catch (error) {
    console.error('Search error:', error);
    return { success: false, data: [], message: 'Failed to search apartments' };
  }
}
