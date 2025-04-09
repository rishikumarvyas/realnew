
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NewsletterSection = () => {
  return (
    <section className="py-16 bg-realestate-blue text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Stay Updated with PropVerse</h2>
          <p className="mb-6 text-gray-200">
            Subscribe to our newsletter to receive the latest property listings and real estate news
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="h-12 text-black placeholder:text-gray-500"
            />
            <Button className="h-12 px-6 bg-realestate-teal hover:bg-opacity-80 sm:w-auto">
              Subscribe
            </Button>
          </form>
          <p className="text-sm mt-3 text-gray-300">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
