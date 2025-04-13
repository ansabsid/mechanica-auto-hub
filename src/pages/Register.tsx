import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Check, AlertCircle, MapPin, Building, User, Mail, Lock, Phone, Flag, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const countryCodes = [
  { code: "+971", country: "UAE" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+965", country: "Kuwait" },
  { code: "+973", country: "Bahrain" },
  { code: "+974", country: "Qatar" },
  { code: "+968", country: "Oman" },
] as const;

const customerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  countryCode: z.string().default("+971"),
  phoneNumber: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  role: z.literal("customer"),
});

const garageSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  countryCode: z.string().default("+971"),
  phoneNumber: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  garageName: z.string().min(1, "Garage name is required"),
  garageLocation: z.string().min(1, "Garage location is required"),
  garageRegistrationNumber: z.string().min(1, "Registration number is required"),
  role: z.literal("garage"),
});

const registerSchema = z.discriminatedUnion("role", [
  customerSchema,
  garageSchema,
]);

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, isLoading } = useAuth();
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      countryCode: "+971",
      phoneNumber: "",
      role: "customer",
    },
  });

  const watchRole = form.watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setRegistrationStatus("idle");
      setErrorMessage(null);

      const metadata = {
        firstName: data.firstName,
        lastName: data.lastName,
        fullPhone: `${data.countryCode}${data.phoneNumber}`,
        countryCode: data.countryCode,
        phoneNumber: data.phoneNumber,
      };

      if (data.role === "garage") {
        Object.assign(metadata, {
          garageName: data.garageName,
          garageLocation: data.garageLocation,
          garageRegistrationNumber: data.garageRegistrationNumber,
        });
      }

      await signUp(data.email, data.password, data.role, metadata);
      
      setRegistrationStatus("success");
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegistrationStatus("error");
      setErrorMessage(error.message || "Something went wrong");
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong",
      });
    }
  };

  const setRole = (role: "customer" | "garage") => {
    form.setValue("role", role);
    
    if (role === "customer") {
      form.unregister("garageName");
      form.unregister("garageLocation");
      form.unregister("garageRegistrationNumber");
    }
  };

  return (
    <div className="max-w-lg mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
      
      {registrationStatus === "success" && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Check className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Registration Successful!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your account has been created. Please check your email to confirm your account.
          </AlertDescription>
        </Alert>
      )}
      
      {registrationStatus === "error" && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">Registration Failed</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage || "There was an error creating your account. Please try again."}
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-6 mb-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={field.value === "customer" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setRole("customer")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Customer
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "garage" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setRole("garage")}
                      >
                        <Building className="mr-2 h-4 w-4" />
                        Garage
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="your@email.com" 
                      type="email" 
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Lock className="ml-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="********" 
                      type="password" 
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-3 gap-2">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <Flag className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Code" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} ({country.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <Phone className="ml-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="555555555" 
                        type="tel" 
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {watchRole === "garage" && (
            <div className="space-y-4 border border-blue-100 rounded-md p-4 bg-blue-50">
              <h3 className="font-medium text-blue-800">Garage Information</h3>
              
              <FormField
                control={form.control}
                name="garageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garage Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-white">
                        <Building className="ml-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Your Garage Name" 
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="garageLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garage Location</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-white">
                        <MapPin className="ml-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Dubai, UAE" 
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="garageRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="REG12345" 
                        className="bg-white" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-bookmyparts-500 hover:bg-bookmyparts-600 text-lg py-6 mt-8 text-white font-bold rounded-md shadow-lg" 
            disabled={isLoading || registrationStatus === "success"}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            {isLoading ? "Creating Account..." : "SIGNUP"}
          </Button>
        </form>
      </Form>
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-bookmyparts-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
