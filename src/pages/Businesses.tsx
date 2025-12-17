import { Layout } from "@/components/layout/Layout";
import { BusinessCard } from "@/components/BusinessCard";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { Loader2 } from "lucide-react";

const Businesses = () => {
  const { businesses, loading } = useMarketplace();

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            All Businesses
          </h1>
          <p className="text-muted-foreground">
            Discover local businesses and connect with them directly via WhatsApp.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business, index) => (
              <div
                key={business.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <BusinessCard business={business} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No businesses yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Businesses;
