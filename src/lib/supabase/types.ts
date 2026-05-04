export type AppRole = "principal" | "manager" | "agent" | "accountant" | "viewer";

export type ShowStatus =
  | "lead"
  | "offered"
  | "holding"
  | "confirmed"
  | "contracted"
  | "completed"
  | "cancelled";

export type ContactType =
  | "promoter"
  | "venue"
  | "agent"
  | "label"
  | "press"
  | "collab"
  | "crew"
  | "other";

export type LegType = "flight" | "train" | "car" | "ferry" | "other";

export interface TeamMember {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  type: ContactType;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Show {
  id: string;
  status: ShowStatus;
  show_date: string | null;
  doors_time: string | null;
  set_time: string | null;
  set_length_minutes: number | null;
  timezone: string | null;
  venue_name: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
  capacity: number | null;
  promoter_contact_id: string | null;
  agent_contact_id: string | null;
  fee_offered: number | null;
  fee_confirmed: number | null;
  currency: string | null;
  deposit_received: number | null;
  travel_covered: boolean;
  hospitality_covered: boolean;
  notes: string | null;
  bandsintown_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShowTravel {
  id: string;
  show_id: string;
  leg_type: LegType;
  carrier: string | null;
  confirmation_code: string | null;
  departure_location: string | null;
  arrival_location: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  cost: number | null;
  notes: string | null;
}

export interface ShowLodging {
  id: string;
  show_id: string;
  hotel_name: string | null;
  address: string | null;
  check_in: string | null;
  check_out: string | null;
  confirmation_code: string | null;
  cost: number | null;
  notes: string | null;
}

export interface ShowCrew {
  id: string;
  show_id: string;
  contact_id: string | null;
  role: string | null;
  fee: number | null;
  travel_covered: boolean;
}

export interface ShowSettlement {
  id: string;
  show_id: string;
  gross_paid: number | null;
  expenses_total: number | null;
  agent_commission: number | null;
  manager_commission: number | null;
  net_to_artist: number | null;
  paid_in_full: boolean;
  paid_date: string | null;
  invoice_url: string | null;
  notes: string | null;
  reconciled_at: string | null;
  reconciled_by: string | null;
  locked: boolean;
}

export interface ShowSetlist {
  id: string;
  show_id: string;
  position: number | null;
  track_title: string | null;
  artist: string | null;
  is_unreleased: boolean;
  spotify_url: string | null;
  notes: string | null;
}

export interface ShowActivity {
  id: string;
  show_id: string;
  team_member_id: string | null;
  action: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

type Table<Row, ReqInsertKeys extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, ReqInsertKeys>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      team_members: Table<TeamMember, "email" | "role">;
      contacts: Table<Contact, "name" | "type">;
      shows: Table<Show>;
      show_travel: Table<ShowTravel, "show_id" | "leg_type">;
      show_lodging: Table<ShowLodging, "show_id">;
      show_crew: Table<ShowCrew, "show_id">;
      show_settlement: Table<ShowSettlement, "show_id">;
      show_setlist: Table<ShowSetlist, "show_id">;
      show_activity: Table<ShowActivity, "show_id" | "action">;
    };
    Views: { [_ in never]: never };
    Functions: {
      app_role: { Args: Record<string, never>; Returns: AppRole | null };
    };
  };
}
