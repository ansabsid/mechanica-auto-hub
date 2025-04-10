import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  PhoneCall, 
  Mail, 
  Store, 
  DollarSign, 
  Users, 
  BarChart, 
  CheckCircle2, 
  Calendar,
  ShoppingBag,
  Shield,
  ArrowRight
} from "lucide-react";

const Garages = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Garage onboarding form submitted");
    // Handle form submission logic
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-24 bg-mechanica-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Grow Your Garage Business with <span className="text-mechanica-600">Mechanica</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join our marketplace platform to reach more customers, sell more parts,
                and fill your service bays efficiently.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <a href="#signup">
                  <Button className="btn-primary w-full sm:w-auto">
                    Join Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Button variant="outline" className="btn-secondary w-full sm:w-auto">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format"
                alt="Garage Business"
                className="rounded-xl shadow-card object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits of Joining Mechanica</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock new opportunities for your garage and streamline your operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-mechanica-50 p-6 rounded-xl">
              <div className="bg-white p-4 rounded-full inline-flex mb-6 shadow-subtle">
                <Users className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">More Customers</h3>
              <p className="text-gray-600">
                Reach a wider audience of car owners looking specifically for the parts and services you offer.
              </p>
            </div>

            <div className="bg-mechanica-50 p-6 rounded-xl">
              <div className="bg-white p-4 rounded-full inline-flex mb-6 shadow-subtle">
                <ShoppingBag className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Manage Inventory</h3>
              <p className="text-gray-600">
                Easily list and manage your parts inventory through our intuitive dashboard.
              </p>
            </div>

            <div className="bg-mechanica-50 p-6 rounded-xl">
              <div className="bg-white p-4 rounded-full inline-flex mb-6 shadow-subtle">
                <Calendar className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Schedule Services</h3>
              <p className="text-gray-600">
                Let customers book service appointments directly through the platform, filling your schedule efficiently.
              </p>
            </div>

            <div className="bg-mechanica-50 p-6 rounded-xl">
              <div className="bg-white p-4 rounded-full inline-flex mb-6 shadow-subtle">
                <DollarSign className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Increased Revenue</h3>
              <p className="text-gray-600">
                Boost your parts sales and service bookings by reaching customers actively looking for what you offer.
              </p>
            </div>

            <div className="bg-mechanica-50 p-6 rounded-xl">
              <div className="bg-white p-4 rounded-full inline-flex mb-6 shadow-subtle">
                <BarChart className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Business Insights</h3>
              <p className="text-gray-600">
                Access analytics and reporting to understand your best-selling products and most popular services.
              </p>
            </div>

            <div className="bg-mechanica-50 p-6 rounded-xl">
              <div className="bg-white p-4 rounded-full inline-flex mb-6 shadow-subtle">
                <Shield className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trusted Platform</h3>
              <p className="text-gray-600">
                Join a vetted network of quality garages, building customer trust and loyalty through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-mechanica-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with Mechanica is simple
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-subtle h-full">
                <div className="bg-mechanica-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-mechanica-600 font-bold text-lg">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Sign Up</h3>
                <p className="text-gray-600">
                  Complete the onboarding form with your garage details and services offered.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="h-8 w-8 text-mechanica-300" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-subtle h-full">
                <div className="bg-mechanica-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-mechanica-600 font-bold text-lg">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">List Products</h3>
                <p className="text-gray-600">
                  Add your parts inventory and service offerings to your garage dashboard.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="h-8 w-8 text-mechanica-300" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-subtle h-full">
                <div className="bg-mechanica-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-mechanica-600 font-bold text-lg">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Set Availability</h3>
                <p className="text-gray-600">
                  Configure your service bay availability and appointment slots.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="h-8 w-8 text-mechanica-300" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-subtle h-full">
              <div className="bg-mechanica-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-mechanica-600 font-bold text-lg">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Start Selling</h3>
              <p className="text-gray-600">
                Begin receiving orders and appointment bookings from customers in your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Garage Owners Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from garages already using Mechanica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-mechanica-50 p-6 rounded-xl">
              <p className="text-gray-600 mb-6 italic">
                "Since joining Mechanica, our parts sales have increased by 35%. The platform makes
                it easy to list products and manage inventory, while bringing us customers we wouldn't
                have reached otherwise."
              </p>
              <div className="flex items-center">
                <div className="bg-mechanica-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-mechanica-600">M</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Mohammed Al-Farsi</p>
                  <p className="text-sm text-gray-500">AutoCare Dubai</p>
                </div>
              </div>
            </div>

            <div className="bg-mechanica-50 p-6 rounded-xl">
              <p className="text-gray-600 mb-6 italic">
                "The appointment scheduling feature has transformed how we manage our service bays.
                No more double-bookings or missed appointments, and our mechanics' time is now fully optimized."
              </p>
              <div className="flex items-center">
                <div className="bg-mechanica-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-mechanica-600">A</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Ahmed Khouri</p>
                  <p className="text-sm text-gray-500">SparkTech Auto</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-mechanica-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees or complicated rate structures
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-card overflow-hidden">
            <div className="bg-mechanica-600 text-white p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Standard Plan</h3>
              <p className="opacity-90">Perfect for independent garages and small businesses</p>
            </div>
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-mechanica-500 flex-shrink-0" />
                  <span><strong>5%</strong> commission on parts sold through the platform</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-mechanica-500 flex-shrink-0" />
                  <span><strong>AED 10</strong> per service appointment booked</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-mechanica-500 flex-shrink-0" />
                  <span>Unlimited product listings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-mechanica-500 flex-shrink-0" />
                  <span>Full access to the garage dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-mechanica-500 flex-shrink-0" />
                  <span>Business insights and reporting</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-mechanica-500 flex-shrink-0" />
                  <span>No monthly fees or subscriptions</span>
                </li>
              </ul>
              <a href="#signup">
                <Button className="w-full bg-mechanica-500 hover:bg-mechanica-600">
                  Join Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Up Form */}
      <section id="signup" className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Mechanica Today</h2>
              <p className="text-gray-600 mb-8">
                Complete the form below to start the onboarding process. Our team will review your
                application and get back to you within 48 hours.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="garage-name">Garage/Business Name</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Store size={18} className="text-gray-400" />
                      </div>
                      <Input id="garage-name" className="pl-10" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-name">Contact Person</Label>
                      <Input id="contact-name" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneCall size={18} className="text-gray-400" />
                        </div>
                        <Input id="phone" className="pl-10" required />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Business Email</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <Input id="email" type="email" className="pl-10" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location/Address</Label>
                    <Input id="location" required />
                  </div>

                  <div>
                    <Label htmlFor="services">Services Offered</Label>
                    <Textarea 
                      id="services" 
                      placeholder="Tell us about the services your garage offers..." 
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-mechanica-500 hover:bg-mechanica-600">
                  Submit Application
                </Button>
              </form>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format"
                alt="Garage Onboarding"
                className="rounded-xl shadow-card object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-mechanica-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about joining Mechanica
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-subtle">
                <h3 className="text-xl font-semibold mb-2">How long does the onboarding process take?</h3>
                <p className="text-gray-600">
                  After submitting your application, our team will review it within 48 hours. Once approved,
                  you can set up your dashboard and start listing products within a day.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-subtle">
                <h3 className="text-xl font-semibold mb-2">Can I control which services are bookable online?</h3>
                <p className="text-gray-600">
                  Yes, you have complete control over which services are available for online booking,
                  along with the ability to set your own pricing and available time slots.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-subtle">
                <h3 className="text-xl font-semibold mb-2">How do I get paid for parts and services?</h3>
                <p className="text-gray-600">
                  Payments are processed securely through our platform. For parts, customers pay online
                  and we transfer the funds to you minus our commission. For services, customers can pay
                  either through the platform or directly at your location.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-subtle">
                <h3 className="text-xl font-semibold mb-2">What support does Mechanica provide?</h3>
                <p className="text-gray-600">
                  We provide comprehensive onboarding assistance, technical support for the dashboard,
                  and ongoing training for new features. Our support team is available via phone, email,
                  and live chat during business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-mechanica-600 to-mechanica-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Garage Business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join Mechanica today and connect with more customers, streamline operations,
            and grow your revenue.
          </p>
          <a href="#signup">
            <Button className="bg-white text-mechanica-700 hover:bg-gray-100">
              Get Started Now
            </Button>
          </a>
        </div>
      </section>
    </MainLayout>
  );
};

export default Garages;
