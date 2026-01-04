export interface Business {
  id: string;
  name: string;
  whatsapp_number: string;
  category: string;
  description: string | null;
  verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  business_id: string;
  media_url: string;
  product_name: string;
  price: number;
  caption: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  product_images: string[] | null;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
};
