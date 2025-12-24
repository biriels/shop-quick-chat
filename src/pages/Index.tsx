import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PostCard } from "@/components/PostCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { Loader2, Search, MapPin, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACCRA_LOCATIONS = [
  "All Accra",
  "Osu",
  "Cantonments",
  "Airport Residential",
  "East Legon",
  "Adabraka",
  "Labone",
  "Dzorwulu",
  "Achimota",
  "Tema",
  "Madina",
  "Spintex",
  "Dansoman",
  "Lapaz",
  "Kasoa",
  "Circle",
  "Ridge",
  "Roman Ridge",
  "Nungua",
  "Sakumono",
  "Lashibi",
];

const Index = () => {
  const { posts, businesses, getBusinessById, loading } = useMarketplace();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Accra");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredPosts = posts.filter((post) => {
    const business = getBusinessById(post.business_id);
    
    // Filter by category
    if (selectedCategory && business?.category !== selectedCategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesProduct = post.product_name?.toLowerCase().includes(query);
      const matchesCaption = post.caption?.toLowerCase().includes(query);
      const matchesBusiness = business?.name?.toLowerCase().includes(query);
      return matchesProduct || matchesCaption || matchesBusiness;
    }
    
    return true;
  });

  return (
    <Layout>
      {/* Sticky Glassmorphism Search Bar */}
      <div
        className={`fixed top-16 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-lg">
          <div className="container py-3">
            <div className="bg-card/80 backdrop-blur-md rounded-full shadow-md border border-border/50 p-1.5 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary/50 transition-colors cursor-pointer">
                  <Search className="h-4 w-4 text-primary" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="text-sm bg-transparent border-0 outline-none w-full placeholder:text-muted-foreground/60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border-l border-border/50 rounded-full hover:bg-secondary/50 transition-colors cursor-pointer">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground flex items-center gap-1">
                        {selectedLocation}
                        <ChevronDown className="h-3 w-3" />
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto bg-card/95 backdrop-blur-md">
                    {ACCRA_LOCATIONS.map((location) => (
                      <DropdownMenuItem
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                        className={selectedLocation === location ? "bg-secondary" : ""}
                      >
                        {location}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button className="rounded-full h-9 w-9 md:h-9 md:w-auto md:px-4" size="icon">
                  <Search className="h-4 w-4 md:mr-1.5" />
                  <span className="hidden md:inline text-sm">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Airbnb-style Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
              Discover amazing local businesses
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Order food, shop, book rooms, or make inquiries instantly via WhatsApp
            </p>
            
            {/* Airbnb-style Search Bar */}
            <div className="bg-card/90 backdrop-blur-md rounded-full shadow-lg border border-border/50 p-2 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-full hover:bg-secondary/50 transition-colors cursor-pointer">
                  <Search className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="text-xs font-medium text-muted-foreground">What</div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="text-sm bg-transparent border-0 outline-none w-full placeholder:text-muted-foreground/60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 border-l border-border/50 rounded-full hover:bg-secondary/50 transition-colors cursor-pointer">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="text-left flex-1">
                        <div className="text-xs font-medium text-muted-foreground">Where</div>
                        <div className="text-sm text-foreground flex items-center gap-1">
                          {selectedLocation}
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto bg-card/95 backdrop-blur-md">
                    {ACCRA_LOCATIONS.map((location) => (
                      <DropdownMenuItem
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                        className={selectedLocation === location ? "bg-secondary" : ""}
                      >
                        {location}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button className="rounded-full h-12 w-12 md:h-12 md:w-auto md:px-6" size="icon">
                  <Search className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Airbnb-style Category Tabs */}
      <section className="sticky top-16 z-40 bg-background border-b border-border">
        <div className="container py-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
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
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/50 py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Ready to grow your business?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join our marketplace and reach thousands of customers through WhatsApp
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/list-business">List your business</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
