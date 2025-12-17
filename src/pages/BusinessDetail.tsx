import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PostCard } from "@/components/PostCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { categories } from "@/data/mockData";
import { ArrowLeft, CheckCircle, Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getBusinessById, getPostsByBusiness, loading } = useMarketplace();

  const business = getBusinessById(id || "");
  const posts = getPostsByBusiness(id || "");
  const category = business ? categories.find((c) => c.id === business.category) : null;

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Business not found</h1>
          <Button asChild>
            <Link to="/businesses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Businesses
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/businesses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Businesses
          </Link>
        </Button>

        {/* Business Header */}
        <div className="bg-card rounded-xl p-6 md:p-8 shadow-card mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center">
              <Store className="h-12 w-12 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                {business.name}
                {business.verified && (
                  <CheckCircle className="h-6 w-6 text-accent" />
                )}
              </h1>
              {category && (
                <span className="text-muted-foreground flex items-center gap-2 mb-3">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
              )}
              {business.description && (
                <p className="text-muted-foreground">{business.description}</p>
              )}
            </div>

            <div className="flex-shrink-0">
              <WhatsAppButton
                phoneNumber={business.whatsapp_number}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Business Posts */}
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold mb-6">
            Products ({posts.length})
          </h2>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PostCard post={post} business={business} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-secondary/50 rounded-xl">
              <p className="text-muted-foreground">No products from this business yet.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BusinessDetail;
