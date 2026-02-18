import React from "react";
import { assets } from "../assets/assets";

function OurPolicy() {
  return (
    <div className="my-12 px-4 md:px-10">
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 text-center">
        {/* First Policy */}
        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-md">
          <img src={assets.exchange_icon} alt="Exchange Policy" className="w-16 h-16 mb-4" />
          <p className="font-semibold text-lg">Easy Exchange Policy</p>
          <p className="text-gray-600 mt-2 text-sm">
            We offer hassle free exchange policy.
          </p>
        </div>

        {/* Second Policy */}
        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-md">
          <img src={assets.quality_icon} alt="Return Policy" className="w-16 h-16 mb-4" />
          <p className="font-semibold text-lg">7 Day Return Policy</p>
          <p className="text-gray-600 mt-2 text-sm">
            We provide 7 day free return policy.
          </p>
        </div>

        {/* Third Policy */}
        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-md">
          <img src={assets.support_img} alt="Customer Support" className="w-16 h-16 mb-4" />
          <p className="font-semibold text-lg">Best Customer Support</p>
          <p className="text-gray-600 mt-2 text-sm">
            We provide 24/7 customer support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OurPolicy;
