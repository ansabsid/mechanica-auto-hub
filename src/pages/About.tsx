
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Wrench, Award, Settings, MapPin, Globe, ThumbsUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ComingSoonDialog from "@/components/ui/coming-soon-dialog";

const About = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  
  const handleAppDownloadClick = () => {
    setIsComingSoonOpen(true);
  };

  const handleJoinAsGarage = () => {
    navigate('/register');
  };
  
  return (
    <>
      {/* Hero Section */}
      <section className="py-10 md:py-24 bg-mechanica-50">
        <div className="container-custom text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            About <span className="text-mechanica-600">Bookmyparts</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Simplifying car maintenance and parts purchasing across the MENA region.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Bookmyparts was founded in 2025 with a simple mission: to transform how car owners
                in the MENA region find parts and book maintenance services.
              </p>
              <p className="text-gray-600 mb-4">
                Our founders experienced firsthand the challenges of finding quality parts at 
                fair prices, and the frustration of coordinating with multiple garages to get 
                quotes and appointment times.
              </p>
              <p className="text-gray-600 mb-4">
                We built Bookmyparts to bridge this gap - creating a digital marketplace that 
                connects car owners directly with suppliers and service providers, making the 
                process transparent, efficient, and hassle-free.
              </p>
            </div>
            <div className="order-first lg:order-last mb-6 lg:mb-0">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format"
                alt="Bookmyparts Team"
                className="rounded-xl shadow-card object-cover w-full h-64 md:h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-10 md:py-16 bg-mechanica-50">
        <div className="container-custom px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Our Mission</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              We're on a mission to transform car maintenance across the Middle East and North Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-5 md:p-6 rounded-xl shadow-subtle">
              <div className="bg-mechanica-100 p-3 md:p-4 rounded-full inline-flex mb-4 md:mb-6">
                <User className="h-6 w-6 md:h-8 md:w-8 text-mechanica-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">For Car Owners</h3>
              <p className="text-sm md:text-base text-gray-600">
                Provide a single platform where car owners can find parts, compare prices, and book services
                with trusted garages, saving time and money.
              </p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-xl shadow-subtle">
              <div className="bg-mechanica-100 p-3 md:p-4 rounded-full inline-flex mb-4 md:mb-6">
                <Wrench className="h-6 w-6 md:h-8 md:w-8 text-mechanica-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">For Garages</h3>
              <p className="text-sm md:text-base text-gray-600">
                Empower garage owners with digital tools to manage inventory, showcase services,
                and connect with more customers through our marketplace.
              </p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-xl shadow-subtle">
              <div className="bg-mechanica-100 p-3 md:p-4 rounded-full inline-flex mb-4 md:mb-6">
                <Globe className="h-6 w-6 md:h-8 md:w-8 text-mechanica-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">For the Industry</h3>
              <p className="text-sm md:text-base text-gray-600">
                Bring transparency and efficiency to the automotive maintenance industry
                through technology and improved customer experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container-custom px-4">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Our Values</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              The core principles that guide everything we do at Bookmyparts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex space-x-4">
              <div className="bg-mechanica-100 p-2 md:p-3 h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0 flex items-center justify-center">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-mechanica-600" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Quality & Trust</h3>
                <p className="text-sm md:text-base text-gray-600">
                  We prioritize quality parts and services, ensuring every garage and supplier on our platform
                  meets our high standards. Building trust is at the heart of what we do.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="bg-mechanica-100 p-2 md:p-3 h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0 flex items-center justify-center">
                <Settings className="h-5 w-5 md:h-6 md:w-6 text-mechanica-600" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Innovation</h3>
                <p className="text-sm md:text-base text-gray-600">
                  We continuously innovate our platform, incorporating new technologies to make car
                  maintenance simpler, faster, and more efficient for all users.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="bg-mechanica-100 p-2 md:p-3 h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0 flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 md:h-6 md:w-6 text-mechanica-600" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Customer Satisfaction</h3>
                <p className="text-sm md:text-base text-gray-600">
                  We measure our success by the satisfaction of our users. Every feature and service is
                  designed with the customer's needs and experience in mind.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="bg-mechanica-100 p-2 md:p-3 h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0 flex items-center justify-center">
                <MapPin className="h-5 w-5 md:h-6 md:w-6 text-mechanica-600" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Local Focus</h3>
                <p className="text-sm md:text-base text-gray-600">
                  We understand the unique needs of the MENA region, adapting our platform to support
                  local businesses and meet the specific requirements of car owners in this area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-10 md:py-16 bg-gradient-to-r from-mechanica-600 to-mechanica-700 text-white">
        <div className="container-custom text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Join the Bookmyparts Community</h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Whether you're a car owner looking for better maintenance options or a garage wanting to
            grow your business, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              className="bg-mechanica-500 text-white hover:bg-mechanica-500 w-full sm:w-auto"
              onClick={handleAppDownloadClick}
            >
              Download Our App
            </Button>
            <Button 
              className="bg-mechanica-500 text-white hover:bg-mechanica-500 w-full sm:w-auto"
              onClick={handleJoinAsGarage}
            >
              Join as a Garage
            </Button>
          </div>
        </div>
      </section>

      {/* Coming Soon Dialog */}
      <ComingSoonDialog 
        open={isComingSoonOpen}
        onOpenChange={setIsComingSoonOpen}
      />
    </>
  );
};

export default About;
