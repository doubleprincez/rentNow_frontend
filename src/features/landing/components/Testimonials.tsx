"use client"
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AxiosApi } from '@/lib/utils';

interface Testimonial {
  id: number;
  user: { name: string };
  rating: number;
  comment: string;
  apartment?: { 
    title: string;
    media?: Array<{ url: string }>;
  };
}

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await AxiosApi('guest').get(baseURL + '/apartments?limit=3');
      const apartments = response.data.data.data || [];
      const allTestimonials: Testimonial[] = [];
      
      apartments.forEach((apt: any) => {
        if (apt.ratings && apt.ratings.length > 0) {
          allTestimonials.push(...apt.ratings.map((r: any) => ({ ...r, apartment: apt })));
        }
      });
      
      setTestimonials(allTestimonials.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch testimonials');
    }
  };

  if (testimonials.length === 0) return null;

  const handlePrevious = () => {
    const isFirst = currentIndex === 0;
    const newIndex = isFirst ? testimonials.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const isLast = currentIndex === testimonials.length - 1;
    const newIndex = isLast ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div 
    style={{
      background: `url('/assets/test-bg.jpeg')`,
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
    }} 
    className="w-full flex flex-col items-center"
    >
      <div className="w-full h-full bg-gray-600 bg-opacity-60 py-10">

        <div className="relative mx-auto w-[90%] flex items-center justify-center">
          
          <div>
            <button
              onClick={handlePrevious}
              className="lg:h-16 lg:w-16 md:w-12 md:h-12 w-10 h-10 flex items-center justify-center rounded-full"
            >
              <ChevronLeft className="h-10 md:h-16 w-10 md:w-16 text-white"/>
            </button>
          </div>

          <div className="w-full overflow-hidden">
            <div
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="min-w-full px-4 py-4 lg:py-6"> 
                  <div className="flex flex-col md:flex-row items-center justify-center w-full md:h[400px]">
                    
                    <div className="w-full md:w-[40%] flex flex-col items-center justify-start p-3 text-white gap-2">
                      <span className="text-sm md:text-xl font-semibold">{testimonial.comment}</span>
                      <span className="text-xs md:text-sm">- {testimonial.user?.name || 'Anonymous'}</span>
                      {testimonial.apartment && (
                        <span className="text-xs text-gray-300">{testimonial.apartment.title}</span>
                      )}
                    </div>

                    <div className="w-full md:w-[60%] h-[300px] md:h-[500px] flex items-center justify-center border border-white rounded-xl overflow-hidden">
                      {testimonial.apartment?.media?.[0] ? (
                        <img
                          src={testimonial.apartment.media[0].url}
                          alt={testimonial.apartment.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-white">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div>
            <button
              onClick={handleNext}
              className="lg:h-16 lg:w-16 md:w-12 md:h-12 w-10 h-10 flex items-center justify-center rounded-full"
            >
              <ChevronRight className="h-10 md:h-16 w-10 md:w-16 text-white" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TestimonialCarousel;


