type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  password_hash: string;
  profile_image: string;
  created_at: Date;
  updated_at: Date;
  otp: string;
  otp_expires: Date;
};

export type { User };
