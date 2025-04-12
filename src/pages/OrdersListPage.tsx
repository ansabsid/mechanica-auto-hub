
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

const OrdersListPage = () => {
  const { orders, fetchUserOrders, isLoading } = useOrders();
  
  useEffect(() => {
    fetchUserOrders();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (error) {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'confirmed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-8 px-3 md:px-4">
      <div className="flex items-center mb-4 md:mb-6">
        <Link to="/customer-dashboard">
          <Button variant="ghost" size="sm" className="mr-2 md:mr-4 h-8 px-2 md:px-4 text-xs md:text-sm">
            <ArrowLeft className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" /> 
            <span className="hidden xs:inline">Back to Dashboard</span>
            <span className="xs:hidden">Back</span>
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8 md:py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-16">
            <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mb-3 md:mb-4" />
            <p className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">No Orders</p>
            <p className="text-sm md:text-base text-gray-500 text-center max-w-sm mb-4 md:mb-6">
              You don't have any orders yet. Start shopping to place your first order.
            </p>
            <Link to="/categories">
              <Button size="sm" className="text-xs md:text-sm">Browse Parts</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className={`h-1 md:h-2 ${getStatusColor(order.status)}`} />
              <CardHeader className="p-3 md:p-6 md:pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm md:text-lg">
                    Order #{order.id.substring(0, 8)}
                  </CardTitle>
                  <Badge className={`${getStatusColor(order.status)} text-xs md:text-sm px-1.5 py-0.5 md:px-2 md:py-1 text-white`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Placed on {formatDate(order.created_at)}</p>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 md:pt-2">
                <div className="space-y-2 md:space-y-4">
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="text-gray-600">Total Items:</span>
                    <span>{order.items?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="text-gray-600">Order Total:</span>
                    <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                  </div>
                  <Separator className="my-2 md:my-3" />
                  <div className="pt-1 md:pt-2 flex justify-end">
                    <Link to={`/orders/${order.id}`}>
                      <Button size="sm" className="h-8 text-xs md:text-sm md:h-9">View Order Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersListPage;
