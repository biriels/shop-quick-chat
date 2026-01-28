import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Search, Tag, MapPin, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type KeywordCategory = "product" | "intent" | "location";

interface Keyword {
  id: string;
  keyword: string;
  category: KeywordCategory;
  created_at: string;
}

export const KeywordEngine = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<KeywordCategory | "all">("all");

  const [form, setForm] = useState({
    keyword: "",
    category: "product" as KeywordCategory,
  });

  const fetchKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from("keywords")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setKeywords((data as Keyword[]) || []);
    } catch (error) {
      console.error("Failed to fetch keywords:", error);
      toast.error("Failed to load keywords");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const resetForm = () => {
    setForm({
      keyword: "",
      category: "product",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("keywords").insert(form);
      if (error) throw error;
      toast.success("Keyword added");
      setDialogOpen(false);
      resetForm();
      await fetchKeywords();
    } catch (error) {
      toast.error("Failed to add keyword");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("keywords").delete().eq("id", id);
      if (error) throw error;
      toast.success("Keyword deleted");
      await fetchKeywords();
    } catch (error) {
      toast.error("Failed to delete keyword");
    }
  };

  const getCategoryIcon = (category: KeywordCategory) => {
    switch (category) {
      case "product":
        return <ShoppingCart className="h-4 w-4" />;
      case "intent":
        return <Search className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: KeywordCategory) => {
    switch (category) {
      case "product":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800";
      case "intent":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800";
      case "location":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800";
    }
  };

  const filteredKeywords = activeCategory === "all" 
    ? keywords 
    : keywords.filter(k => k.category === activeCategory);

  const productKeywords = keywords.filter(k => k.category === "product");
  const intentKeywords = keywords.filter(k => k.category === "intent");
  const locationKeywords = keywords.filter(k => k.category === "location");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-xl font-semibold">Keyword & Intent Engine</h2>
          <p className="text-sm text-muted-foreground">
            Manage keywords to identify buying intent signals
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Keyword
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Keyword</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  value={form.keyword}
                  onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                  placeholder="e.g., apartment, urgent, Lagos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value: KeywordCategory) =>
                    setForm({ ...form, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Product Keywords
                      </div>
                    </SelectItem>
                    <SelectItem value="intent">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Intent Keywords
                      </div>
                    </SelectItem>
                    <SelectItem value="location">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location Keywords
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Keyword
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold">Product Keywords</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
            {productKeywords.length}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            car, apartment, land, house...
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Search className="h-5 w-5" />
            <span className="font-semibold">Intent Keywords</span>
          </div>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-2">
            {intentKeywords.length}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            urgent, ASAP, looking for, need now...
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <MapPin className="h-5 w-5" />
            <span className="font-semibold">Location Keywords</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-2">
            {locationKeywords.length}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Lagos, Abuja, Ikeja...
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("all")}
        >
          All ({keywords.length})
        </Button>
        <Button
          variant={activeCategory === "product" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("product")}
          className="flex items-center gap-1"
        >
          <ShoppingCart className="h-3 w-3" />
          Product ({productKeywords.length})
        </Button>
        <Button
          variant={activeCategory === "intent" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("intent")}
          className="flex items-center gap-1"
        >
          <Search className="h-3 w-3" />
          Intent ({intentKeywords.length})
        </Button>
        <Button
          variant={activeCategory === "location" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("location")}
          className="flex items-center gap-1"
        >
          <MapPin className="h-3 w-3" />
          Location ({locationKeywords.length})
        </Button>
      </div>

      {/* Keywords Grid */}
      {filteredKeywords.length === 0 ? (
        <div className="text-center py-12 bg-secondary/50 rounded-xl">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No keywords added yet.</p>
          <p className="text-sm text-muted-foreground">Add keywords to detect buying intent.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filteredKeywords.map((keyword) => (
            <Badge
              key={keyword.id}
              variant="outline"
              className={`px-3 py-2 text-sm flex items-center gap-2 ${getCategoryColor(keyword.category)}`}
            >
              {getCategoryIcon(keyword.category)}
              {keyword.keyword}
              <button
                onClick={() => handleDelete(keyword.id)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
