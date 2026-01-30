import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Eye, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface FetchedContent {
  id: string;
  source_id: string;
  source_url: string;
  fetched_at: string;
  raw_text: string | null;
  status: string;
  error_message: string | null;
  sources?: {
    name: string;
  };
}

export const FetchedContentViewer = () => {
  const [content, setContent] = useState<FetchedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [selectedContent, setSelectedContent] = useState<FetchedContent | null>(null);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("fetched_content")
        .select(`
          *,
          sources (name)
        `)
        .order("fetched_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setContent((data as FetchedContent[]) || []);
    } catch (error) {
      console.error("Failed to fetch content:", error);
      toast.error("Failed to load fetched content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const triggerFetch = async () => {
    setTriggering(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-sources");
      
      if (error) throw error;
      
      toast.success(`Fetch complete: ${data.successful} success, ${data.failed} failed`);
      await fetchContent();
    } catch (error) {
      console.error("Failed to trigger fetch:", error);
      toast.error("Failed to trigger fetch");
    } finally {
      setTriggering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
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
          <h2 className="font-display text-xl font-semibold">Fetched Content</h2>
          <p className="text-sm text-muted-foreground">
            View scraped content from monitored sources (runs hourly)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchContent} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={triggerFetch} disabled={triggering}>
            {triggering ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Fetch Now
          </Button>
        </div>
      </div>

      {content.length === 0 ? (
        <div className="text-center py-12 bg-secondary/50 rounded-xl">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No content fetched yet.</p>
          <p className="text-sm text-muted-foreground">
            Add sources and click "Fetch Now" or wait for the hourly job.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fetched</TableHead>
                <TableHead>Content Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.sources?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {item.source_url}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.fetched_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {item.raw_text ? (
                      <span className="text-sm">
                        {(item.raw_text.length / 1024).toFixed(1)} KB
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedContent(item)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>
                            {item.sources?.name || "Fetched Content"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">URL:</span>{" "}
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {item.source_url}
                              </a>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>{" "}
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                          
                          {item.error_message && (
                            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                              <strong>Error:</strong> {item.error_message}
                            </div>
                          )}
                          
                          {item.raw_text && (
                            <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                              <pre className="text-xs whitespace-pre-wrap font-mono">
                                {item.raw_text.substring(0, 10000)}
                                {item.raw_text.length > 10000 && "..."}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
