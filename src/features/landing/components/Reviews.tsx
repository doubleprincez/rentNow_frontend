import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { ColonIcon } from '@/icons';

const Reviews = () => {

  const data = [
    { 
        name: 'Stephanie Moore', 
        review: 'RentNaija is a fantastic platform! I found a beautiful apartment within days, and the process was seamless. Highly recommend it to anyone looking for a reliable home.', 
        stars: 5 
    },
    { 
        name: 'Micheal Coker',
        review: `RentNaija has made finding a home so easy. The listings are accurate, and the team was super helpful throughout the process. Great experience overall!`, 
        stars: 4 
    },
    { 
        name: 'Paul Bettany', 
        review: 'I love using RentNaija! They have so many options, and the customer support team was quick to answer my questions. A truly reliable service.', 
        stars: 5 
    },
    { 
        name: 'Jane Olayemi', 
        review: 'RentNaija helped me secure a great apartment in a prime location. The entire experience was smooth and stress-free. I highly recommend their service.', 
        stars: 4 
    },
];


  return (
    <div className='w-full bg-gradient-to-l from-[bg-gradient-to-l from-[#FE8C00] to-[#FF6B00] py-10 text-white justify-center items-center flex flex-col gap-2 md:gap-8'>
      <h1 className='text-[.7em] md:text-[.8em] font-bold text-white'>FEW REVIEWS YOU SHOULD SEE</h1>
      <div className='text-xl md:text-3xl font-semibold'>
        <span>What people are saying about us</span>
      </div>

      <Carousel className="w-[95%] md:w-[85%]">

        <CarouselContent className='w-full md:w-[50%] h-[300px] md:h-[320px]'>
          {data.map((item, index) => (
            <CarouselItem key={index} className=''>
              <div className="p-1">
                <Card className='w-full h-full border-none flex flex-col gap-2'>
                  <CardContent className="shadow-sm shadow-orange-600 flex w-full h-[200px] items-center justify-center p-6">
                    <div className='flex flex-col gap-6'>
                      <ColonIcon className='w-10 md:w-20'/>
                      <p className='text-[.8em] lg:text-[1em]'>
                        {item.review}
                      </p>
                    </div>
                  </CardContent>

                  <div className='text-[.8em] md:text-[.9em] px-6'>
                    <h3>{item.name}</h3>
                    <div>
                      {[...Array(item.stars)].map((_, starIndex) => (
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