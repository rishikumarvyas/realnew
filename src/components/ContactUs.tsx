import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

export function ContactUs() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend

    setFormSubmitted(true);

    // Reset form after showing success message
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with enhanced background */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/api/placeholder/1920/600')",
            filter: "brightness(0.4)",
          }}
        ></div>

        <div className="relative bg-gradient-to-r from-black/80 via-black/70 to-black/80 text-white py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-300">
                  Contact Us
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                We're here to help you find your perfect home. Reach out to our
                team for personalized assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Hero section diagonal cut */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50 transform -skew-y-2 translate-y-8"></div>
      </div>

      {/* Contact Info Cards - Enhanced with glass effect and better colors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 -mt-24">
          {/* Office Location */}
          <div className="glass-effect bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-8 text-center transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">
              Our Location
            </h3>
            <p className="text-gray-600">
              42 Sardar Patel Road, Connaught Place, New Delhi, 110001, India
            </p>
          </div>

          {/* Phone */}
          <div className="glass-effect bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-8 text-center transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Call Us</h3>
            <p className="text-gray-600">
              Customer Support: +91 98765 43210
              <br />
              Sales Inquiries: +91 98765 43211
            </p>
          </div>

          {/* Email */}
          <div className="glass-effect bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-8 text-center transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">Email Us</h3>
            <p className="text-gray-600">
              General Inquiries: contact@homeyatra.in
              <br />
              Support: support@homeyatra.in
            </p>
          </div>

          {/* Business Hours */}
          <div className="glass-effect bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-8 text-center transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-gray-800">
              Business Hours
            </h3>
            <p className="text-gray-600">
              Monday - Saturday: 9AM - 7PM
              <br />
              Sunday: 10AM - 2PM (Online Support Only)
            </p>
          </div>
        </div>

        {/* Contact Form and Map Section - Enhanced with better styling */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-gray-800">
                Send Us a Message
              </h2>
              <div className="w-20 h-1 bg-blue-500 rounded-full"></div>
            </div>

            {formSubmitted ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex items-center animate-fade-in">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 text-lg">
                    Thank you for your message!
                  </h3>
                  <p className="text-green-700">
                    We have received your inquiry and will get back to you soon.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name*
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address*
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="subject"
                      className="text-sm font-medium text-gray-700"
                    >
                      Subject*
                    </Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="property-inquiry">Property Inquiry</option>
                      <option value="buying-assistance">
                        Buying Assistance
                      </option>
                      <option value="rental-inquiry">Rental Inquiry</option>
                      <option value="selling-property">
                        Selling My Property
                      </option>
                      <option value="general-inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700"
                  >
                    Your Message*
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-8 py-6 transition-all duration-300 shadow-lg"
                >
                  <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Map or Office Image - Enhanced with better styling */}
          <div className="rounded-2xl overflow-hidden shadow-xl h-full">
            <div className="h-full min-h-[500px] bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-10 relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: "url('/api/placeholder/800/600')" }}
              ></div>

              <div className="relative z-10 text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MapPin className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-3xl font-bold mb-4 text-gray-800">
                  Visit Our Office
                </h3>
                <p className="text-gray-700 mb-8 text-lg">
                  Come visit us at our Delhi headquarters to meet our team in
                  person. We're conveniently located in Connaught Place, easily
                  accessible by metro and other public transportation.
                </p>

                <Button
                  className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg rounded-full px-8 py-5"
                  onClick={() =>
                    window.open("https://maps.google.com", "_blank")
                  }
                >
                  Get Directions
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Enhanced with better styling */}
      <div className="bg-gradient-to-b from-white to-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-blue-500 rounded-full mx-auto"></div>
          </div>

          <div className="grid gap-6">
            {[
              {
                question: "How can I list my property on Homeyatra?",
                answer:
                  "You can list your property by creating an account and using our 'Post Property' feature. The process is simple and guided, requiring details about your property, photos, and pricing information.",
              },
              {
                question: "What documents do I need to buy a property?",
                answer:
                  "For purchasing a property, you'll need identity proof, address proof, PAN card, income documents like salary slips or ITR, and property documents. Our agents can provide specific guidance based on your situation.",
              },
              {
                question: "How does Homeyatra verify listed properties?",
                answer:
                  "We have a stringent verification process where our team physically visits properties, verifies ownership documents, and checks legal clearances before listings are approved on our platform.",
              },
              {
                question: "Do you charge any fees for property visits?",
                answer:
                  "No, property visits arranged through Homeyatra are completely free of charge. We believe in helping you find the perfect home without any hidden costs.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <h3 className="font-bold text-xl mb-3 text-gray-800">
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-lg">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action - Enhanced with better styling */}
      <div className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/api/placeholder/1920/600')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-900"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-16 border border-white/20 shadow-2xl">
            <h2 className="text-4xl font-extrabold mb-6 text-white">
              Ready to find your dream home?
            </h2>
            <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Our property experts are standing by to help you navigate the real
              estate market in India.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                className="bg-white text-blue-700 hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-medium shadow-xl"
                onClick={() => (window.location.href = "/properties?type=buy")}
              >
                Browse Properties
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-8 py-6 text-lg font-medium shadow-xl"
                onClick={() => (window.location.href = "/signup")}
              >
                Create an Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
