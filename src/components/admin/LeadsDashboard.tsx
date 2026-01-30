import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, ExternalLink, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Lead {
  id: string;
  source_url: string;
  matched_keywords: string[];
  snippet: string;
  confidence_score: number;
  status: string;
  created_at: string;
  sources?: {
    name: string;
  };
}

export const LeadsDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchLeads = async () => {
    try {
      let query = supabase
        .from("leads")
        .select(`
          *,
          sources (name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeads((data as Lead[]) || []);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const triggerDetection = async () => {
    setDetecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("detect-leads");
      
      if (error) throw error;
      
      toast.success(`Detection complete: ${data.leadsFound} leads found`);
      
      // Handle WhatsApp links if any
      if (data.whatsappLinks && data.whatsappLinks.length > 0) {
        for (const { link } of data.whatsappLinks) {
          window.open(link, "_blank");
        }
      }
      
      await fetchLeads();
    } catch (error) {
      console.error("Failed to run detection:", error);
      toast.error("Failed to run lead detection");
    } finally {
      setDetecting(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;
      toast.success("Lead status updated");
      await fetchLeads();
    } catch (error) {
      console.error("Failed to update lead:", error);
      toast.error("Failed to update lead");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            New
          </Badge>
        );
      case "contacted":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Contacted
          </Badge>
        );
      case "converted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Converted
          </Badge>
        );
      case "dismissed":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Dismissed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 70) {
      return <Badge className="bg-green-100 text-green-800">{score}%</Badge>;
    } else if (score >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">{score}%</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">{score}%</Badge>;
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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Detected Leads</h2>
          <p className="text-sm text-muted-foreground">
            Buyer intent signals found from monitored sources
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchLeads}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={triggerDetection} disabled={detecting}>
            {detecting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Detect Leads
          </Button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-12 bg-secondary/50 rounded-xl">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No leads detected yet.</p>
          <p className="text-sm text-muted-foreground">
            Add sources & keywords, fetch content, then run detection.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Snippet</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Found</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{lead.sources?.name || "Unknown"}</p>
                      <a
                        href={lead.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {lead.matched_keywords.slice(0, 3).map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                      {lead.matched_keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{lead.matched_keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {lead.snippet}
                    </p>
                  </TableCell>
                  <TableCell>{getConfidenceBadge(lead.confidence_score)}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={lead.status}
                      onValueChange={(value) => updateLeadStatus(lead.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
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
