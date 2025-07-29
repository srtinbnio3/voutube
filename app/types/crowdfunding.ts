export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type CreatorRewardStatus = 'pending' | 'paid';

export interface Campaign {
  id: string;
  post_id: string;
  channel_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  reward_enabled: boolean;
  bank_account_info?: {
    bank_name: string;
    branch_name: string;
    account_type: 'ordinary' | 'checking';
    account_number: string;
    account_holder: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CampaignWithChannel extends Campaign {
  channel: {
    id: string;
    name: string;
    icon_url?: string;
    youtube_channel_id: string;
  };
  post: {
    id: string;
    title: string;
  };
}

export interface CampaignReward {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  amount: number;
  quantity: number;
  remaining_quantity: number;
  delivery_date?: string;
  requires_shipping?: boolean;
  shipping_info?: string;
  images?: string[];
  template?: string;
  is_unlimited?: boolean;
  requires_contact_info?: boolean;
  requires_email?: boolean;
  requires_address?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignSupporter {
  id: string;
  campaign_id: string;
  user_id: string;
  reward_id: string;
  amount: number;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
  };
  reward?: CampaignReward;
}

export interface CreatorReward {
  id: string;
  campaign_id: string;
  amount: number;
  payment_status: CreatorRewardStatus;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
}

export interface CampaignFormData {
  title: string;
  description: string;
  target_amount: number;
  start_date: Date;
  end_date: Date;
  reward_enabled: boolean;
  post_id?: string;
  channel_id?: string;
  bank_account_info?: {
    bank_name: string;
    branch_name: string;
    account_type: 'ordinary' | 'checking';
    account_number: string;
    account_holder: string;
  };
}

export interface RewardFormData {
  title: string;
  description: string;
  amount: number;
  quantity: number;
  delivery_date?: string;
  requires_shipping?: boolean;
  shipping_info?: string;
  images?: string[];
  template?: string;
  is_unlimited?: boolean;
}

export interface SupportFormData {
  reward_id: string;
  amount: number;
} 