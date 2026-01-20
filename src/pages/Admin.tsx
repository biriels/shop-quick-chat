import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "@/data/mockData";
import { Pencil, Trash2, Plus, Store, Package, Loader2, CheckCircle, LogOut, ClipboardList, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface BusinessSubmission {
  id: string;
  business_name: string;
  whatsapp_number: string;
  category: string;
  description: string | null;
  product_images: string[];
  status: string;
  submitted_at: string;
}

const Admin = () => {
  const { user, isAdmin, checking, signOut } = useAdminAuth();
  const { businesses, posts, loading, refreshData, getBusinessById } = useMarketplace();

  const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<BusinessSubmission | null>(null);
  const [processingSubmission, setProcessingSubmission] = useState(false);

  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Business form state
  const [businessForm, setBusinessForm] = useState({
    name: "",
    description: "",
    whatsapp_number: "",
    category: "",
    verified: false,
    active: true,
  });

  // Post form state
  const [postForm, setPostForm] = useState({
    business_id: "",
    product_name: "",
    caption: "",
    price: "",
    media_url: "",
    active: true,
  });

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("business_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Failed to fetch submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin]);

  const handleApproveSubmission = async (submission: BusinessSubmission) => {
    setProcessingSubmission(true);
    try {
      // Create the business and get the new business ID
      const { data: newBusiness, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: submission.business_name,
          whatsapp_number: submission.whatsapp_number,
          category: submission.category,
          description: submission.description,
          verified: true,
          active: true,
        })
        .select("id")
        .single();

      if (businessError) throw businessError;

      // Create posts from product images so they appear in the feed
      if (submission.product_images && submission.product_images.length > 0) {
        const postsToCreate = submission.product_images.map((imageUrl, index) => ({
          business_id: newBusiness.id,
          media_url: imageUrl,
          product_name: `${submission.business_name} Product ${index + 1}`,
          caption: submission.description || `Product from ${submission.business_name}`,
          price: 0, // Default price, admin can update later
          active: true,
        }));

        const { error: postsError } = await supabase.from("posts").insert(postsToCreate);
        
        if (postsError) {
          console.error("Failed to create posts:", postsError);
          // Don't throw - business was created successfully, posts are optional
          toast.warning("Business approved but some posts couldn't be created");
        }
      }

      // Update submission status
      const { error: updateError } = await supabase
        .from("business_submissions")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      toast.success("Business approved and posts added to feed!");
      setSelectedSubmission(null);
      await fetchSubmissions();
      await refreshData();
    } catch (error) {
      toast.error("Failed to approve submission");
    } finally {
      setProcessingSubmission(false);
    }
  };

  const handleRejectSubmission = async (submission: BusinessSubmission) => {
    setProcessingSubmission(true);
    try {
      const { error } = await supabase
        .from("business_submissions")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", submission.id);

      if (error) throw error;

      toast.success("Submission rejected");
      setSelectedSubmission(null);
      await fetchSubmissions();
    } catch (error) {
      toast.error("Failed to reject submission");
    } finally {
      setProcessingSubmission(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (confirm("Delete this submission?")) {
      try {
        const { error } = await supabase.from("business_submissions").delete().eq("id", id);
        if (error) throw error;
        toast.success("Submission deleted");
        await fetchSubmissions();
      } catch (error) {
        toast.error("Failed to delete submission");
      }
    }
  };

  const resetBusinessForm = () => {
    setBusinessForm({
      name: "",
      description: "",
      whatsapp_number: "",
      category: "",
      verified: false,
      active: true,
    });
    setEditingBusiness(null);
  };

  const resetPostForm = () => {
    setPostForm({
      business_id: "",
      product_name: "",
      caption: "",
      price: "",
      media_url: "",
      active: true,
    });
    setEditingPost(null);
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingBusiness) {
        const { error } = await supabase
          .from("businesses")
          .update(businessForm)
          .eq("id", editingBusiness);
        if (error) throw error;
        toast.success("Business updated successfully");
      } else {
        const { error } = await supabase.from("businesses").insert(businessForm);
        if (error) throw error;
        toast.success("Business added successfully");
      }
      setBusinessDialogOpen(false);
      resetBusinessForm();
      await refreshData();
    } catch (error) {
      toast.error("Failed to save business");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const postData = {
        ...postForm,
        price: parseFloat(postForm.price),
      };

      if (editingPost) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", editingPost);
        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase.from("posts").insert(postData);
        if (error) throw error;
        toast.success("Post added successfully");
      }
      setPostDialogOpen(false);
      resetPostForm();
      await refreshData();
    } catch (error) {
      toast.error("Failed to save post");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditBusiness = (id: string) => {
    const business = getBusinessById(id);
    if (business) {
      setBusinessForm({
        name: business.name,
        description: business.description || "",
        whatsapp_number: business.whatsapp_number,
        category: business.category,
        verified: business.verified,
        active: business.active,
      });
      setEditingBusiness(id);
      setBusinessDialogOpen(true);
    }
  };

  const openEditPost = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (post) {
      setPostForm({
        business_id: post.business_id,
        product_name: post.product_name,
        caption: post.caption || "",
        price: post.price.toString(),
        media_url: post.media_url,
        active: post.active,
      });
      setEditingPost(id);
      setPostDialogOpen(true);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (confirm("Delete this business and all its posts?")) {
      try {
        const { error } = await supabase.from("businesses").delete().eq("id", id);
        if (error) throw error;
        toast.success("Business deleted");
        await refreshData();
      } catch (error) {
        toast.error("Failed to delete business");
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm("Delete this post?")) {
      try {
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (error) throw error;
        toast.success("Post deleted");
        await refreshData();
      } catch (error) {
        toast.error("Failed to delete post");
      }
    }
  };

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const getCategoryName = (catId: string) => categories.find((c) => c.id === catId)?.name || catId;

  // Show loading while checking auth or loading data
  if (checking || loading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // useAdminAuth redirects non-authenticated and non-admin users automatically
  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage businesses, posts, and submissions.
            </p>
          </div>
          <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Submissions
              {pendingSubmissions.length > 0 && (
                <span className="ml-1 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {pendingSubmissions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Posts
            </TabsTrigger>
          </TabsList>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-xl font-semibold">
                Pending Submissions ({pendingSubmissions.length})
              </h2>
            </div>

            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingSubmissions.length === 0 ? (
              <div className="text-center py-12 bg-secondary/50 rounded-xl">
                <p className="text-muted-foreground">No pending submissions.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-card rounded-lg p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {submission.product_images.length > 0 ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                            <img
                              src={submission.product_images[0]}
                              alt={submission.business_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                            <Store className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{submission.business_name}</h3>
                          <p className="text-sm text-muted-foreground">{submission.whatsapp_number}</p>
                          <p className="text-sm text-muted-foreground">{getCategoryName(submission.category)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(submission)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Review Submission</DialogTitle>
                            </DialogHeader>
                            {selectedSubmission && (
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-muted-foreground">Business Name</Label>
                                  <p className="font-medium">{selectedSubmission.business_name}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">WhatsApp Number</Label>
                                  <p className="font-medium">{selectedSubmission.whatsapp_number}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Category</Label>
                                  <p className="font-medium">{getCategoryName(selectedSubmission.category)}</p>
                                </div>
                                {selectedSubmission.description && (
                                  <div>
                                    <Label className="text-muted-foreground">Description</Label>
                                    <p>{selectedSubmission.description}</p>
                                  </div>
                                )}
                                {selectedSubmission.product_images.length > 0 && (
                                  <div>
                                    <Label className="text-muted-foreground">Product Images</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                      {selectedSubmission.product_images.map((url, i) => (
                                        <img
                                          key={i}
                                          src={url}
                                          alt={`Product ${i + 1}`}
                                          className="w-full aspect-square object-cover rounded-lg"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    className="flex-1"
                                    onClick={() => handleApproveSubmission(selectedSubmission)}
                                    disabled={processingSubmission}
                                  >
                                    {processingSubmission ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <Check className="h-4 w-4 mr-2" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleRejectSubmission(selectedSubmission)}
                                    disabled={processingSubmission}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSubmission(submission.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Businesses Tab */}
          <TabsContent value="businesses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-xl font-semibold">
                Businesses ({businesses.length})
              </h2>
              <Dialog open={businessDialogOpen} onOpenChange={(open) => {
                setBusinessDialogOpen(open);
                if (!open) resetBusinessForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Business
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBusiness ? "Edit Business" : "Add New Business"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBusinessSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        value={businessForm.name}
                        onChange={(e) =>
                          setBusinessForm({ ...businessForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={businessForm.description}
                        onChange={(e) =>
                          setBusinessForm({ ...businessForm, description: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        value={businessForm.whatsapp_number}
                        onChange={(e) =>
                          setBusinessForm({ ...businessForm, whatsapp_number: e.target.value })
                        }
                        placeholder="1234567890"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={businessForm.category}
                        onValueChange={(value) =>
                          setBusinessForm({ ...businessForm, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="verified"
                          checked={businessForm.verified}
                          onCheckedChange={(checked) =>
                            setBusinessForm({ ...businessForm, verified: checked })
                          }
                        />
                        <Label htmlFor="verified">Verified</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="active"
                          checked={businessForm.active}
                          onCheckedChange={(checked) =>
                            setBusinessForm({ ...businessForm, active: checked })
                          }
                        />
                        <Label htmlFor="active">Active</Label>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingBusiness ? "Update Business" : "Add Business"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {businesses.length === 0 ? (
                <div className="text-center py-12 bg-secondary/50 rounded-xl">
                  <p className="text-muted-foreground">No businesses yet. Add your first one!</p>
                </div>
              ) : (
                businesses.map((business) => (
                  <div
                    key={business.id}
                    className="bg-card rounded-lg p-4 shadow-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Store className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {business.name}
                          {business.verified && (
                            <CheckCircle className="h-4 w-4 text-accent" />
                          )}
                          {!business.active && (
                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {business.whatsapp_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditBusiness(business.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBusiness(business.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-xl font-semibold">
                Posts ({posts.length})
              </h2>
              <Dialog open={postDialogOpen} onOpenChange={(open) => {
                setPostDialogOpen(open);
                if (!open) resetPostForm();
              }}>
                <DialogTrigger asChild>
                  <Button disabled={businesses.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPost ? "Edit Post" : "Add New Post"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePostSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="business">Business</Label>
                      <Select
                        value={postForm.business_id}
                        onValueChange={(value) =>
                          setPostForm({ ...postForm, business_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business" />
                        </SelectTrigger>
                        <SelectContent>
                          {businesses.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="product_name">Product Name</Label>
                      <Input
                        id="product_name"
                        value={postForm.product_name}
                        onChange={(e) =>
                          setPostForm({ ...postForm, product_name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="caption">Caption</Label>
                      <Textarea
                        id="caption"
                        value={postForm.caption}
                        onChange={(e) =>
                          setPostForm({ ...postForm, caption: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={postForm.price}
                        onChange={(e) =>
                          setPostForm({ ...postForm, price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="media_url">Media URL</Label>
                      <Input
                        id="media_url"
                        type="url"
                        value={postForm.media_url}
                        onChange={(e) =>
                          setPostForm({ ...postForm, media_url: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="post_active"
                        checked={postForm.active}
                        onCheckedChange={(checked) =>
                          setPostForm({ ...postForm, active: checked })
                        }
                      />
                      <Label htmlFor="post_active">Active</Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingPost ? "Update Post" : "Add Post"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-secondary/50 rounded-xl">
                  <p className="text-muted-foreground">
                    {businesses.length === 0
                      ? "Add a business first before creating posts."
                      : "No posts yet. Add your first one!"}
                  </p>
                </div>
              ) : (
                posts.map((post) => {
                  const business = getBusinessById(post.business_id);
                  return (
                    <div
                      key={post.id}
                      className="bg-card rounded-lg p-4 shadow-card flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
                          <img
                            src={post.media_url}
                            alt={post.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {post.product_name}
                            {!post.active && (
                              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                                Inactive
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {business?.name || "Unknown Business"}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            GH₵{post.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditPost(post.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
