
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import CarSearch from "@/components/search/CarSearch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronDown,
  Filter,
  Sliders
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock product data
const products = [
  {
    id: 1,
    name: "Bosch Premium Oil Filter",
    category: "Filters",
    price: 35,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "AutoCare Dubai",
    location: "Dubai Marina",
    availability: "In Stock",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Michelin Pilot Sport 4 Tire",
    category: "Tires",
    price: 199,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "Tire Zone",
    location: "Jumeirah",
    availability: "Limited",
    rating: 4.9,
  },
  {
    id: 3,
    name: "NGK Laser Platinum Spark Plugs",
    category: "Ignition",
    price: 45,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "SparkTech Auto",
    location: "Al Quoz",
    availability: "In Stock",
    rating: 4.7,
  },
  {
    id: 4,
    name: "AC Delco Brake Pads",
    category: "Brakes",
    price: 85,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "BrakeMax",
    location: "Deira",
    availability: "In Stock",
    rating: 4.6,
  },
  {
    id: 5,
    name: "Mobil 1 Synthetic Oil 5W-30",
    category: "Oils & Fluids",
    price: 52,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "AutoCare Dubai",
    location: "Dubai Marina",
    availability: "In Stock",
    rating: 4.9,
  },
  {
    id: 6,
    name: "Denso Cabin Air Filter",
    category: "Filters",
    price: 28,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    garage: "FilterPro",
    location: "Business Bay",
    availability: "In Stock",
    rating: 4.5,
  },
];

// Mock service slots
const serviceSlots = [
  {
    id: 1,
    garage: "AutoCare Dubai",
    service: "Oil Change",
    availableDates: [
      { date: "2025-04-15", slots: ["09:00", "11:30", "14:00", "16:30"] },
      { date: "2025-04-16", slots: ["10:00", "13:30", "15:00"] },
      { date: "2025-04-17", slots: ["09:30", "12:00", "14:30", "17:00"] },
    ],
    price: 150,
    location: "Dubai Marina",
    contact: "+971 50 123 4567",
  },
  {
    id: 2,
    garage: "BrakeMax",
    service: "Brake Service",
    availableDates: [
      { date: "2025-04-15", slots: ["10:00", "13:00", "15:30"] },
      { date: "2025-04-16", slots: ["09:00", "12:30", "16:00"] },
      { date: "2025-04-17", slots: ["11:00", "14:30", "17:30"] },
    ],
    price: 280,
    location: "Deira",
    contact: "+971 50 987 6543",
  },
  {
    id: 3,
    garage: "SparkTech Auto",
    service: "Full Car Service",
    availableDates: [
      { date: "2025-04-16", slots: ["08:30", "13:00"] },
      { date: "2025-04-17", slots: ["09:00", "14:30"] },
      { date: "2025-04-18", slots: ["10:30", "15:00"] },
    ],
    price: 450,
    location: "Al Quoz",
    contact: "+971 50 567 8901",
  },
];

const CustomerDashboard = () => {
  const [sortOption, setSortOption] = useState("recommended");
  const [selectedGarage, setSelectedGarage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <MainLayout>
      <section className="py-8 bg-mechanica-50">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome back, Ahmed</h1>
          <CarSearch />
        </div>
      </section>

      <section className="py-10">
        <div className="container-custom">
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="products" className="flex items-center justify-center gap-2">
                <ShoppingBag size={18} /> Parts & Products
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center justify-center gap-2">
                <Calendar size={18} /> Book Service
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <Filter size={20} className="mr-2 text-gray-500" />
                    <h2 className="text-xl font-semibold">Parts & Products</h2>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Sliders size={16} />
                        Filters
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label htmlFor="sort" className="text-sm text-gray-600">
                        Sort by:
                      </label>
                      <Select 
                        value={sortOption}
                        onValueChange={(value) => setSortOption(value)}
                      >
                        <SelectTrigger id="sort" className="w-[160px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recommended">Recommended</SelectItem>
                          <SelectItem value="priceAsc">Price (Low to High)</SelectItem>
                          <SelectItem value="priceDesc">Price (High to Low)</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {product.availability}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">{product.category}</div>
                        <p className="text-mechanica-600 font-bold text-lg mb-3">${product.price}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-gray-700 font-medium">{product.garage}</div>
                            <div className="flex items-center text-gray-500 text-sm">
                              <MapPin size={14} className="mr-1" /> {product.location}
                            </div>
                          </div>
                          <Button size="sm" className="bg-mechanica-500 hover:bg-mechanica-600">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2 text-gray-500" />
                  <h2 className="text-xl font-semibold">Book a Service</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {serviceSlots.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-xl shadow-subtle overflow-hidden p-5"
                    >
                      <h3 className="font-semibold text-lg mb-2">{service.service}</h3>
                      <p className="text-mechanica-600 font-bold text-lg mb-3">
                        AED {service.price}
                      </p>
                      <div className="mb-4">
                        <div className="text-gray-700 font-medium">{service.garage}</div>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <MapPin size={14} className="mr-1" /> {service.location}
                        </div>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <Phone size={14} className="mr-1" /> {service.contact}
                        </div>
                      </div>

                      <div className="space-y-4 mt-4">
                        <div>
                          <label htmlFor={`date-${service.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Select Date
                          </label>
                          <Select onValueChange={(value) => setSelectedDate(value)}>
                            <SelectTrigger id={`date-${service.id}`}>
                              <SelectValue placeholder="Select date" />
                            </SelectTrigger>
                            <SelectContent>
                              {service.availableDates.map((dateOption) => (
                                <SelectItem key={dateOption.date} value={dateOption.date}>
                                  {new Date(dateOption.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label htmlFor={`time-${service.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Select Time
                          </label>
                          <Select 
                            onValueChange={(value) => setSelectedTime(value)}
                            disabled={!selectedDate}
                          >
                            <SelectTrigger id={`time-${service.id}`}>
                              <SelectValue placeholder={selectedDate ? "Select time" : "Select date first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedDate && 
                                service.availableDates
                                  .find(d => d.date === selectedDate)?.slots
                                  .map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                      {slot}
                                    </SelectItem>
                                  ))
                              }
                            </SelectContent>
                          </Select>
                        </div>

                        <Button 
                          className="w-full bg-mechanica-500 hover:bg-mechanica-600 mt-2"
                          disabled={!selectedDate || !selectedTime}
                        >
                          Book Appointment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </MainLayout>
  );
};

export default CustomerDashboard;
