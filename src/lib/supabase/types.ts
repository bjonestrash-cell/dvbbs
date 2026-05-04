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

export type ReleaseType =
  | "single"
  | "ep"
  | "album"
  | "remix"
  | "edit"
  | "bootleg";

export type ReleaseStatus =
  | "idea"
  | "in_production"
  | "mixing"
  | "mastered"
  | "delivered"
  | "scheduled"
  | "released"
  | "archived";

export type AssetType =
  | "master_wav"
  | "instrumental"
  | "stems"
  | "radio_edit"
  | "clean"
  | "dirty"
  | "cover_art"
  | "press_shot"
  | "music_video"
  | "lyric_video"
  | "press_release"
  | "one_sheet"
  | "splits_doc";

export type AssetStatus =
  | "not_started"
  | "in_progress"
  | "review"
  | "approved"
  | "final";

export type MarketingChannel =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "newsletter"
  | "press"
  | "radio"
  | "dsp_pitch"
  | "ads"
  | "other";

export type MarketingStatus = "todo" | "in_progress" | "done";

export interface Release {
  id: string;
  title: string;
  slug: string;
  type: ReleaseType;
  status: ReleaseStatus;
  release_date: string | null;
  label: string | null;
  isrc: string | null;
  upc: string | null;
  cover_art_url: string | null;
  collaborators: string[] | null;
  splits: Record<string, unknown> | null;
  spotify_url: string | null;
  apple_url: string | null;
  soundcloud_url: string | null;
  youtube_url: string | null;
  beatport_url: string | null;
  smart_link_slug: string | null;
  presave_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReleaseAsset {
  id: string;
  release_id: string;
  asset_type: AssetType;
  status: AssetStatus;
  file_url: string | null;
  due_date: string | null;
  notes: string | null;
}

export interface ReleaseMarketing {
  id: string;
  release_id: string;
  channel: MarketingChannel;
  task: string;
  status: MarketingStatus;
  scheduled_for: string | null;
  owner_id: string | null;
  notes: string | null;
}

export interface SmartLink {
  id: string;
  slug: string;
  release_id: string | null;
  title: string | null;
  destinations: Record<string, string>;
  click_count: number;
  created_at: string;
}

export interface SmartLinkClick {
  id: string;
  smart_link_id: string;
  platform: string | null;
  country: string | null;
  user_agent: string | null;
  clicked_at: string;
}

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
