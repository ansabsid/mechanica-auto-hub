
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-mechanica-50 py-12 md:py-24">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help. Reach out to our team with any questions, feedback, or support needs.
          </p>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>
              
              <div className="space-y-8">
                <Card className="p-6 border-none shadow-subtle">
                  <div className="flex">
                    <div className="bg-mechanica-100 p-4 rounded-full mr-5">
                      <Phone className="h-6 w-6 text-mechanica-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Phone</h3>
                      <p className="text-gray-600">+971 552552476</p>
                      <p className="text-gray-600">Available 9am - 6pm, Sunday - Thursday</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border-none shadow-subtle">
                  <div className="flex">
                    <div className="bg-mechanica-100 p-4 rounded-full mr-5">
                      <Mail className="h-6 w-6 text-mechanica-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Email</h3>
                      <p className="text-gray-600">support@bookmyparts.com</p>
                      <p className="text-gray-600">We aim to respond within 24 hours</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border-none shadow-subtle">
                  <div className="flex">
                    <div className="bg-mechanica-100 p-4 rounded-full mr-5">
                      <MapPin className="h-6 w-6 text-mechanica-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Office</h3>
                      <p className="text-gray-600">Dubai, United Arab Emirates</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border-none shadow-subtle">
                  <div className="flex">
                    <div className="bg-mechanica-100 p-4 rounded-full mr-5">
                      <Clock className="h-6 w-6 text-mechanica-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Business Hours</h3>
                      <p className="text-gray-600">Sunday - Thursday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Friday - Saturday: Closed</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <Card className="p-8 border-none shadow-card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      className="w-full"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-mechanica-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Find Us</h2>
          <div className="rounded-xl overflow-hidden h-96 shadow-subtle">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462560.3011806427!2d54.947309235929374!3d25.076280447510162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sus!4v1618321387565!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              title="BookMyParts Location Map"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
