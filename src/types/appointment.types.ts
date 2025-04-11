
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
}

export interface AvailableSlot {
  date: string;
  time: string;
  garage_id: string;
  garage_name: string;
}
