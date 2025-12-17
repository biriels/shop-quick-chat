import { Link } from "react-router-dom";
import { Business } from "@/types/marketplace";
import { WhatsAppButton } from "./WhatsAppButton";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { categories } from "@/data/mockData";

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
        {business.logo ? (
          <img
            src={business.logo}
            alt={business.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">
              {business.name.charAt(0)}
            </span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <Link to={`/business/${business.id}`}>
            <h3 className="font-display font-semibold text-lg group-hover:text-accent transition-colors">
              {business.name}
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
      
      <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
        {business.description}
      </p>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          {postsCount} {postsCount === 1 ? "product" : "products"}
        </span>
        <WhatsAppButton
          phoneNumber={business.whatsappNumber}
          size="sm"
        />
      </div>
    </article>
  );
};
