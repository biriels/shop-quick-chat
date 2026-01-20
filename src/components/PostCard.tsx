import { Link } from "react-router-dom";
import { Post, Business } from "@/types/marketplace";
import { WhatsAppButton } from "./WhatsAppButton";
import { Heart, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  post: Post;
  business?: Business;
}

export const PostCard = ({ post, business }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  // Generate a consistent random rating for each post (based on post id)
  const rating = useMemo(() => {
    const hash = post.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return (4.5 + (Math.abs(hash) % 6) / 10).toFixed(2);
  }, [post.id]);

  // Determine if this is a "guest favorite" (random based on id)
  const isGuestFavorite = useMemo(() => {
    const hash = post.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    return Math.abs(hash) % 3 === 0;
  }, [post.id]);

  return (
    <article className="group relative">
      {/* Image Container */}
      <Link to={`/post/${post.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden rounded-xl relative bg-secondary">
          <img
            src={post.media_url}
            alt={post.product_name}
            className="w-full h-full object-contain bg-secondary group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Guest Favorite Badge */}
          {isGuestFavorite && (
            <Badge 
              className="absolute top-3 left-3 bg-background/95 text-foreground hover:bg-background/95 shadow-md font-medium text-xs px-2 py-1"
            >
              Guest favorite
            </Badge>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors hover:scale-110"
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors",
                isLiked ? "fill-rose-500 text-rose-500" : "text-foreground/70 hover:text-foreground"
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
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
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
