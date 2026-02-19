import React, { useState } from "react";
import { assets } from "../assets/assets";

function Footer() {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="bg-white text-gray-900 py-12 px-4 md:px-8 lg:px-16 border-t border-gray-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto">
       
       

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-20 xl:gap-24">
          {/* Section 1: Logo & About - Takes more space */}
          <div className="md:col-span-5">
            <div className="flex flex-col space-y-4">
              <img 
                src={assets.logo}
                alt="Company Logo" 
                className="w-36 h-auto hover:opacity-80 transition-opacity cursor-pointer" 
              />
              <p className="text-gray-600 text-sm leading-relaxed">
                At <span className="font-semibold text-gray-900">Your Company Name</span>, 
                we strive to bring you the best shopping experience possible. With a wide range 
                of high-quality products, we ensure that every item is carefully selected to meet 
                our strict quality standards.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our mission is to provide exceptional service, fast delivery, and hassle-free 
                shopping, making us a trusted choice for customers worldwide.
              </p>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="md:col-span-3">
            <h3 className="font-semibold text-lg mb-4 relative inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "Delivery", path: "/delivery" },
                { name: "Privacy & Policy", path: "/privacy" }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.path} 
                    className="text-gray-600 hover:text-gray-900 transition-all duration-300 relative group inline-block"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Contact */}
          <div className="md:col-span-4">
            <h3 className="font-semibold text-lg mb-4 relative inline-block">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://facebook.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-all duration-300 group"
                >
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </span>
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-all duration-300 group"
                >
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                    </svg>
                  </span>
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@company.com" 
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-all duration-300 group"
                >
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </span>
                  <span>info@company.com</span>
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </span>
                <span>+123 456 7890</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider with decorative elements */}
        <div className="mt-12 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-gray-400 text-sm">
              Connect With Us
            </span>
          </div>
        </div>

        {/* Copyright and Additional Links */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500">
          <div>
            &copy; {currentYear} Your Company Name. All rights reserved.
          </div>
         
        </div>
      </div>

      {/* Back to Top Button - Interactive */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center group"
        aria-label="Back to top"
      >
        <svg 
          className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
        </svg>
      </button>
    </footer>
  );
}

export default Footer;