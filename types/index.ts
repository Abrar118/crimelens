export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profile_image: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  division: string;
  district: string;
  images: string[];
  video?: string;
  crime_time: Date;
  post_time: Date;
  upvotes: number;
  downvotes: number;
  verification_score: number;
  is_anonymous: boolean;
  is_verified_badge: boolean;
  comment_count: number;
}

export interface Comment {
  _id: string;
  post_id: string;
  user_id: string;
  text: string;
  proof_url: string;
  created_at: Date;
}

export interface Vote {
  _id: string;
  post_id: string;
  user_id: string;
  type: "up" | "down";
}
