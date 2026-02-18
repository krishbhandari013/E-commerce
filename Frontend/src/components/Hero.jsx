import React from 'react';
import { assets } from '../assets/assets';

const HeroSection = () => {
  return (
    <div className="w-full border-2 border-gray-200 min-h-[600px] overflow-hidden">
      {/* Mobile: Stacked, Desktop: Side by side */}
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* Left Section - Text Content */}
        <div className="lg:w-1/2 flex items-center justify-center order-2 lg:order-1 p-8 md:p-12 lg:p-16 bg-white min-h-[300px] lg:min-h-[600px]">
          <div className="text-center max-w-md">
            
            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 md:w-16 h-0.5 bg-gray-800"></div>
                    <p className="text-xs md:text-lg text-gray-500 tracking-[0.3em] font-medium">
                        OUR BESTSELLERS
                    </p>
            </div>
            
                 <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-gray-900 mb-6 whitespace-nowrap">
                        Latest Arrivals
                     </h1>
            
            {/* SHOP NOW with line */}
            <div className="flex items-center justify-center gap-3 group cursor-pointer">
              <p className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-gray-600 transition-colors">
                
                SHOP NOW
              </p>
              <div className="w-12 md:w-16 h-0.5 bg-gray-800 group-hover:bg-gray-600 group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>
        </div>

        {/* Right Section - Image - Full coverage */}
        <div className="lg:w-1/2 h-[300px] lg:h-[600px] overflow-hidden order-1 lg:order-2">
          <img 
            src={assets.hero_img} 
            alt="Latest Arrivals" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;