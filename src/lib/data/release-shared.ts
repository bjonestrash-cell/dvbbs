import type {
  AssetType,
  MarketingChannel,
  ReleaseStatus,
} from "@/lib/supabase/types";

export const RELEASE_STATUS_ORDER: ReleaseStatus[] = [
  "idea",
  "in_production",
  "mixing",
  "mastered",
  "delivered",
  "scheduled",
  "released",
  "archived",
];

export const RELEASE_STATUS_LABEL: Record<ReleaseStatus, string> = {
  idea: "Idea",
  in_production: "In production",
  mixing: "Mixing",
  mastered: "Mastered",
  delivered: "Delivered",
  scheduled: "Scheduled",
  released: "Released",
  archived: "Archived",
};

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  master_wav: "Master WAV",
  instrumental: "Instrumental",
  stems: "Stems",
  radio_edit: "Radio edit",
  clean: "Clean",
  dirty: "Dirty",
  cover_art: "Cover art",
  press_shot: "Press shot",
  music_video: "Music video",
  lyric_video: "Lyric video",
  press_release: "Press release",
  one_sheet: "One sheet",
  splits_doc: "Splits doc",
};

export const ASSET_TYPES_ORDER: AssetType[] = [
  "master_wav",
  "instrumental",
  "stems",
  "radio_edit",
  "clean",
  "dirty",
  "cover_art",
  "press_shot",
  "music_video",
  "lyric_video",
  "press_release",
  "one_sheet",
  "splits_doc",
];

export const MARKETING_CHANNEL_LABEL: Record<MarketingChannel, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "Twitter",
  newsletter: "Newsletter",
  press: "Press",
  radio: "Radio",
  dsp_pitch: "DSP pitch",
  ads: "Ads",
  other: "Other",
};

export const MARKETING_CHANNEL_ORDER: MarketingChannel[] = [
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "newsletter",
  "press",
  "radio",
  "dsp_pitch",
  "ads",
  "other",
];
