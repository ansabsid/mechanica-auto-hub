
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useOrders } from "@/hooks/useOrders";
import { 
  Package, 
  Clock, 
  Check, 
  X, 
  ShoppingBag,
  ChevronRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const OrdersListPage = () => {
  const { orders, fetchUserOrders, isLoading } = useOrders();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUserOrders();
  }, []);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><Check className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500"><Clock className="mr-1 h-3 w-3" /> Processing</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500"><X className="mr-1 h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    }
  };
  
  const viewOrderDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };
  
  return (
    <MainLayout>
      <div className="py-8 bg-mechanica-50">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>
      </div>

      <div className="container-custom py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-mechanica-500" />
            <p className="mt-4 text-muted-foreground">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-xl font-medium mb-2">No orders yet</p>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet.
              </p>
              <Button 
                onClick={() => navigate('/customer-dashboard')} 
                className="bg-mechanica-500 hover:bg-mechanica-600"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => viewOrderDetails(order.id)}
              >
                <CardHeader className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <div className="flex items-center">
                        <Package className="mr-2 h-5 w-5 text-mechanica-500" />
                        <CardTitle className="text-base font-medium">
                          Order #{order.id.substring(0, 8)}
                        </CardTitle>
                      </div>
                      <div className="md:border-l md:border-gray-200 md:pl-4 text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 md:mt-0">
                      <div className="flex items-center mr-4">
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-1">
                          ${order.total_amount.toFixed(2)}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersListPage;
