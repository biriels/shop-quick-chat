import { useState } from "react";
import { Search, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AISearchBarProps {
  onSearch?: (query: string) => void;
}

export const AISearchBar = ({ onSearch }: AISearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setIsExpanded(true);
    setAiResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("smart-search", {
        body: { query: query.trim() },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setAiResponse(data.response);
      onSearch?.(query);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setAiResponse(null);
    setQuery("");
  };

  const suggestedQueries = [
    "Find me cheap food deals",
    "Uber discounts expiring soon",
    "Best flight deals this week",
    "Shopping coupons under 50%",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-3 shadow-lg">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to find deals... e.g. 'cheap food deals expiring soon'"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            size="sm"
            className="rounded-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Suggested Queries */}
        {!isExpanded && (
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {suggestedQueries.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Response Panel */}
      {isExpanded && (
        <div className="mt-4 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">AI Recommendations</span>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Finding the best deals for you...</p>
                </div>
              </div>
            ) : aiResponse ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {aiResponse}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
