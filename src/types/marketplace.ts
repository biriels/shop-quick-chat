export interface Business {
  id: string;
  name: string;
  description: string;
  whatsappNumber: string;
  logo?: string;
  category: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  businessId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  featured: boolean;
  createdAt: Date;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
};
