
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, PhoneCall, MapPin, Clock, Send } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted");
    // Handle form submission logic
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-mechanica-50">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact <span className="text-mechanica-600">Mechanica</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team for support, partnership inquiries, or any questions.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-mechanica-50 rounded-xl p-6 text-center">
              <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-subtle">
                <PhoneCall className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">Our support team is available during business hours</p>
              <a 
                href="tel:+97150123456" 
                className="text-mechanica-600 font-medium hover:underline"
              >
                +971 50 123 4567
              </a>
            </div>

            <div className="bg-mechanica-50 rounded-xl p-6 text-center">
              <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-subtle">
                <Mail className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">Send us an email and we'll respond as soon as possible</p>
              <a 
                href="mailto:support@mechanica.com" 
                className="text-mechanica-600 font-medium hover:underline"
              >
                support@mechanica.com
              </a>
            </div>

            <div className="bg-mechanica-50 rounded-xl p-6 text-center">
              <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-subtle">
                <MapPin className="h-8 w-8 text-mechanica-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-2">Our headquarters are located in Dubai, UAE</p>
              <address className="text-mechanica-600 font-medium not-italic">
                Downtown Dubai, UAE
              </address>
            </div>
          </div>

          <div className="mt-12 bg-mechanica-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-mechanica-600 mr-2" />
              <h3 className="text-xl font-semibold">Business Hours</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Weekdays</h4>
                <p className="text-gray-600">Sunday - Thursday: 9:00 AM - 6:00 PM</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Weekend</h4>
                <p className="text-gray-600">Friday: 10:00 AM - 3:00 PM</p>
                <p className="text-gray-600">Saturday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Contact Form */}
      <section className="py-16 bg-mechanica-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-subtle">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Customer Support</SelectItem>
                        <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="How can we help you?" 
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-mechanica-500 hover:bg-mechanica-600">
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </div>
              </form>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Us</h2>
              <div className="bg-white p-2 rounded-xl shadow-subtle">
                <div className="aspect-video bg-gray-200 rounded-lg">
                  {/* Replace with actual Google Maps embed */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-mechanica-300 mx-auto mb-2" />
                      <p className="text-gray-500">Google Maps Embedded Here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="bg-mechanica-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">How do I track my order?</h3>
                <p className="text-gray-600">
                  You can track your order in real-time through your customer dashboard.
                  Simply log in to your account, navigate to "Orders," and select the order
                  you want to track.
                </p>
              </div>

              <div className="bg-mechanica-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">Can I cancel my service appointment?</h3>
                <p className="text-gray-600">
                  Yes, you can cancel your service appointment up to 24 hours before the
                  scheduled time without any penalty. Cancellations made within 24 hours
                  may be subject to a cancellation fee.
                </p>
              </div>

              <div className="bg-mechanica-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">How do I become a garage partner?</h3>
                <p className="text-gray-600">
                  To join Mechanica as a garage partner, visit our "For Garages" page and
                  complete the application form. Our team will review your application and
                  contact you within 48 hours.
                </p>
              </div>

              <div className="bg-mechanica-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit and debit cards, Apple Pay, Google Pay,
                  and bank transfers for online payments. For in-garage services, you can
                  also pay by cash or card directly to the garage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-mechanica-600 to-mechanica-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest updates, promotions, and automotive tips.
          </p>
          <form className="max-w-md mx-auto flex">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-mechanica-400"
            />
            <Button type="submit" className="ml-2 bg-white text-mechanica-700 hover:bg-gray-100">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </MainLayout>
  );
};

export default Contact;
