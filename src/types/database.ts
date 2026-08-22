/**
 * Database schema type definitions for GlobeTrotter AI.
 * Mirrors the Supabase / PostgreSQL schema with strict typing.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      cities: {
        Row: {
          id: string;
          name: string;
          country: string;
          region: string | null;
          cost_index: number;
          popularity_score: number;
          latitude: number | null;
          longitude: number | null;
          image_url: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          region?: string | null;
          cost_index?: number;
          popularity_score?: number;
          latitude?: number | null;
          longitude?: number | null;
          image_url?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          region?: string | null;
          cost_index?: number;
          popularity_score?: number;
          latitude?: number | null;
          longitude?: number | null;
          image_url?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          city_id: string;
          title: string;
          description: string | null;
          category: string;
          estimated_cost: number;
          duration_hours: number;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          title: string;
          description?: string | null;
          category: string;
          estimated_cost?: number;
          duration_hours?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          estimated_cost?: number;
          duration_hours?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          }
        ];
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          target_budget: number;
          cover_image_url: string | null;
          is_public: boolean;
          share_slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          target_budget?: number;
          cover_image_url?: string | null;
          is_public?: boolean;
          share_slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          target_budget?: number;
          cover_image_url?: string | null;
          is_public?: boolean;
          share_slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trips_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      stops: {
        Row: {
          id: string;
          trip_id: string;
          city_id: string;
          stop_order: number;
          arrival_date: string | null;
          departure_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          city_id: string;
          stop_order?: number;
          arrival_date?: string | null;
          departure_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          city_id?: string;
          stop_order?: number;
          arrival_date?: string | null;
          departure_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stops_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stops_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          }
        ];
      };
      stop_activities: {
        Row: {
          id: string;
          stop_id: string;
          activity_id: string | null;
          day_number: number;
          scheduled_time: string | null;
          cost: number;
          notes: string | null;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stop_id: string;
          activity_id?: string | null;
          day_number?: number;
          scheduled_time?: string | null;
          cost?: number;
          notes?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          stop_id?: string;
          activity_id?: string | null;
          day_number?: number;
          scheduled_time?: string | null;
          cost?: number;
          notes?: string | null;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stop_activities_stop_id_fkey";
            columns: ["stop_id"];
            isOneToOne: false;
            referencedRelation: "stops";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stop_activities_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          }
        ];
      };
      expenses: {
        Row: {
          id: string;
          trip_id: string;
          stop_id: string | null;
          activity_id: string | null;
          category: string;
          amount: number;
          currency: string;
          description: string | null;
          date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          stop_id?: string | null;
          activity_id?: string | null;
          category: string;
          amount: number;
          currency?: string;
          description?: string | null;
          date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          stop_id?: string | null;
          activity_id?: string | null;
          category?: string;
          amount?: number;
          currency?: string;
          description?: string | null;
          date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_stop_id_fkey";
            columns: ["stop_id"];
            isOneToOne: false;
            referencedRelation: "stops";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenient Model Type Aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type City = Database["public"]["Tables"]["cities"]["Row"];
export type CityInsert = Database["public"]["Tables"]["cities"]["Insert"];
export type CityUpdate = Database["public"]["Tables"]["cities"]["Update"];

export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"];
export type ActivityUpdate = Database["public"]["Tables"]["activities"]["Update"];

export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type TripInsert = Database["public"]["Tables"]["trips"]["Insert"];
export type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];

export type Stop = Database["public"]["Tables"]["stops"]["Row"];
export type StopInsert = Database["public"]["Tables"]["stops"]["Insert"];
export type StopUpdate = Database["public"]["Tables"]["stops"]["Update"];

export type StopActivity = Database["public"]["Tables"]["stop_activities"]["Row"];
export type StopActivityInsert = Database["public"]["Tables"]["stop_activities"]["Insert"];
export type StopActivityUpdate = Database["public"]["Tables"]["stop_activities"]["Update"];

export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
export type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

// Rich Relational Joined Types
export interface StopActivityWithDetails extends StopActivity {
  activity: Activity | null;
}

export interface StopWithDetails extends Stop {
  city: City;
  stop_activities?: StopActivityWithDetails[];
}

export interface TripWithDetails extends Trip {
  stops: StopWithDetails[];
  expenses?: Expense[];
  profile?: Profile | null;
}

// Filter and Option Types
export interface TripFilters {
  userId?: string;
  isPublic?: boolean;
  status?: "upcoming" | "ongoing" | "completed" | "draft" | "all";
  searchQuery?: string;
  sortBy?: "date-asc" | "date-desc" | "budget-desc" | "name-asc" | "created-desc";
  limit?: number;
  offset?: number;
}

export interface CityFilters {
  searchQuery?: string;
  country?: string;
  region?: string;
  minPopularity?: number;
  maxCostIndex?: number;
  sortBy?: "popularity-desc" | "cost-asc" | "cost-desc" | "name-asc";
  limit?: number;
}

export interface ActivityFilters {
  category?: string;
  maxCost?: number;
  searchQuery?: string;
  sortBy?: "cost-asc" | "cost-desc" | "duration-asc" | "title-asc";
  limit?: number;
}

export interface ExpenseFilters {
  category?: string;
  stopId?: string;
  startDate?: string;
  endDate?: string;
}
