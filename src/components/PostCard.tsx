import { Link } from "react-router-dom";
import { Post, Business } from "@/types/marketplace";
import { WhatsAppButton } from "./WhatsAppButton";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  business?: Business;
}

export const PostCard = ({ post, business }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <article className="group relative">
      {/* Image Container */}
      <Link to={`/post/${post.id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-xl relative bg-secondary">
          <img
            src={post.media_url}
            alt={post.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors",
                isLiked ? "fill-primary text-primary" : "text-foreground"
              )} 
            />
          </button>
        </div>
      </Link>
      
      {/* Content */}
      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/post/${post.id}`}>
            <h3 className="font-medium text-foreground line-clamp-1 group-hover:underline">
              {post.product_name}
            </h3>
          </Link>
          {business?.verified && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
              <span className="text-sm font-medium">New</span>
            </div>
          )}
        </div>
        
        {business && (
          <Link 
            to={`/business/${business.id}`}
            className="block text-sm text-muted-foreground hover:underline"
          >
            {business.name}
          </Link>
        )}
        
        {post.caption && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {post.caption}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-foreground">
            {formatPrice(post.price)}
          </span>
          
          {business && (
            <WhatsAppButton
              phoneNumber={business.whatsapp_number}
              productTitle={post.product_name}
              size="sm"
            />
          )}
        </div>
      </div>
    </article>
  );
};
