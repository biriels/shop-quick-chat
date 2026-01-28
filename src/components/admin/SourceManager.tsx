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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Globe, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type SourceType = "forum" | "listing" | "group" | "website";

interface Source {
  id: string;
  name: string;
  url: string;
  source_type: SourceType;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const SourceManager = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    url: "",
    source_type: "website" as SourceType,
    active: true,
  });

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSources((data as Source[]) || []);
    } catch (error) {
      console.error("Failed to fetch sources:", error);
      toast.error("Failed to load sources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      url: "",
      source_type: "website",
      active: true,
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        const { error } = await supabase
          .from("sources")
          .update(form)
          .eq("id", editing);
        if (error) throw error;
        toast.success("Source updated");
      } else {
        const { error } = await supabase.from("sources").insert(form);
        if (error) throw error;
        toast.success("Source added");
      }
      setDialogOpen(false);
      resetForm();
      await fetchSources();
    } catch (error) {
      toast.error("Failed to save source");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (source: Source) => {
    setForm({
      name: source.name,
      url: source.url,
      source_type: source.source_type,
      active: source.active,
    });
    setEditing(source.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this source?")) {
      try {
        const { error } = await supabase.from("sources").delete().eq("id", id);
        if (error) throw error;
        toast.success("Source deleted");
        await fetchSources();
      } catch (error) {
        toast.error("Failed to delete source");
      }
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("sources")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
      await fetchSources();
    } catch (error) {
      toast.error("Failed to update source");
    }
  };

  const getTypeColor = (type: SourceType) => {
    switch (type) {
      case "forum":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "listing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "group":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "website":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    }
  };

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
          <h2 className="font-display text-xl font-semibold">Source Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage public URLs to monitor for demand signals
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Source" : "Add New Source"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Source Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Facebook Cars Group"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Source URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Source Type</Label>
                <Select
                  value={form.source_type}
                  onValueChange={(value: SourceType) =>
                    setForm({ ...form, source_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forum">Forum</SelectItem>
                    <SelectItem value="listing">Listing Site</SelectItem>
                    <SelectItem value="group">Social Group</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={form.active}
                  onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editing ? "Update Source" : "Add Source"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-12 bg-secondary/50 rounded-xl">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No sources added yet.</p>
          <p className="text-sm text-muted-foreground">Add URLs to start monitoring demand signals.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline max-w-[200px] truncate"
                    >
                      {source.url}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(source.source_type)}`}>
                      {source.source_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={source.active}
                      onCheckedChange={(checked) => toggleActive(source.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(source)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(source.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
