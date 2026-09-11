export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      category_metadata: {
        Row: {
          created_at: string;
          icon: string;
          id: string;
          label: string;
          slug: Database["public"]["Enums"]["property_category"];
          sort_order: number;
          tagline: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          icon?: string;
          id?: string;
          label: string;
          slug: Database["public"]["Enums"]["property_category"];
          sort_order?: number;
          tagline: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          icon?: string;
          id?: string;
          label?: string;
          slug?: Database["public"]["Enums"]["property_category"];
          sort_order?: number;
          tagline?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          created_at: string;
          customer_type: Database["public"]["Enums"]["customer_type"];
          email: string | null;
          full_name: string;
          id: string;
          id_number: string | null;
          notes: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          customer_type?: Database["public"]["Enums"]["customer_type"];
          email?: string | null;
          full_name: string;
          id?: string;
          id_number?: string | null;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          customer_type?: Database["public"]["Enums"]["customer_type"];
          email?: string | null;
          full_name?: string;
          id?: string;
          id_number?: string | null;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          owner_id: string;
          phone: string | null;
          property_id: string;
          sender_user_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          owner_id: string;
          phone?: string | null;
          property_id: string;
          sender_user_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          owner_id?: string;
          phone?: string | null;
          property_id?: string;
          sender_user_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      enquiry_replies: {
        Row: {
          body: string;
          created_at: string;
          enquiry_id: string;
          id: string;
          owner_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          enquiry_id: string;
          id?: string;
          owner_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          enquiry_id?: string;
          id?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enquiry_replies_enquiry_id_fkey";
            columns: ["enquiry_id"];
            isOneToOne: false;
            referencedRelation: "enquiries";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          amenities: string[];
          area_sqm: number | null;
          baths: number | null;
          beds: number | null;
          category: Database["public"]["Enums"]["property_category"];
          city: string;
          cover_url: string | null;
          created_at: string;
          description: string | null;
          details: Json | null;
          featured: boolean;
          id: string;
          lat: number | null;
          listing_type: Database["public"]["Enums"]["listing_type"];
          lng: number | null;
          neighborhood: string | null;
          owner_display_name: string | null;
          owner_id: string | null;
          owner_role: string | null;
          price: number;
          price_period: Database["public"]["Enums"]["price_period"] | null;
          region: string;
          status: Database["public"]["Enums"]["property_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amenities?: string[];
          area_sqm?: number | null;
          baths?: number | null;
          beds?: number | null;
          category: Database["public"]["Enums"]["property_category"];
          city: string;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          details?: Json | null;
          featured?: boolean;
          id?: string;
          lat?: number | null;
          listing_type?: Database["public"]["Enums"]["listing_type"];
          lng?: number | null;
          neighborhood?: string | null;
          owner_display_name?: string | null;
          owner_id?: string | null;
          owner_role?: string | null;
          price: number;
          price_period?: Database["public"]["Enums"]["price_period"] | null;
          region: string;
          status?: Database["public"]["Enums"]["property_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amenities?: string[];
          area_sqm?: number | null;
          baths?: number | null;
          beds?: number | null;
          category?: Database["public"]["Enums"]["property_category"];
          city?: string;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          details?: Json | null;
          featured?: boolean;
          id?: string;
          lat?: number | null;
          listing_type?: Database["public"]["Enums"]["listing_type"];
          lng?: number | null;
          neighborhood?: string | null;
          owner_display_name?: string | null;
          owner_id?: string | null;
          owner_role?: string | null;
          price?: number;
          price_period?: Database["public"]["Enums"]["price_period"] | null;
          region?: string;
          status?: Database["public"]["Enums"]["property_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "property_owners";
            referencedColumns: ["id"];
          },
        ];
      };
      property_images: {
        Row: {
          created_at: string;
          id: string;
          property_id: string;
          sort_order: number;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          property_id: string;
          sort_order?: number;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          property_id?: string;
          sort_order?: number;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_landmarks: {
        Row: {
          created_at: string;
          id: string;
          kind: string;
          km: number;
          mins: number;
          name: string;
          property_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind: string;
          km?: number;
          mins?: number;
          name: string;
          property_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: string;
          km?: number;
          mins?: number;
          name?: string;
          property_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_landmarks_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_owners: {
        Row: {
          address: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          id_number: string | null;
          notes: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          id_number?: string | null;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          id_number?: string | null;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      rent_agreements: {
        Row: {
          commission_amount: number | null;
          commission_rate: number | null;
          created_at: string;
          deposit_amount: number | null;
          end_date: string | null;
          id: string;
          notes: string | null;
          owner_id: string | null;
          price_period: Database["public"]["Enums"]["price_period"];
          property_id: string;
          rent_amount: number;
          start_date: string;
          status: Database["public"]["Enums"]["rent_agreement_status"];
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          commission_amount?: number | null;
          commission_rate?: number | null;
          created_at?: string;
          deposit_amount?: number | null;
          end_date?: string | null;
          id?: string;
          notes?: string | null;
          owner_id?: string | null;
          price_period?: Database["public"]["Enums"]["price_period"];
          property_id: string;
          rent_amount: number;
          start_date?: string;
          status?: Database["public"]["Enums"]["rent_agreement_status"];
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          commission_amount?: number | null;
          commission_rate?: number | null;
          created_at?: string;
          deposit_amount?: number | null;
          end_date?: string | null;
          id?: string;
          notes?: string | null;
          owner_id?: string | null;
          price_period?: Database["public"]["Enums"]["price_period"];
          property_id?: string;
          rent_amount?: number;
          start_date?: string;
          status?: Database["public"]["Enums"]["rent_agreement_status"];
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rent_agreements_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "property_owners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rent_agreements_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rent_agreements_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      rent_payments: {
        Row: {
          amount_due: number;
          collected_at: string | null;
          commission_amount: number;
          created_at: string;
          id: string;
          payout_amount: number;
          payout_at: string | null;
          period_end: string;
          period_start: string;
          rent_agreement_id: string;
          status: Database["public"]["Enums"]["rent_payment_status"];
          updated_at: string;
        };
        Insert: {
          amount_due: number;
          collected_at?: string | null;
          commission_amount?: number;
          created_at?: string;
          id?: string;
          payout_amount?: number;
          payout_at?: string | null;
          period_end: string;
          period_start: string;
          rent_agreement_id: string;
          status?: Database["public"]["Enums"]["rent_payment_status"];
          updated_at?: string;
        };
        Update: {
          amount_due?: number;
          collected_at?: string | null;
          commission_amount?: number;
          created_at?: string;
          id?: string;
          payout_amount?: number;
          payout_at?: string | null;
          period_end?: string;
          period_start?: string;
          rent_agreement_id?: string;
          status?: Database["public"]["Enums"]["rent_payment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rent_payments_rent_agreement_id_fkey";
            columns: ["rent_agreement_id"];
            isOneToOne: false;
            referencedRelation: "rent_agreements";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          author_name: string | null;
          comment: string | null;
          created_at: string;
          id: string;
          property_id: string;
          rating: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          author_name?: string | null;
          comment?: string | null;
          created_at?: string;
          id?: string;
          property_id: string;
          rating: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          author_name?: string | null;
          comment?: string | null;
          created_at?: string;
          id?: string;
          property_id?: string;
          rating?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      sale_transactions: {
        Row: {
          acquisition_cost: number;
          acquisition_date: string;
          buyer_id: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          owner_id: string | null;
          property_id: string;
          sale_date: string | null;
          sale_price: number | null;
          status: Database["public"]["Enums"]["sale_transaction_status"];
          updated_at: string;
        };
        Insert: {
          acquisition_cost: number;
          acquisition_date?: string;
          buyer_id?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          owner_id?: string | null;
          property_id: string;
          sale_date?: string | null;
          sale_price?: number | null;
          status?: Database["public"]["Enums"]["sale_transaction_status"];
          updated_at?: string;
        };
        Update: {
          acquisition_cost?: number;
          acquisition_date?: string;
          buyer_id?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          owner_id?: string | null;
          property_id?: string;
          sale_date?: string | null;
          sale_price?: number | null;
          status?: Database["public"]["Enums"]["sale_transaction_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sale_transactions_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_transactions_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "property_owners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_transactions_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_exists: { Args: never; Returns: boolean };
      claim_first_admin: { Args: never; Returns: boolean };
      count_properties_by_category: {
        Args: never;
        Returns: {
          category: Database["public"]["Enums"]["property_category"];
          count: number;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      property_rating_summary: {
        Args: never;
        Returns: {
          avg_rating: number;
          property_id: string;
          review_count: number;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "user";
      customer_type: "tenant" | "buyer";
      listing_type: "rent" | "sale";
      price_period: "night" | "month" | "year" | "total";
      property_category: "hostels" | "homes" | "lands" | "farmlands";
      property_status: "draft" | "published" | "archived";
      rent_agreement_status: "active" | "ended" | "terminated";
      rent_payment_status: "pending" | "collected" | "paid_to_landlord" | "overdue";
      sale_transaction_status: "held" | "listed" | "sold";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user"],
      customer_type: ["tenant", "buyer"],
      listing_type: ["rent", "sale"],
      price_period: ["night", "month", "year", "total"],
      property_category: ["hostels", "homes", "lands", "farmlands"],
      property_status: ["draft", "published", "archived"],
      rent_agreement_status: ["active", "ended", "terminated"],
      rent_payment_status: ["pending", "collected", "paid_to_landlord", "overdue"],
      sale_transaction_status: ["held", "listed", "sold"],
    },
  },
} as const;
