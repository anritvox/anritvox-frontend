import React, { useState } from "react";
import { submitContact } from "../services/api"; // Ensure this path is correct

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For phone, only allow digits
    if (name === "phone") {
      setForm((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, "") }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // --- Start Validation Logic ---
    if (!form.name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      setError("Email address is required.");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!form.message.trim()) {
      setError("Message is required.");
      setLoading(false);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (form.phone.trim() !== "" && !phoneRegex.test(form.phone)) {
      setError("Phone number must be exactly 10 digits if provided.");
      setLoading(false);
      return;
    }
    // --- End Validation Logic ---

    try {
      await submitContact(form);
      setSuccess("Message sent successfully!");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const commonInputClasses =
    "w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm";
  const commonButtonClasses =
    "w-full bg-lime-700 hover:bg-lime-800 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    // Main container with white background and Inter font
    // Changed flex-col for responsiveness on small screens
    <div className="min-h-screen bg-white text-gray-900 font-inter antialiased flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
        <span className="text-lime-700">Contact Us</span>
      </h1>
      <p className="text-gray-700 text-center mb-6">
        Have questions or feedback? We'd love to hear from you!
      </p>

      {/* --- Main Two-Column Layout Container --- */}
      {/* Added flex, flex-col for mobile, md:flex-row for desktop, gap-8 for spacing, and max-w for overall width */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-8 w-full max-w-5xl">
        {" "}
        {/* Adjust max-w as needed */}
        {/* Left Side: Connect With Us Card */}
        {/* Adjusted max-w to flex effectively within the column layout */}
        <div className="max-w-md w-full bg-lime-700 text-white rounded-2xl shadow-xl border border-lime-600 p-8 space-y-6 animate-fade-in md:order-1">
          {" "}
          {/* md:order-1 keeps it first on desktop */}
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Connect With Us
          </h2>
          <p className="text-center text-lime-100 mb-6">
            For any enquiries or direct communication, feel free to reach out to
            us!
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 bg-lime-600 p-4 rounded-lg shadow-inner">
              <svg
                className="h-8 w-8 text-lime-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                ></path>
              </svg>
              <a
                href="tel:+919654131435"
                className="text-white text-xl font-semibold hover:underline"
              >
                +91 9654131435
              </a>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-lime-600 p-4 rounded-lg shadow-inner">
              <svg
                className="h-8 w-8 text-lime-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 4v7a2 2 0 002 2h14a2 2 0 002-2v-7m-18 0l-2 2.5v4.5a2 2 0 002 2h14a2 2 0 002-2V14.5L21 12m-18 0V7a2 2 0 012-2h14a2 2 0 012 2v5"
                ></path>
              </svg>
              <a
                href="mailto:Anritvox@gmail.com"
                className="text-white text-xl font-semibold hover:underline break-all"
              >
                Anritvox@gmail.com
              </a>
            </div>
          </div>
        </div>
        {/* Right Side: Contact Form */}
        {/* Adjusted max-w and added animate-fade-in */}
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6 animate-fade-in md:order-2">
          {" "}
          {/* md:order-2 keeps it second on desktop */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            Send a <span className="text-lime-700">Message</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
              className={commonInputClasses}
              disabled={loading}
            />
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
              className={commonInputClasses}
              disabled={loading}
            />
            <input
              name="phone"
              type="tel"
              placeholder="Your Phone (Optional, 10 digits)"
              value={form.phone}
              onChange={handleChange}
              className={commonInputClasses}
              maxLength="10"
              disabled={loading}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
              className={`${commonInputClasses} min-h-[100px]`}
              disabled={loading}
            />
            <button
              type="submit"
              className={commonButtonClasses}
              disabled={loading || !form.name || !form.email || !form.message}
            >
              {loading ? "Sending Message..." : "Send Message"}
            </button>
          </form>
          {error && (
            <p className="mt-4 text-red-600 text-center animate-fade-in">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 text-green-700 text-center animate-fade-in">
              {success}
            </p>
          )}
        </div>
      </div>

      {/* Tailwind CSS custom animations and font import (Included for completeness) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
