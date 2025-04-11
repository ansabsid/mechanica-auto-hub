import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  Settings, 
  CreditCard, 
  Smartphone, 
  Star, 
  ChevronRight, 
  CheckCircle2
} from "lucide-react";

// Featured products data
const featuredProducts = [
  {
    id: 1,
    name: "Bosch Premium Oil Filter",
    price: 35,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "AutoCare Dubai",
    availability: "In Stock",
  },
  {
    id: 2,
    name: "Michelin Pilot Sport 4 Tire",
    price: 199,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "Tire Zone",
    availability: "Limited",
  },
  {
    id: 3,
    name: "NGK Laser Platinum Spark Plugs",
    price: 45,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "SparkTech Auto",
    availability: "In Stock",
  },
  {
    id: 4,
    name: "AC Delco Brake Pads",
    price: 85,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "BrakeMax",
    availability: "In Stock",
  },
];

// Trusted garage logos
const trustedGarages = [
  "AutoCare Dubai",
  "BrakeMax",
  "Emirates Garage",
  "SparkTech Auto",
  "Tire Zone",
  "DXB Car Services",
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Ahmed Hassan",
    position: "Car Owner",
    content: "Mechanica made finding parts for my Toyota so much easier. I was able to compare prices and find the best deal without visiting multiple garages."
  },
  {
    id: 2,
    name: "Mohammed Ali",
    position: "Garage Owner",
    content: "Since joining Mechanica, our garage has seen a 40% increase in parts sales and service bookings. The platform makes inventory management simple."
  },
  {
    id: 3,
    name: "Sara Khan",
    position: "Car Owner",
    content: "I booked a service appointment through Mechanica and everything was smooth - from selecting available slots to payment. Highly recommended!"
  }
];

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-mechanica-50 to-white py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Find Car Parts & Book Services <span className="text-mechanica-600">Easily</span>
              </h1>
              <p className="text-xl text-gray-600">
                Connect with local garages and suppliers to find the right parts
                and book service appointments for your vehicle.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Button className="btn-primary">
                  <Smartphone className="mr-2 h-5 w-5" /> Download App
                </Button>
                {!isAuthenticated && (
                  <Link to="/login">
                    <Button variant="outline" className="btn-secondary w-full sm:w-auto">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="lg:block hidden">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format"
                alt="Mechanica Car Service"
                className="rounded-xl shadow-card object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Parts</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our selection of top-quality car parts from trusted suppliers and garages
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-subtle overflow-hidden card-hover"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-mechanica-600 font-bold mb-2">${product.price}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{product.garage}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {product.availability}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" className="btn-secondary">
              View All Products <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Mechanica Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find parts and book services in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-mechanica-100 p-4 rounded-full mb-6">
                <Settings className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Your Car</h3>
              <p className="text-gray-600">
                Select your car's manufacturer, model, and make year to find compatible parts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-mechanica-100 p-4 rounded-full mb-6">
                <Settings className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Browse Parts</h3>
              <p className="text-gray-600">
                Explore a wide range of parts from various garages and suppliers in your area.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-mechanica-100 p-4 rounded-full mb-6">
                <CreditCard className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect & Buy</h3>
              <p className="text-gray-600">
                Purchase parts or book service appointments directly through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-mechanica-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from car owners and garage operators who use Mechanica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-subtle">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="bg-mechanica-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-mechanica-600">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-gray-900">Trusted by Garages Across MENA</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {trustedGarages.map((garage, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-gray-100 px-6 py-3 rounded-lg">
                  <span className="text-gray-700 font-semibold">{garage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-mechanica-600 to-mechanica-700 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Download the Mechanica App</h2>
              <p className="text-xl mb-6 text-white/90">
                Get the full experience on your smartphone. Find parts, book services, and manage
                your vehicles on the go.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-white" />
                  <span>Quick search for parts by vehicle</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-white" />
                  <span>Book service appointments</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-white" />
                  <span>Track orders and service history</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button className="bg-white text-mechanica-700 hover:bg-gray-100">
                  Download on App Store
                </Button>
                <Button className="bg-white text-mechanica-700 hover:bg-gray-100">
                  Get it on Google Play
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format"
                alt="Mechanica App"
                className="rounded-xl shadow-lg object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
