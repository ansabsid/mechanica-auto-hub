import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingBag,
  Calendar,
  Clock,
  Check,
  X,
  Plus,
  Package,
  DollarSign,
  Settings,
  Users,
  BarChart,
  ShoppingCart,
  ChevronDown,
  MoreHorizontal,
  MapPin,
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

// Mock product data
const products = [
  {
    id: 1,
    name: "Bosch Premium Oil Filter",
    category: "Filters",
    price: 35,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    status: "In Stock",
    quantity: 15,
    added: "2025-03-15",
  },
  {
    id: 2,
    name: "Michelin Pilot Sport 4 Tire",
    category: "Tires",
    price: 199,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    status: "Limited",
    quantity: 4,
    added: "2025-03-20",
  },
  {
    id: 3,
    name: "NGK Laser Platinum Spark Plugs",
    category: "Ignition",
    price: 45,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    status: "In Stock",
    quantity: 22,
    added: "2025-03-25",
  },
  {
    id: 4,
    name: "AC Delco Brake Pads",
    category: "Brakes",
    price: 85,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&auto=format",
    status: "In Stock",
    quantity: 8,
    added: "2025-04-01",
  },
];

// Mock appointments
const appointments = [
  {
    id: 1,
    customer: "Ahmed Hassan",
    service: "Oil Change",
    date: "2025-04-15",
    time: "09:00",
    status: "Confirmed",
    phone: "+971 50 123 4567",
    car: "Toyota Camry 2022",
  },
  {
    id: 2,
    customer: "Sara Khan",
    service: "Brake Service",
    date: "2025-04-16",
    time: "10:30",
    status: "Pending",
    phone: "+971 50 987 6543",
    car: "Honda Accord 2021",
  },
  {
    id: 3,
    customer: "Mohammed Ali",
    service: "Full Car Service",
    date: "2025-04-17",
    time: "14:00",
    status: "Confirmed",
    phone: "+971 50 567 8901",
    car: "BMW 3 Series 2023",
  },
];

