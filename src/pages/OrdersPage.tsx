
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Package, Clock, MapPin, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const OrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { fetchOrderDetails, currentOrder, isLoading } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

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
      default: return 'bg-gray-500';
    }
  };
  
  const formatTime = (time: string) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    } catch (error) {
      return time;
    }
  };

  const renderInstallationStatus = (item: any) => {
    if (!item.installation_status) return null;
    
    let statusInfo = {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      title: 'Pending',
      message: 'Installation request submitted'
    };
    
    if (item.installation_status === 'contacted') {
      statusInfo = {
        icon: <Clock className="h-4 w-4" />,
        color: 'bg-blue-100 border-blue-200 text-blue-800',
        title: 'Contacted',
        message: 'The garage has contacted you about scheduling'
      };
    } else if (item.installation_status === 'scheduled') {
      statusInfo = {
        icon: <Calendar className="h-4 w-4" />,
        color: 'bg-green-100 border-green-200 text-green-800',
        title: 'Scheduled',
        message: item.scheduled_date && item.scheduled_time ? 
          `Installation scheduled for ${formatDate(item.scheduled_date)} at ${formatTime(item.scheduled_time)}` :
          'Installation has been scheduled'
      };
    }
    
    return (
      <Alert className={`mt-3 ${statusInfo.color}`}>
        <div className="flex items-start">
          {statusInfo.icon}
          <div className="ml-3">
            <AlertTitle className="text-sm font-medium">{statusInfo.title}</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              {statusInfo.message}
              
              {item.garage && (
                <div className="flex items-center mt-1 text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.garage.name} - {item.garage.location}
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Order not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate('/orders')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{currentOrder.id.substring(0, 8)}</h1>
          <p className="text-gray-600">Placed on {formatDate(currentOrder.created_at)}</p>
        </div>
        <Badge className={`text-white px-3 py-1 ${getStatusColor(currentOrder.status)}`}>
          {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
        </Badge>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Total</span>
            <span className="font-semibold">${currentOrder.total_amount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mb-4">Order Items</h2>
      <div className="space-y-4">
        {currentOrder.items && currentOrder.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="font-semibold">{item.part?.name || `Part #${item.part_id}`}</h3>
                  {item.part?.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.part.description}</p>
                  )}
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <p className="font-medium">${item.price.toFixed(2)} × {item.quantity}</p>
                  {item.installation_fee > 0 && (
                    <p className="text-sm text-gray-600">+ ${item.installation_fee.toFixed(2)} installation</p>
                  )}
                </div>
              </div>
              
              {item.installation_fee > 0 && renderInstallationStatus(item)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderPage;
