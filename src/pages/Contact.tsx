
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  organization: z.string().optional(),
  phone: z.string().min(7, { message: "Please enter a valid phone number." }).optional(),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormData = z.infer<typeof formSchema>;

const Contact = () => {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // First, create a lead in Freshsales
      const { data: freshsalesData, error: freshsalesError } = await supabase.functions.invoke(
        "create-freshsales-lead",
        {
          body: data,
        }
      );
      
      if (freshsalesError) {
        console.error("Freshsales API error:", freshsalesError);
        // Continue with form submission anyway, but log the error
      } else {
        console.log("Freshsales response:", freshsalesData);
      }
      
      // Here you could also store the form submission in your Supabase database if needed
      
      toast.success("Your message has been sent successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-mechanica-50 py-8 md:py-16 lg:py-24">
        <div className="container-custom text-center px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">Contact Us</h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help. Reach out to our team with any questions, feedback, or support needs.
          </p>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-10 md:py-16">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Get In Touch</h2>
              
              <div className="space-y-6 md:space-y-8">
                <Card className="p-4 md:p-6 border-none shadow-subtle">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="bg-mechanica-100 p-3 rounded-full mb-4 sm:mb-0 sm:mr-5 w-fit mx-auto sm:mx-0 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-mechanica-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-base md:text-lg mb-1">Phone</h3>
                      <p className="text-gray-600 text-sm md:text-base">+971 552552476</p>
                      <p className="text-gray-600 text-sm md:text-base">Available 9am - 6pm, Sunday - Thursday</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 md:p-6 border-none shadow-subtle">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="bg-mechanica-100 p-3 rounded-full mb-4 sm:mb-0 sm:mr-5 w-fit mx-auto sm:mx-0 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-mechanica-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-base md:text-lg mb-1">Email</h3>
                      <p className="text-gray-600 text-sm md:text-base">support@bookmyparts.com</p>
                      <p className="text-gray-600 text-sm md:text-base">We aim to respond within 24 hours</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 md:p-6 border-none shadow-subtle">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="bg-mechanica-100 p-3 rounded-full mb-4 sm:mb-0 sm:mr-5 w-fit mx-auto sm:mx-0 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-mechanica-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-base md:text-lg mb-1">Office</h3>
                      <p className="text-gray-600 text-sm md:text-base">Dubai, United Arab Emirates</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 md:p-6 border-none shadow-subtle">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="bg-mechanica-100 p-3 rounded-full mb-4 sm:mb-0 sm:mr-5 w-fit mx-auto sm:mx-0 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-mechanica-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-base md:text-lg mb-1">Business Hours</h3>
                      <p className="text-gray-600 text-sm md:text-base">Sunday - Thursday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600 text-sm md:text-base">Friday - Saturday: Closed</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <Card className="p-5 md:p-8 border-none shadow-card">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Send Us a Message</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your name"
                                className="w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Your email"
                                className="w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Organization
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your company or organization"
                                className="w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Your phone number"
                                className="w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Subject
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="How can we help?"
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Message
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us more about your inquiry..."
                              rows={isMobile ? 4 : 5}
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-8 md:py-12 bg-mechanica-50">
        <div className="container-custom px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6 md:mb-8">Find Us</h2>
          <div className="rounded-xl overflow-hidden h-64 md:h-96 shadow-subtle">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3612.0731190412044!2d55.150744!3d25.0969539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6b5a8a1a3af3%3A0xd28f40613fed5aff!2sTCOM%20-%20Dubai%20Media%20City!5e0!3m2!1sen!2sae!4v1713032429056!5m2!1sen!2sae"
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
