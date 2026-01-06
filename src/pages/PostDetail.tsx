import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { categories } from "@/data/mockData";
import { ArrowLeft, Store, Tag, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ImageGallery";
import { formatPrice } from "@/lib/formatPrice";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getPostById, getBusinessById, loading } = useMarketplace();

  const post = getPostById(id || "");
  const business = post ? getBusinessById(post.business_id) : null;
  const category = business ? categories.find((c) => c.id === business.category) : null;
  
  // Support for multiple images - uses product_images array with fallback to media_url
  const productImages = post 
    ? (post.product_images && post.product_images.length > 0 
        ? post.product_images 
        : [post.media_url])
    : [];

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

        {/* Image Gallery - Full width on top */}
        <div className="relative mb-8">
          <ImageGallery images={productImages} alt={post.product_name} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details - Left side */}
          <div className="lg:col-span-2 space-y-6">
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
              <div className="border-t border-b py-6">
                <h3 className="font-display font-semibold text-lg mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {post.caption}
                </p>
              </div>
            )}

            {/* Business Info */}
            {business && (
              <div className="border-b pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-xl font-semibold">
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/business/${business.id}`}
                      className="font-semibold text-lg hover:underline flex items-center gap-2"
                    >
                      Sold by {business.name}
                      {business.verified && (
                        <CheckCircle className="h-4 w-4 text-accent" />
                      )}
                    </Link>
                    {business.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {business.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Card - Right side (sticky) */}
          {business && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-6 space-y-4 shadow-lg">
                <div className="text-center space-y-1">
                  <div className="font-display text-2xl font-bold text-accent">
                    {formatPrice(post.price)}
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-display font-semibold text-lg">
                    Interested in this product?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Contact the seller directly via WhatsApp for inquiries or to make a purchase.
                  </p>
                  <WhatsAppButton
                    phoneNumber={business.whatsapp_number}
                    productTitle={post.product_name}
                    size="xl"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PostDetail;
