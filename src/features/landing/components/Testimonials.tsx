"use client"
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D",
    text: "MenuTech has completely transformed our restaurant's online presence. Our orders have skyrocketed since we started using their platform. The ability to showcase our menu in such an appealing way has brought in a lot more guests!",
  },
  {
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D",
    text: "The team at MenuTech is fantastic! Their tools made it easy for us to increase visibility and attract new customers. We've seen significant growth, and our customers love the smooth ordering process.",
  },
  {
    image: "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fDA%3D",
    text: "Since partnering with MenuTech, our sales have increased by 30%! Their seamless interface and advanced marketing tools are just what we needed to streamline our operations and drive traffic. Highly recommend!",
  },
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

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
                    
                    <div className="w-full md:w-[40%] flex items-center justify-start p-3 text-white">
                      <span className="text-sm md:text-xl font-semibold">{testimonial.text}</span>
                    </div>

                    <div className="w-full md:w-[60%] h-[300px] md:h-[500px] flex items-center justify-center border border-white rounded-xl overflow-hidden">
                      <img
                        src={testimonial.image}
                        alt={`Testimonial ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
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


