import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AISearchBar } from "@/components/AISearchBar";
import { 
  Ticket, 
  Plane, 
  UtensilsCrossed, 
  Car, 
  ShoppingBag, 
  Sparkles,
  Copy,
  Check,
  Clock,
  Percent,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DealCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface Deal {
  id: string;
  categoryId: string;
  title: string;
  code: string;
  discount: string;
  description: string;
  expiresIn: string;
  brand: string;
  brandLogo?: string;
}

const categories: DealCategory[] = [
  { id: "all", name: "All Deals", icon: <Sparkles className="h-5 w-5" />, color: "bg-primary" },
  { id: "cheap", name: "Cheap Coupons", icon: <Ticket className="h-5 w-5" />, color: "bg-green-500" },
  { id: "airlines", name: "Airline Coupons", icon: <Plane className="h-5 w-5" />, color: "bg-blue-500" },
  { id: "restaurants", name: "Restaurant Coupons", icon: <UtensilsCrossed className="h-5 w-5" />, color: "bg-orange-500" },
  { id: "rideshare", name: "Uber & Bolt Promos", icon: <Car className="h-5 w-5" />, color: "bg-purple-500" },
  { id: "shopping", name: "Shopping Deals", icon: <ShoppingBag className="h-5 w-5" />, color: "bg-pink-500" },
  { id: "events", name: "Events Tickets", icon: <CalendarDays className="h-5 w-5" />, color: "bg-amber-500" },
];

const deals: Deal[] = [
  // Cheap Coupons
  { id: "1", categoryId: "cheap", title: "50% Off First Order", code: "WELCOME50", discount: "50%", description: "Valid for new customers only", expiresIn: "3 days", brand: "LocalMart" },
  { id: "2", categoryId: "cheap", title: "GH₵20 Off Orders Above GH₵100", code: "SAVE20", discount: "GH₵20", description: "Minimum order GH₵100", expiresIn: "5 days", brand: "QuickShop" },
  { id: "3", categoryId: "cheap", title: "Free Delivery Weekend", code: "FREEDELIVERY", discount: "Free", description: "Free delivery on all orders", expiresIn: "2 days", brand: "ExpressGo" },
  
  // Airline Coupons
  { id: "4", categoryId: "airlines", title: "15% Off International Flights", code: "FLY15INT", discount: "15%", description: "Book international flights", expiresIn: "7 days", brand: "Africa World Airlines" },
  { id: "5", categoryId: "airlines", title: "Early Bird Special", code: "EARLYBIRD", discount: "20%", description: "Book 30 days in advance", expiresIn: "14 days", brand: "PassionAir" },
  { id: "6", categoryId: "airlines", title: "Weekend Getaway Deal", code: "WEEKEND25", discount: "25%", description: "Fri-Sun departures only", expiresIn: "4 days", brand: "Emirates" },
  
  // Restaurant Coupons
  { id: "7", categoryId: "restaurants", title: "Buy 1 Get 1 Free Pizza", code: "BOGOPIZZA", discount: "BOGO", description: "On all large pizzas", expiresIn: "5 days", brand: "Pizza Inn" },
  { id: "8", categoryId: "restaurants", title: "30% Off Family Meals", code: "FAMILY30", discount: "30%", description: "Orders above GH₵150", expiresIn: "6 days", brand: "KFC Ghana" },
  { id: "9", categoryId: "restaurants", title: "Free Drink with Combo", code: "FREEDRINK", discount: "Free", description: "Any combo meal purchase", expiresIn: "3 days", brand: "Burger King" },
  
  // Rideshare Promos
  { id: "10", categoryId: "rideshare", title: "40% Off Next 5 Rides", code: "UBER40GH", discount: "40%", description: "Up to GH₵30 off per ride", expiresIn: "7 days", brand: "Uber" },
  { id: "11", categoryId: "rideshare", title: "50% Off First Bolt Ride", code: "BOLTFIRST", discount: "50%", description: "New users only", expiresIn: "30 days", brand: "Bolt" },
  { id: "12", categoryId: "rideshare", title: "Free Ride to Airport", code: "AIRPORTFREE", discount: "Free", description: "Max GH₵80 value", expiresIn: "10 days", brand: "Uber" },
  
  // Shopping Deals
  { id: "13", categoryId: "shopping", title: "Extra 25% Off Sale Items", code: "EXTRA25", discount: "25%", description: "On already reduced items", expiresIn: "4 days", brand: "Melcom" },
  { id: "14", categoryId: "shopping", title: "GH₵50 Off Electronics", code: "TECH50", discount: "GH₵50", description: "Min spend GH₵300", expiresIn: "8 days", brand: "Jumia" },
  { id: "15", categoryId: "shopping", title: "Flash Sale Access", code: "FLASH2024", discount: "Up to 70%", description: "Early access to flash sales", expiresIn: "1 day", brand: "Tonaton" },
  
  // Events Tickets
  { id: "16", categoryId: "events", title: "20% Off Concert Tickets", code: "CONCERT20", discount: "20%", description: "All live music events", expiresIn: "5 days", brand: "Ticketmaster Ghana" },
  { id: "17", categoryId: "events", title: "Buy 2 Get 1 Free Movie", code: "MOVIE3FOR2", discount: "BOGO", description: "Weekend movie screenings", expiresIn: "3 days", brand: "Silverbird Cinemas" },
  { id: "18", categoryId: "events", title: "VIP Festival Pass Discount", code: "FESTVIPH", discount: "30%", description: "VIP access to Afrochella", expiresIn: "10 days", brand: "Afrochella" },
];

const DealCard = ({ deal }: { deal: Deal }) => {
  const [copied, setCopied] = useState(false);
  const category = categories.find(c => c.id === deal.categoryId);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(deal.code);
    setCopied(true);
    toast.success(`Code "${deal.code}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Discount Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className={cn("text-white font-bold px-3 py-1", category?.color || "bg-primary")}>
          <Percent className="h-3 w-3 mr-1" />
          {deal.discount}
        </Badge>
      </div>

      <div className="p-5">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white", category?.color || "bg-primary")}>
            {category?.icon}
          </div>
          <div>
            <p className="font-semibold text-foreground">{deal.brand}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires in {deal.expiresIn}
            </p>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">{deal.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{deal.description}</p>

        {/* Promo Code */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted/50 border-2 border-dashed border-border rounded-lg px-4 py-2.5 text-center">
            <code className="font-mono font-bold text-foreground tracking-wider">{deal.code}</code>
          </div>
          <Button 
            onClick={handleCopyCode}
            size="sm"
            className={cn(
              "transition-all",
              copied ? "bg-green-500 hover:bg-green-600" : ""
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const Deals = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredDeals = activeCategory === "all" 
    ? deals 
    : deals.filter(deal => deal.categoryId === activeCategory);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section with AI Search */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent py-12 md:py-16">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Deals
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Find Your Perfect
                <span className="text-primary"> Deal</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Ask our AI to find the best discounts on rides, flights, restaurants, and more!
              </p>
            </div>
            
            {/* AI Search Bar */}
            <AISearchBar />
          </div>
        </div>

        {/* Category Pills */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container py-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all font-medium text-sm",
                    activeCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {activeCategory === "all" 
                ? "All Deals" 
                : categories.find(c => c.id === activeCategory)?.name}
            </h2>
            <Badge variant="outline" className="text-muted-foreground">
              {filteredDeals.length} deals available
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-16">
              <Ticket className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No deals found</h3>
              <p className="text-muted-foreground">Check back soon for new offers!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Deals;
