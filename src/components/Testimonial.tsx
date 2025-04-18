import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialProps {
  name: string;
  location: string;
  quote: string;
  rating?: number;
  image?: string;
  avatar?: string;
}

export const Testimonial = ({ name, location, quote, rating = 5, image, avatar }: TestimonialProps) => {
  return (
    <div className="bg-blue-50 p-10 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative">
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
        <div className="w-10 h-10 bg-blue-400 rotate-45"></div>
      </div>
      <div className="flex items-center gap-2 mb-4 text-blue-500">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-current" />
        ))}
      </div>
      <p className="text-gray-600 mb-8 italic text-lg">"{quote}"</p>
      <div className="flex items-center">
        <img src={avatar || image || "/api/placeholder/100/100"} alt={name} className="w-14 h-14 rounded-full mr-4" />
        <div>
          <p className="font-bold text-blue-700 text-lg">{name}</p>
          <p className="text-blue-400">{location}</p>
        </div>
      </div>
    </div>
  );
};