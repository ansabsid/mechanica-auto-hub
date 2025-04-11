
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Users, Tools, Clock, PhoneCall, Mail, Calendar } from "lucide-react";

const Garages = () => {
  const [filterOption, setFilterOption] = useState("all");
  
  // Mock data for garages
  const garages = [
    {
      id: 1,
      name: "AutoFix Dubai",
      location: "Dubai Marina",
      rating: 4.8,
      reviews: 128,
      services: ["Oil Change", "Brake Service", "Air Conditioning", "Engine Diagnostics"],
      hours: "8:00 AM - 6:00 PM",
      phone: "+971 552552476",
      email: "info@autofixdubai.com",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      name: "Car Care Pro",
      location: "Downtown Dubai",
      rating: 4.6,
      reviews: 93,
      services: ["Wheel Alignment", "Battery Service", "Suspension Repair", "Oil Change"],
      hours: "9:00 AM - 7:00 PM",
      phone: "+971 552552476",
      email: "service@carcarepro.com",
      image: "https://images.unsplash.com/photo-1597762470488-3877a1f26f80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      name: "Mechanica Masters",
      location: "Jumeirah",
      rating: 4.9,
      reviews: 215,
      services: ["Engine Repair", "Transmission Service", "Electrical Systems", "Computer Diagnostics"],
      hours: "8:30 AM - 8:00 PM",
      phone: "+971 552552476",
      email: "service@mechanicamasters.com",
      image: "https://images.unsplash.com/photo-1630066633681-72af2dafb372?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      name: "Garage Masters",
      location: "Deira",
      rating: 4.5,
      reviews: 78,
      services: ["Oil Change", "Tire Service", "Brake Repair", "Air Conditioning"],
      hours: "8:00 AM - 6:00 PM",
      phone: "+971 552552476",
      email: "info@garagemasters.com",
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
  ];

  // Filter garages based on selected option
  const filteredGarages = filterOption === "all" 
    ? garages 
    : garages.filter(garage => 
        garage.services.some(service => 
          service.toLowerCase().includes(filterOption.toLowerCase())
        )
      );

  return (
    <>
      {/* Hero Section */}
      <section className="bg-mechanica-50 py-12 md:py-24">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Find Trusted Garages</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect with our network of professional garages and service centers across the UAE
          </p>
          
          <div className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="Search by location or service..." 
                className="bg-white" 
              />
              <Button className="whitespace-nowrap">
                Find Garages
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Garage Listings */}
      <section className="py-16">
        <div className="container-custom">
          {/* Filter Options */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-3 min-w-max pb-2">
              <Button 
                variant={filterOption === "all" ? "default" : "outline"}
                onClick={() => setFilterOption("all")}
              >
                All Garages
              </Button>
              <Button 
                variant={filterOption === "oil change" ? "default" : "outline"}
                onClick={() => setFilterOption("oil change")}
              >
                Oil Change
              </Button>
              <Button 
                variant={filterOption === "brake" ? "default" : "outline"}
                onClick={() => setFilterOption("brake")}
              >
                Brake Service
              </Button>
              <Button 
                variant={filterOption === "air conditioning" ? "default" : "outline"}
                onClick={() => setFilterOption("air conditioning")}
              >
                AC Service
              </Button>
              <Button 
                variant={filterOption === "engine" ? "default" : "outline"}
                onClick={() => setFilterOption("engine")}
              >
                Engine Work
              </Button>
            </div>
          </div>
          
          {/* Garage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredGarages.map(garage => (
              <Card key={garage.id} className="overflow-hidden border-none shadow-card hover:shadow-xl transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={garage.image} 
                    alt={garage.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{garage.name}</h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <MapPin size={16} className="mr-1" />
                        <span>{garage.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded">
                      <Star size={16} className="mr-1 fill-current" />
                      <span className="font-medium">{garage.rating}</span>
                      <span className="text-sm ml-1 text-gray-500">({garage.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-start mb-3">
                      <Tools size={18} className="text-mechanica-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium mb-1">Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {garage.services.map((service, index) => (
                            <span 
                              key={index} 
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <Clock size={18} className="text-mechanica-600 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Working Hours</h4>
                        <p className="text-gray-600 text-sm">{garage.hours}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button variant="outline" className="flex items-center justify-center">
                      <PhoneCall size={16} className="mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" className="flex items-center justify-center">
                      <Mail size={16} className="mr-2" />
                      Email
                    </Button>
                  </div>
                  
                  <Button className="w-full">
                    <Calendar size={16} className="mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Join as Garage CTA */}
          <div className="mt-16 bg-mechanica-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Own a Garage? Join Our Network</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Partner with BookMyParts to reach more customers, manage your business digitally, 
              and grow your service revenue.
            </p>
            <Button className="bg-mechanica-600 hover:bg-mechanica-700">
              Register Your Garage
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Garages;
