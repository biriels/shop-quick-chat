import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PostCard } from "@/components/PostCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { posts, businesses, getBusinessById, loading } = useMarketplace();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? posts.filter((post) => {
        const business = getBusinessById(post.business_id);
        return business?.category === selectedCategory;
      })
    : posts;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 md:py-24">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Message the best restaurants and hotels near you on WhatsApp
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              Order food, shop, book rooms, or make inquiries instantly — no apps, no signups.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="whatsapp" size="lg" asChild>
                <a href="#browse">Find businesses near you</a>
              </Button>
              <Button variant="link" className="text-primary-foreground/80 hover:text-primary-foreground" asChild>
                <Link to="/list-business">
                  List your business
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section id="browse" className="container py-12">
        <div className="mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">Browse All Products</h2>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post, index) => (
              <div
                key={post.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PostCard
                  post={post}
                  business={getBusinessById(post.business_id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="bg-secondary py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                {posts.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Products</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                {businesses.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Businesses</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                24/7
              </div>
              <div className="text-sm text-muted-foreground mt-1">WhatsApp Support</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                Free
              </div>
              <div className="text-sm text-muted-foreground mt-1">To Browse</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
