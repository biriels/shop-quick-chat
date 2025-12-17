import React, { createContext, useContext, useState, ReactNode } from "react";
import { Business, Post } from "@/types/marketplace";
import { businesses as initialBusinesses, posts as initialPosts } from "@/data/mockData";

interface MarketplaceContextType {
  businesses: Business[];
  posts: Post[];
  addBusiness: (business: Omit<Business, "id" | "createdAt">) => void;
  updateBusiness: (id: string, business: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  addPost: (post: Omit<Post, "id" | "createdAt">) => void;
  updatePost: (id: string, post: Partial<Post>) => void;
  deletePost: (id: string) => void;
  getBusinessById: (id: string) => Business | undefined;
  getPostById: (id: string) => Post | undefined;
  getPostsByBusiness: (businessId: string) => Post[];
  getPostsByCategory: (category: string) => Post[];
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider = ({ children }: { children: ReactNode }) => {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const addBusiness = (business: Omit<Business, "id" | "createdAt">) => {
    const newBusiness: Business = {
      ...business,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBusinesses((prev) => [...prev, newBusiness]);
  };

  const updateBusiness = (id: string, business: Partial<Business>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...business } : b))
    );
  };

  const deleteBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    setPosts((prev) => prev.filter((p) => p.businessId !== id));
  };

  const addPost = (post: Omit<Post, "id" | "createdAt">) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setPosts((prev) => [...prev, newPost]);
  };

  const updatePost = (id: string, post: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...post } : p))
    );
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const getBusinessById = (id: string) => businesses.find((b) => b.id === id);
  const getPostById = (id: string) => posts.find((p) => p.id === id);
  const getPostsByBusiness = (businessId: string) =>
    posts.filter((p) => p.businessId === businessId);
  const getPostsByCategory = (category: string) =>
    posts.filter((p) => p.category === category);

  return (
    <MarketplaceContext.Provider
      value={{
        businesses,
        posts,
        addBusiness,
        updateBusiness,
        deleteBusiness,
        addPost,
        updatePost,
        deletePost,
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
