'use client'
import React, { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { ColonIcon } from '@/icons';
import { AxiosApi } from '@/services/backend-api';

interface Review {
  id: number;
  user: { name: string };
  rating: number;
  comment: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await AxiosApi('guest').get(baseURL + '/apartments?limit=4');
      const apartments = response.data.data.data || [];
      const allReviews: Review[] = [];
      
      apartments.forEach((apt: any) => {
        if (apt.ratings && apt.ratings.length > 0) {
          allReviews.push(...apt.ratings);
        }
      });
      
      setReviews(allReviews.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch reviews');
    }
  };

  if (reviews.length === 0) return null;

  return (
    <div className='w-full bg-gradient-to-l from-[bg-gradient-to-l from-[#FE8C00] to-[#FF6B00] py-10 text-white justify-center items-center flex flex-col gap-2 md:gap-8'>
      <h1 className='text-[.7em] md:text-[.8em] font-bold text-white'>FEW REVIEWS YOU SHOULD SEE</h1>
      <div className='text-xl md:text-3xl font-semibold'>
        <span>What people are saying about us</span>
      </div>

      <Carousel className="w-[95%] md:w-[85%]">
        <CarouselContent className='w-full md:w-[50%] h-[300px] md:h-[320px]'>
          {reviews.map((item, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className='w-full h-full border-none flex flex-col gap-2'>
                  <CardContent className="shadow-sm shadow-orange-600 flex w-full h-[200px] items-center justify-center p-6">
                    <div className='flex flex-col gap-6'>
                      <ColonIcon className='w-10 md:w-20'/>
                      <p className='text-[.8em] lg:text-[1em]'>
                        {item.comment}
                      </p>
                    </div>
                  </CardContent>

                  <div className='text-[.8em] md:text-[.9em] px-6'>
                    <h3>{item.user?.name || 'Anonymous'}</h3>
                    <div>
                      {[...Array(item.rating)].map((_, starIndex) => (
                        <span key={starIndex} className="text-white">&#9733;</span>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className='flex gap-2 justify-end items-center'>
          <CarouselPrevious className='w-14 h-14'/>
          <CarouselNext className='w-14 h-14'/>
        </div>
      </Carousel>
    </div>
  )
}

export default Reviews