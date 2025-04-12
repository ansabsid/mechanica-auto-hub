
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { formatPrice } from '@/lib/utils';

const OrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { fetchOrderDetails, currentOrder, isLoading, updateOrderStatusBasedOnInstallation } = useOrders();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOrderDetails = async () => {
      if (!orderId) {
        console.error("Order ID is missing from URL params:", orderId);
        setErrorMessage("Order ID is missing from URL parameters");
        return;
      }
      
      console.log(`Attempting to load order details for ID: ${orderId} (attempt ${retryCount + 1})`);
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setErrorMessage("Authentication required to view order details");
          return;
        }
        
        setIsRefetching(true);
        const result = await fetchOrderDetails(orderId);
        
        if (isMounted) {
          setIsRefetching(false);
          
          if (!result) {
            console.error(`Failed to load order: ${orderId}`);
            if (retryCount < 2) {
              setTimeout(() => {
                if (isMounted) {
                  setRetryCount(prev => prev + 1);
                }
              }, 2000); // Wait 2 seconds before retrying
            } else {
              setErrorMessage(`Order could not be loaded after multiple attempts. Order ID: ${orderId}`);
            }
          } else {
            console.log("Order details loaded successfully:", result);
            setErrorMessage(null);
            
            const hasScheduledInstallation = result.items?.some(item => 
              item.installation_status === 'scheduled' && item.scheduled_date && item.scheduled_time
            );
            
            if (result.status === 'pending' && hasScheduledInstallation) {
              console.log("Found scheduled installation for pending order, confirming...");
              await updateOrderStatusBasedOnInstallation(result.id);
            }
          }
        }
      } catch (error: any) {
        if (isMounted) {
          setIsRefetching(false);
          console.error("Error loading order:", error.message);
          setErrorMessage(`Error loading order: ${error.message}`);
        }
      }
    };

    loadOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [orderId, retryCount]);

  const handleManualRetry = () => {
    toast("Retrying to load order details...");
    setRetryCount(prev => prev + 1);
  };

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

  console.log("Current Component State:", {
    orderId,
    currentOrder: currentOrder ? "Present" : "Not loaded",
    isLoading,
    isRefetching,
    retryCount,
    errorMessage
  });

  if (isLoading || isRefetching) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500 text-sm md:text-base">
          {retryCount > 0 ? `Loading order data (attempt ${retryCount + 1})...` : 'Loading order data...'}
        </p>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-8 md:py-12 px-3 md:px-4">
        <p className="text-base md:text-lg text-gray-600">
          {errorMessage || "Order not found"}
        </p>
        <Button 
          variant="outline" 
          className="mt-3 md:mt-4 text-xs md:text-sm h-8 md:h-10"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Back to Orders
        </Button>
        {orderId && (
          <div className="mt-4 p-3 md:p-4 bg-gray-100 rounded-md mx-auto max-w-md text-xs md:text-sm">
            <p className="text-gray-600 mb-2">Order ID: {orderId}</p>
            <p className="text-gray-500 mb-3 text-2xs md:text-xs">If you've just placed this order, it might take a moment to appear in the system.</p>
            <div className="flex justify-center">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleManualRetry}
                disabled={isRefetching}
                className="mr-2 text-xs md:text-sm h-7 md:h-8"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs md:text-sm h-7 md:h-8"
              >
                Reload Page
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-md md:max-w-2xl lg:max-w-4xl">
      <Button 
        variant="outline" 
        className="mb-4 md:mb-6 text-xs md:text-sm h-8 md:h-10"
        onClick={() => navigate('/orders')}
      >
        <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Back to Orders
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
        <div>
          <h1 className="text-lg md:text-2xl font-bold">Order #{currentOrder.id.substring(0, 8)}</h1>
          <p className="text-xs md:text-sm text-gray-600">Placed on {formatDate(currentOrder.created_at)}</p>
        </div>
        <Badge className={`text-white px-2 py-1 text-xs md:text-sm mt-2 md:mt-0 ${getStatusColor(currentOrder.status)}`}>
          {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
        </Badge>
      </div>
      
      <Card className="mb-4 md:mb-6">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          <div className="flex justify-between py-2 text-sm md:text-base">
            <span className="text-gray-600">Total</span>
            <span className="font-semibold">{formatPrice(currentOrder.total_amount)}</span>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4">Order Items</h2>
      <div className="space-y-3 md:space-y-4">
        {currentOrder.items && currentOrder.items.length > 0 ? (
          currentOrder.items.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">{item.part?.name || `Part #${item.part_id}`}</h3>
                    {item.part?.description && (
                      <p className="text-xs md:text-sm text-gray-600 mt-1">{item.part.description}</p>
                    )}
                  </div>
                  <div className="text-right mt-2 md:mt-0">
                    <p className="font-medium text-sm md:text-base">{formatPrice(item.price)} × {item.quantity}</p>
                    {item.installation_fee > 0 && (
                      <p className="text-xs md:text-sm text-gray-600">+ {formatPrice(item.installation_fee)} installation</p>
                    )}
                  </div>
                </div>
                
                {item.installation_fee > 0 && renderInstallationStatus(item)}
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-center py-6 text-sm md:text-base">No items found for this order</p>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