const GarageDashboard = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    status: "In Stock",
  });

  const [newSlot, setNewSlot] = useState({
    service: "",
    date: "",
    startTime: "",
    endTime: "",
    interval: "60",
  });

  const [newGarage, setNewGarage] = useState({
    name: "",
    area: "",
    location: "",
    installationFee: "",
  });

  const totalProducts = products.length;
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(app => app.status === "Pending").length;

  const dubaiAreas = [
    "Dubai Marina",
    "Downtown Dubai",
    "Jumeirah",
    "Deira",
    "Business Bay",
    "JLT",
    "Palm Jumeirah",
    "Al Barsha",
    "Dubai Hills",
    "Mirdif",
    "Dubai Silicon Oasis",
    "International City",
    "Dubai Sports City",
    "JVC",
    "Arabian Ranches"
  ];

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding new product:", newProduct);
    setNewProduct({
      name: "",
      category: "",
      price: "",
      quantity: "",
      status: "In Stock",
    });
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding new service slot:", newSlot);
    setNewSlot({
      service: "",
      date: "",
      startTime: "",
      endTime: "",
      interval: "60",
    });
  };

  const handleAddGarage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding new garage:", newGarage);
    setNewGarage({
      name: "",
      area: "",
      location: "",
      installationFee: "",
    });
  };

  return (
    <MainLayout>
      <section className="py-8 bg-mechanica-50">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">AutoCare Dubai Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-5 w-5 text-mechanica-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Items in your inventory
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-5 w-5 text-mechanica-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Total scheduled appointments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-5 w-5 text-mechanica-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Appointments awaiting confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-custom">
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="inventory" className="flex items-center justify-center gap-2">
                <ShoppingBag size={18} /> Inventory
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center justify-center gap-2">
                <Calendar size={18} /> Appointments
              </TabsTrigger>
              <TabsTrigger value="garages" className="flex items-center justify-center gap-2">
                <MapPin size={18} /> Garages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Products & Parts</h2>
                  <Button className="bg-mechanica-500 hover:bg-mechanica-600">
                    <Plus className="mr-2 h-4 w-4" /> Add New Product
                  </Button>
                </div>

                <div className="bg-white rounded-xl shadow-subtle p-6">
                  <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input 
                          id="product-name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-category">Category</Label>
                        <Select 
                          value={newProduct.category}
                          onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                        >
                          <SelectTrigger id="product-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="filters">Filters</SelectItem>
                            <SelectItem value="brakes">Brakes</SelectItem>
                            <SelectItem value="tires">Tires</SelectItem>
                            <SelectItem value="ignition">Ignition</SelectItem>
                            <SelectItem value="oils">Oils & Fluids</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-price">Price (AED)</Label>
                        <Input 
                          id="product-price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-quantity">Quantity</Label>
                        <Input 
                          id="product-quantity"
                          type="number"
                          value={newProduct.quantity}
                          onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-status">Availability Status</Label>
                        <Select 
                          value={newProduct.status}
                          onValueChange={(value) => setNewProduct({...newProduct, status: value})}
                        >
                          <SelectTrigger id="product-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="In Stock">In Stock</SelectItem>
                            <SelectItem value="Limited">Limited</SelectItem>
                            <SelectItem value="Sold Out">Sold Out</SelectItem>
                            <SelectItem value="Discontinued">Discontinued</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-image">Product Image</Label>
                        <Input id="product-image" type="file" />
                      </div>
                    </div>
                    <Button type="submit" className="bg-mechanica-500 hover:bg-mechanica-600">
                      Add Product
                    </Button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-xl shadow-subtle">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Product</th>
                        <th className="text-left p-4">Category</th>
                        <th className="text-left p-4">Price</th>
                        <th className="text-left p-4">Quantity</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="p-4">{product.category}</td>
                          <td className="p-4">AED {product.price}</td>
                          <td className="p-4">{product.quantity}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.status === "In Stock" 
                                ? "bg-green-100 text-green-800" 
                                : product.status === "Limited"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Edit Product</DropdownMenuItem>
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appointments">
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Service Appointments</h2>
                  <Button className="bg-mechanica-500 hover:bg-mechanica-600">
                    <Plus className="mr-2 h-4 w-4" /> Create Service Slots
                  </Button>
                </div>

                <div className="bg-white rounded-xl shadow-subtle p-6">
                  <h3 className="text-lg font-semibold mb-4">Add Service Slots</h3>
                  <form onSubmit={handleAddSlot} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-type">Service Type</Label>
                        <Select
                          value={newSlot.service}
                          onValueChange={(value) => setNewSlot({...newSlot, service: value})}
                        >
                          <SelectTrigger id="service-type">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oil-change">Oil Change</SelectItem>
                            <SelectItem value="brake-service">Brake Service</SelectItem>
                            <SelectItem value="full-service">Full Car Service</SelectItem>
                            <SelectItem value="ac-service">AC Service</SelectItem>
                            <SelectItem value="tire-change">Tire Change</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-date">Date</Label>
                        <Input 
                          id="service-date"
                          type="date"
                          value={newSlot.date}
                          onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input 
                          id="start-time"
                          type="time"
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <Input 
                          id="end-time"
                          type="time"
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-interval">Appointment Duration (minutes)</Label>
                        <Select
                          value={newSlot.interval}
                          onValueChange={(value) => setNewSlot({...newSlot, interval: value})}
                        >
                          <SelectTrigger id="service-interval">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="180">3 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="bg-mechanica-500 hover:bg-mechanica-600">
                      Create Slots
                    </Button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-xl shadow-subtle">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">Service</th>
                        <th className="text-left p-4">Date & Time</th>
                        <th className="text-left p-4">Car</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{appointment.customer}</div>
                              <div className="text-sm text-gray-500">{appointment.phone}</div>
                            </div>
                          </td>
                          <td className="p-4">{appointment.service}</td>
                          <td className="p-4">
                            <div>
                              <div>
                                {new Date(appointment.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.time}</div>
                            </div>
                          </td>
                          <td className="p-4">{appointment.car}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              appointment.status === "Confirmed" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              {appointment.status === "Pending" && (
                                <>
                                  <Button size="sm" variant="outline" className="h-8 bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="garages">
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Garage Management</h2>
                  <Button className="bg-mechanica-500 hover:bg-mechanica-600">
                    <Plus className="mr-2 h-4 w-4" /> Add New Garage
                  </Button>
                </div>

                <div className="bg-white rounded-xl shadow-subtle p-6">
                  <h3 className="text-lg font-semibold mb-4">Onboard New Garage</h3>
                  <form onSubmit={handleAddGarage} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="garage-name">Garage Name</Label>
                        <Input 
                          id="garage-name"
                          value={newGarage.name}
                          onChange={(e) => setNewGarage({...newGarage, name: e.target.value})}
                          required
                          placeholder="e.g. Mechanica Service Center - Dubai Marina"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="garage-area">Area</Label>
                        <Select 
                          value={newGarage.area}
                          onValueChange={(value) => setNewGarage({...newGarage, area: value})}
                        >
                          <SelectTrigger id="garage-area">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                            {dubaiAreas.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500">This groups garages by area for customer selection</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="garage-location">Full Address</Label>
                        <Textarea 
                          id="garage-location"
                          value={newGarage.location}
                          onChange={(e) => setNewGarage({...newGarage, location: e.target.value})}
                          required
                          placeholder="e.g. Dubai Marina, Sheikh Zayed Road, Dubai, UAE"
                          className="resize-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="garage-fee">Base Installation Fee (AED)</Label>
                        <Input 
                          id="garage-fee"
                          type="number"
                          value={newGarage.installationFee}
                          onChange={(e) => setNewGarage({...newGarage, installationFee: e.target.value})}
                          required
                          placeholder="e.g. 25.99"
                        />
                        <p className="text-sm text-gray-500">Base fee applied to installations at this garage</p>
                      </div>
                    </div>
                    <Button type="submit" className="bg-mechanica-500 hover:bg-mechanica-600">
                      Add Garage
                    </Button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-xl shadow-subtle">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Garage Name</th>
                        <th className="text-left p-4">Area</th>
                        <th className="text-left p-4">Full Address</th>
                        <th className="text-left p-4">Installation Fee</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4">Mechanica Service Center - Dubai Marina</td>
                        <td className="p-4">Dubai Marina</td>
                        <td className="p-4">Dubai Marina, Sheikh Zayed Road, Dubai, UAE</td>
                        <td className="p-4">AED 25.99</td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit Garage</DropdownMenuItem>
                              <DropdownMenuItem>View Parts</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Mechanica Service Center - Downtown</td>
                        <td className="p-4">Downtown Dubai</td>
                        <td className="p-4">Downtown Dubai, Financial Center Road, Dubai, UAE</td>
                        <td className="p-4">AED 29.99</td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit Garage</DropdownMenuItem>
                              <DropdownMenuItem>View Parts</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">Mechanica Service Center - Jumeirah</td>
                        <td className="p-4">Jumeirah</td>
                        <td className="p-4">Jumeirah Beach Road, Dubai, UAE</td>
                        <td className="p-4">AED 32.99</td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit Garage</DropdownMenuItem>
                              <DropdownMenuItem>View Parts</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </MainLayout>
  );
};

export default GarageDashboard;
