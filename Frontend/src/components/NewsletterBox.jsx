import React, { useState } from "react";

function NewsletterBox() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  return (
    <div className="my-12 px-4 md:px-10  text-black py-12">
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
          Subscribe Now & Get <span className="text-gray-800">20% Off</span>
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg mb-8 text-gray-600">
          Join our newsletter and stay updated with the latest products, offers, and exclusive deals.
        </p>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full sm:w-2/3 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewsletterBox;
