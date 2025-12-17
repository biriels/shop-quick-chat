import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Business, Post } from "@/types/marketplace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MarketplaceContextType {
  businesses: Business[];
  posts: Post[];
  loading: boolean;
  refreshData: () => Promise<void>;
  getBusinessById: (id: string) => Business | undefined;
  getPostById: (id: string) => Post | undefined;
  getPostsByBusiness: (businessId: string) => Post[];
  getPostsByCategory: (category: string) => Post[];
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider = ({ children }: { children: ReactNode }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [businessesRes, postsRes] = await Promise.all([
        supabase.from("businesses").select("*").order("created_at", { ascending: false }),
        supabase.from("posts").select("*").order("created_at", { ascending: false }),
      ]);

      if (businessesRes.error) throw businessesRes.error;
      if (postsRes.error) throw postsRes.error;

      setBusinesses(businessesRes.data || []);
      setPosts(postsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  const getBusinessById = (id: string) => businesses.find((b) => b.id === id);
  const getPostById = (id: string) => posts.find((p) => p.id === id);
  const getPostsByBusiness = (businessId: string) =>
    posts.filter((p) => p.business_id === businessId);
  const getPostsByCategory = (category: string) => {
    const categoryBusinessIds = businesses
      .filter((b) => b.category === category)
      .map((b) => b.id);
    return posts.filter((p) => categoryBusinessIds.includes(p.business_id));
  };

  return (
    <MarketplaceContext.Provider
      value={{
        businesses,
        posts,
        loading,
        refreshData,
        getBusinessById,
        getPostById,
        getPostsByBusiness,
        getPostsByCategory,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};
