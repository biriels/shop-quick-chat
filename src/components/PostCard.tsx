import { Link } from "react-router-dom";
import { Post, Business } from "@/types/marketplace";
import { WhatsAppButton } from "./WhatsAppButton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface PostCardProps {
  post: Post;
  business?: Business;
}

export const PostCard = ({ post, business }: PostCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <article className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <Link to={`/post/${post.id}`}>
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={post.media_url}
            alt={post.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        <Link to={`/post/${post.id}`}>
          <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-accent transition-colors">
            {post.product_name}
          </h3>
        </Link>
        
        {post.caption && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.caption}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-xl font-bold text-foreground">
            {formatPrice(post.price)}
          </span>
        </div>
        
        {business && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Link 
              to={`/business/${business.id}`}
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <span className="text-xs text-muted-foreground hover:text-accent">{business.name}</span>
              {business.verified && (
                <CheckCircle className="h-3 w-3 text-accent" />
              )}
            </Link>
            <WhatsAppButton
              phoneNumber={business.whatsapp_number}
              productTitle={post.product_name}
              size="sm"
            />
          </div>
        )}
      </div>
    </article>
  );
};
