
export interface Appointment {
  id: string;
  user_id: string;
  garage_id: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  garage?: {
    name: string;
    location: string;
  };
  // Optional properties that might be used in the UI but aren't in the database schema
  customer?: string;
  phone?: string;
  car?: string;
  vehicle_id?: string;
  vehicle?: any;
  confirmation_code?: string;
}

export interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  garage_id: string;
  available: boolean;
  service_type: string;
  garage_name?: string;
}
