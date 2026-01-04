import { Link } from "react-router-dom";
import { Menu, X, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-display text-xl font-bold text-primary hidden sm:inline">
            Marketplace
          </span>
        </Link>

        {/* Desktop Nav - Center */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            to="/" 
            className="px-4 py-2 text-sm font-medium rounded-full hover:bg-secondary transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/feed" 
            className="px-4 py-2 text-sm font-medium rounded-full hover:bg-secondary transition-colors"
          >
            Feed
          </Link>
          <Link 
            to="/businesses" 
            className="px-4 py-2 text-sm font-medium rounded-full hover:bg-secondary transition-colors"
          >
            Businesses
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Link 
            to="/list-business"
            className="hidden md:block text-sm font-medium px-4 py-2 rounded-full hover:bg-secondary transition-colors"
          >
            List your business
          </Link>
          
          <Button variant="ghost" size="icon" className="hidden md:flex rounded-full">
            <Globe className="h-4 w-4" />
          </Button>
          

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4">
            <nav className="flex flex-col">
              <Link
                to="/"
                className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/feed"
                className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Feed
              </Link>
              <Link
                to="/businesses"
                className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Businesses
              </Link>
              <Link
                to="/list-business"
                className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                List your business
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
