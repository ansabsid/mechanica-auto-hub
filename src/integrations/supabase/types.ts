export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          confirmation_code: string | null
          created_at: string
          garage_id: string
          id: string
          notes: string | null
          service_slot_id: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          confirmation_code?: string | null
          created_at?: string
          garage_id: string
          id?: string
          notes?: string | null
          service_slot_id?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          confirmation_code?: string | null
          created_at?: string
          garage_id?: string
          id?: string
          notes?: string | null
          service_slot_id?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_service_slot_id_fkey"
            columns: ["service_slot_id"]
            isOneToOne: false
            referencedRelation: "service_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          installation_data: Json | null
          part_id: number
          quantity: number
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          installation_data?: Json | null
          part_id: number
          quantity?: number
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          installation_data?: Json | null
          part_id?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "installation_request_details"
            referencedColumns: ["part_id"]
          },
          {
            foreignKeyName: "cart_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      garages: {
        Row: {
          area: string | null
          created_at: string
          id: string
          images: string | null
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: string
          images?: string | null
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: string
          images?: string | null
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      installation_request_garages: {
        Row: {
          created_at: string | null
          garage_id: string | null
          id: string
          order_item_id: string | null
        }
        Insert: {
          created_at?: string | null
          garage_id?: string | null
          id?: string
          order_item_id?: string | null
        }
        Update: {
          created_at?: string | null
          garage_id?: string | null
          id?: string
          order_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_request_garages_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_request_garages_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "installation_request_details"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "installation_request_garages_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          created_at: string | null
          id: number
          manufacturer_id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          manufacturer_id: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          manufacturer_id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          garage_id: string | null
          id: string
          installation_fee: number | null
          installation_status: string | null
          order_id: string
          part_id: number
          price: number
          quantity: number
          scheduled_date: string | null
          scheduled_time: string | null
        }
        Insert: {
          created_at?: string
          garage_id?: string | null
          id?: string
          installation_fee?: number | null
          installation_status?: string | null
          order_id: string
          part_id: number
          price: number
          quantity?: number
          scheduled_date?: string | null
          scheduled_time?: string | null
        }
        Update: {
          created_at?: string
          garage_id?: string | null
          id?: string
          installation_fee?: number | null
          installation_status?: string | null
          order_id?: string
          part_id?: number
          price?: number
          quantity?: number
          scheduled_date?: string | null
          scheduled_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "installation_request_details"
            referencedColumns: ["part_id"]
          },
          {
            foreignKeyName: "order_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          shipping_address: string | null
          status: string
          total_amount: number
          updated_at: string
          user_email: string | null
          user_id: string
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          shipping_address?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          shipping_address?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      parts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          garage_id: string | null
          id: number
          image_url: string | null
          manufacturer_id: number
          model_id: number
          name: string
          price: number
          retailer_id: string | null
          source_type: string | null
          stock: number
          updated_at: string | null
          year: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          garage_id?: string | null
          id?: number
          image_url?: string | null
          manufacturer_id: number
          model_id: number
          name: string
          price: number
          retailer_id?: string | null
          source_type?: string | null
          stock?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          garage_id?: string | null
          id?: number
          image_url?: string | null
          manufacturer_id?: number
          model_id?: number
          name?: string
          price?: number
          retailer_id?: string | null
          source_type?: string | null
          stock?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "parts_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_garages: {
        Row: {
          created_at: string
          garage_id: string
          installation_fee: number
          part_id: number
        }
        Insert: {
          created_at?: string
          garage_id: string
          installation_fee?: number
          part_id: number
        }
        Update: {
          created_at?: string
          garage_id?: string
          installation_fee?: number
          part_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "parts_garages_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_garages_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "installation_request_details"
            referencedColumns: ["part_id"]
          },
          {
            foreignKeyName: "parts_garages_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          firstName: string | null
          garage_id: string | null
          id: string
          lastName: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          firstName?: string | null
          garage_id?: string | null
          id: string
          lastName?: string | null
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          firstName?: string | null
          garage_id?: string | null
          id?: string
          lastName?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      retailers: {
        Row: {
          area: string | null
          created_at: string
          id: string
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: string
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_slots: {
        Row: {
          created_at: string
          date: string
          duration_minutes: number
          end_time: string
          garage_id: string
          id: string
          is_available: boolean
          service_type: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_minutes?: number
          end_time: string
          garage_id: string
          id?: string
          is_available?: boolean
          service_type: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_minutes?: number
          end_time?: string
          garage_id?: string
          id?: string
          is_available?: boolean
          service_type?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_slots_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          license_plate: string | null
          make: string
          model: string
          updated_at: string
          user_id: string
          vin: string | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          license_plate?: string | null
          make: string
          model: string
          updated_at?: string
          user_id: string
          vin?: string | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          license_plate?: string | null
          make?: string
          model?: string
          updated_at?: string
          user_id?: string
          vin?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      installation_request_details: {
        Row: {
          garage_id: string | null
          garage_location: string | null
          garage_name: string | null
          installation_fee: number | null
          installation_status: string | null
          item_part_id: number | null
          order_id: string | null
          order_item_id: string | null
          part_description: string | null
          part_id: number | null
          part_image_url: string | null
          part_name: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_name: string | null
          user_phone: string | null
          user_phone_profile: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_part_id_fkey"
            columns: ["item_part_id"]
            isOneToOne: false
            referencedRelation: "installation_request_details"
            referencedColumns: ["part_id"]
          },
          {
            foreignKeyName: "order_items_part_id_fkey"
            columns: ["item_part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      debug_installation_request_access: {
        Args: { garage_id_param: string }
        Returns: {
          has_access: boolean
          user_id: string
          user_garage_id: string
          request_garage_id: string
          is_staff: boolean
          error_message: string
        }[]
      }
      generate_confirmation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_customer_info_for_installation: {
        Args: { order_id_param: string }
        Returns: {
          customer_name: string
          customer_email: string
          customer_phone: string
          customer_source_info: string
        }[]
      }
      get_garages_for_part: {
        Args: { part_id_param: number }
        Returns: {
          id: string
          name: string
          location: string
          installation_fee: number
        }[]
      }
      get_garages_for_part_bulk: {
        Args: { part_ids: number[] }
        Returns: {
          part_id: number
          id: string
          name: string
          location: string
          installation_fee: number
        }[]
      }
      get_installation_requests_for_garage: {
        Args: { garage_id_param: string }
        Returns: {
          garage_id: string | null
          garage_location: string | null
          garage_name: string | null
          installation_fee: number | null
          installation_status: string | null
          item_part_id: number | null
          order_id: string | null
          order_item_id: string | null
          part_description: string | null
          part_id: number | null
          part_image_url: string | null
          part_name: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          user_email: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
          user_name: string | null
          user_phone: string | null
          user_phone_profile: string | null
        }[]
      }
      get_retailers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          location: string
          area: string
        }[]
      }
      has_installation_request_access: {
        Args: { request_garage_id: string }
        Returns: boolean
      }
      insert_part: {
        Args: { part_data: Json }
        Returns: Json
      }
      is_garage_staff: {
        Args: { garage_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
