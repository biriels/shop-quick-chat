import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { categories } from "@/data/mockData";
import { ArrowLeft, Store, Tag, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getPostById, getBusinessById, loading } = useMarketplace();

  const post = getPostById(id || "");
  const business = post ? getBusinessById(post.business_id) : null;
  const category = business ? categories.find((c) => c.id === business.category) : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
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
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary">
              <img
                src={post.media_url}
                alt={post.product_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {category && (
                <span className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <Tag className="h-3 w-3" />
                  {category.icon} {category.name}
                </span>
              )}
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                {post.product_name}
              </h1>
            </div>

            <div className="font-display text-3xl md:text-4xl font-bold text-accent">
              {formatPrice(post.price)}
            </div>

            {post.caption && (
              <p className="text-muted-foreground leading-relaxed">
                {post.caption}
              </p>
            )}

            {/* Business Info */}
            {business && (
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Store className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/business/${business.id}`}
                      className="font-semibold hover:text-accent transition-colors flex items-center gap-2"
                    >
                      {business.name}
                      {business.verified && (
                        <CheckCircle className="h-4 w-4 text-accent" />
                      )}
                    </Link>
                    {business.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {business.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            {business && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-display font-semibold text-lg">
                  Interested in this product?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Contact the seller directly via WhatsApp for inquiries, pricing, or to make a purchase.
                </p>
                <WhatsAppButton
                  phoneNumber={business.whatsapp_number}
                  productTitle={post.product_name}
                  size="xl"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetail;
