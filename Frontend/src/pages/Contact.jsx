// contactus.jsx - Contact Section (Mobile Optimized)
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.subject?.trim()) newErrors.subject = "Subject is required";
    if (!formData.message?.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Mobile: Form First, Info Second */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Form - Left on Mobile & Desktop */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white border border-gray-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl md:text-2xl font-bold mb-6">Send us a Message</h2>
              
              {isSubmitted && (
                <div className="mb-6 p-4 bg-gray-100 border border-gray-300 text-gray-800 rounded">
                  <p className="text-sm font-medium">✓ Thank you! We'll get back to you soon.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* Name - Full width on mobile */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } focus:border-black focus:ring-1 focus:ring-black outline-none text-sm md:text-base`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email - Full width on mobile */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:border-black focus:ring-1 focus:ring-black outline-none text-sm md:text-base`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Subject - Full width on mobile */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className={`w-full px-4 py-3 border ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    } focus:border-black focus:ring-1 focus:ring-black outline-none text-sm md:text-base`}
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                {/* Message - Full width on mobile */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Please write your message here..."
                    className={`w-full px-4 py-3 border ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    } focus:border-black focus:ring-1 focus:ring-black outline-none resize-none text-sm md:text-base`}
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 md:py-4 px-4 hover:bg-gray-800 transition-colors font-medium text-sm md:text-base"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information - Right on Desktop, Below on Mobile */}
          <div className="lg:col-span-1 order-2 mt-8 lg:mt-0">
            <div className="bg-gray-50 p-6 md:p-8 border border-gray-200">
              <h2 className="text-xl md:text-2xl font-bold mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-black flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base mb-1">Address</h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      123 Business Avenue<br />
                      Suite 100<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-black flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base mb-1">Phone</h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      +1 (555) 123-4567<br />
                      +1 (555) 987-6543
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-black flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base mb-1">Email</h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      support@example.com<br />
                      info@example.com
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-black flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base mb-1">Business Hours</h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      Mon-Fri: 9am - 6pm<br />
                      Sat: 10am - 4pm<br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links - Horizontal scroll on mobile if needed */}
              <div className="mt-8">
                <h3 className="font-semibold text-sm md:text-base mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-3">
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.68-3.656 13.5 13.5 0 001.294-5.334c0-.807-.018-1.612-.054-2.416A9.96 9.96 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section - Simplified for mobile */}
      <div className="mt-12 md:mt-16">
  <div className="w-full h-48 md:h-64 overflow-hidden">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316bc7fc6b%3A0xbfff3d9b71d6bc8b!2s123%20Business%20Ave%2C%20New%20York%2C%20NY%2010001%2C%20USA!5e0!3m2!1sen!2s!4v1612345678901!5m2!1sen!2s"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Business Location"
      className="w-full h-full"
    ></iframe>
  </div>
</div>

        {/* FAQ Link */}
        <div className="mt-10 md:mt-12 text-center">
          <p className="text-sm text-gray-500 mb-3">Looking for answers?</p>
          <Link 
            to="/faq" 
            className="inline-flex items-center gap-2 text-sm md:text-base font-medium border-b border-black pb-0.5 hover:gap-3 transition-all"
          >
            Visit our FAQ page
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}