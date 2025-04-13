
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

type OrderItem = {
  id: string;
  order_id: string;
  part_id: number;
  garage_id?: string;
  installation_status?: string;
  scheduled_date?: string;
  scheduled_time?: string;
};

interface OrderListProps {
  orderItems: OrderItem[];
  selectedItem: OrderItem | null;
  onSelectItem: (item: OrderItem) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const OrderList: React.FC<OrderListProps> = ({
  orderItems,
  selectedItem,
  onSelectItem,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="border p-3 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Recent Orders</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-mechanica-500 rounded-full border-t-transparent" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {orderItems.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No orders found</p>
        ) : (
          orderItems.map(item => (
            <div 
              key={item.id} 
              className={`text-xs border p-2 rounded cursor-pointer ${selectedItem?.id === item.id ? 'bg-mechanica-50 border-mechanica-300' : ''}`}
              onClick={() => onSelectItem(item)}
            >
              <div>ID: <span className="font-mono">{item.id.substring(0, 8)}...</span></div>
              <div>Order: <span className="font-mono">{item.order_id.substring(0, 8)}...</span></div>
              <div>Part ID: {item.part_id}</div>
              <div>Status: {item.installation_status || 'None'}</div>
              {item.scheduled_date && (
                <div>
                  Scheduled: {new Date(item.scheduled_date).toLocaleDateString()} {item.scheduled_time}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
