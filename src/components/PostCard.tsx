import { Link } from "react-router-dom";
import { Post, Business } from "@/types/marketplace";
import { WhatsAppButton } from "./WhatsAppButton";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  post: Post;
  business?: Business;
}

export const PostCard = ({ post, business }: PostCardProps) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <article className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <Link to={`/post/${post.id}`}>
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {post.featured && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        <Link to={`/post/${post.id}`}>
          <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-accent transition-colors">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {post.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-xl font-bold text-foreground">
            {formatPrice(post.price, post.currency)}
          </span>
        </div>
        
        {business && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              {business.logo && (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="text-xs text-muted-foreground">{business.name}</span>
            </div>
            <WhatsAppButton
              phoneNumber={business.whatsappNumber}
              productTitle={post.title}
              size="sm"
            />
          </div>
        )}
      </div>
    </article>
  );
};
