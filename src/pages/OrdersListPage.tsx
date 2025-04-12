
import React, { useEffect, useState } from 'react';
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
  const { orders, fetchUserOrders, isLoading, clearCurrentOrder } = useOrders();
  
  useEffect(() => {
    fetchUserOrders();
    clearCurrentOrder();
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link to="/customer-dashboard">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No Orders</p>
            <p className="text-gray-500 text-center max-w-sm mb-6">
              You don't have any orders yet. Start shopping to place your first order.
            </p>
            <Link to="/categories">
              <Button>Browse Parts</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <div className={`h-2 ${getStatusColor(order.status)}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Items:</span>
                    <span>{order.items?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Total:</span>
                    <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                  </div>
                  <Separator />
                  <div className="pt-2 flex justify-end">
                    <Link to={`/orders/${order.id}`}>
                      <Button>View Order Details</Button>
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
