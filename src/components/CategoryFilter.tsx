import { categories } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <div className="relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-background via-background to-transparent pr-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-border shadow-sm"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Categories */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide py-2 px-1"
        onScroll={checkScrollButtons}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex flex-col items-center gap-2 min-w-fit pb-2 border-b-2 transition-all duration-200",
            selectedCategory === null
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
          )}
        >
          <div className="text-2xl">🏪</div>
          <span className="text-xs font-medium whitespace-nowrap">All</span>
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex flex-col items-center gap-2 min-w-fit pb-2 border-b-2 transition-all duration-200",
              selectedCategory === category.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            <div className="text-2xl">{category.icon}</div>
            <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-background via-background to-transparent pl-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-border shadow-sm"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
