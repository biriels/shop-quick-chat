import { Link } from "react-router-dom";
import { PricingSection } from "@/components/PricingSection";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/50 mt-auto">
      <div className="container py-8">
        {/* Pricing Section */}
        <PricingSection />
        
        <div className="border-t border-border mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">M</span>
                </div>
                <span className="font-display text-lg font-bold">Marketplace</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Connect with local businesses directly via WhatsApp.
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-semibold mb-4">Quick Links</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Browse Posts
                </Link>
                <Link to="/businesses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All Businesses
                </Link>
              </nav>
            </div>
            
            <div>
              <h4 className="font-display font-semibold mb-4">For Business</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Admin Panel
                </Link>
              </nav>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Marketplace. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
