import { Link } from "react-router-dom";
import { Business } from "@/types/marketplace";
import { WhatsAppButton } from "./WhatsAppButton";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { categories } from "@/data/mockData";
import { CheckCircle, Store } from "lucide-react";

interface BusinessCardProps {
  business: Business;
}

export const BusinessCard = ({ business }: BusinessCardProps) => {
  const { getPostsByBusiness } = useMarketplace();
  const postsCount = getPostsByBusiness(business.id).length;
  const category = categories.find((c) => c.id === business.category);

  return (
    <article className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
          <Store className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <Link to={`/business/${business.id}`}>
            <h3 className="font-display font-semibold text-lg group-hover:text-accent transition-colors flex items-center gap-2">
              {business.name}
              {business.verified && (
                <CheckCircle className="h-4 w-4 text-accent" />
              )}
            </h3>
          </Link>
          {category && (
            <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </span>
          )}
        </div>
      </div>
      
      {business.description && (
        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
          {business.description}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          {postsCount} {postsCount === 1 ? "product" : "products"}
        </span>
        <WhatsAppButton
          phoneNumber={business.whatsapp_number}
          size="sm"
        />
      </div>
    </article>
  );
};
