import { useState } from "react";
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
import { Pencil, Trash2, Plus, Store, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Admin = () => {
  const {
    businesses,
    posts,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    addPost,
    updatePost,
    deletePost,
    getBusinessById,
  } = useMarketplace();

  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);

  // Business form state
  const [businessForm, setBusinessForm] = useState({
    name: "",
    description: "",
    whatsappNumber: "",
    logo: "",
    category: "",
  });

  // Post form state
  const [postForm, setPostForm] = useState({
    businessId: "",
    title: "",
    description: "",
    price: "",
    currency: "USD",
    image: "",
    category: "",
    featured: false,
  });

  const resetBusinessForm = () => {
    setBusinessForm({
      name: "",
      description: "",
      whatsappNumber: "",
      logo: "",
      category: "",
    });
    setEditingBusiness(null);
  };

  const resetPostForm = () => {
    setPostForm({
      businessId: "",
      title: "",
      description: "",
      price: "",
      currency: "USD",
      image: "",
      category: "",
      featured: false,
    });
    setEditingPost(null);
  };

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBusiness) {
      updateBusiness(editingBusiness, businessForm);
      toast.success("Business updated successfully");
    } else {
      addBusiness(businessForm);
      toast.success("Business added successfully");
    }
    setBusinessDialogOpen(false);
    resetBusinessForm();
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const postData = {
      ...postForm,
      price: parseFloat(postForm.price),
    };
    if (editingPost) {
      updatePost(editingPost, postData);
      toast.success("Post updated successfully");
    } else {
      addPost(postData);
      toast.success("Post added successfully");
    }
    setPostDialogOpen(false);
    resetPostForm();
  };

  const openEditBusiness = (id: string) => {
    const business = getBusinessById(id);
    if (business) {
      setBusinessForm({
        name: business.name,
        description: business.description,
        whatsappNumber: business.whatsappNumber,
        logo: business.logo || "",
        category: business.category,
      });
      setEditingBusiness(id);
      setBusinessDialogOpen(true);
    }
  };

  const openEditPost = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (post) {
      setPostForm({
        businessId: post.businessId,
        title: post.title,
        description: post.description,
        price: post.price.toString(),
        currency: post.currency,
        image: post.image,
        category: post.category,
        featured: post.featured,
      });
      setEditingPost(id);
      setPostDialogOpen(true);
    }
  };

  const handleDeleteBusiness = (id: string) => {
    if (confirm("Delete this business and all its posts?")) {
      deleteBusiness(id);
      toast.success("Business deleted");
    }
  };

  const handleDeletePost = (id: string) => {
    if (confirm("Delete this post?")) {
      deletePost(id);
      toast.success("Post deleted");
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage businesses and product posts.
          </p>
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Posts
            </TabsTrigger>
          </TabsList>

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
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        value={businessForm.whatsappNumber}
                        onChange={(e) =>
                          setBusinessForm({ ...businessForm, whatsappNumber: e.target.value })
                        }
                        placeholder="1234567890"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo">Logo URL (optional)</Label>
                      <Input
                        id="logo"
                        value={businessForm.logo}
                        onChange={(e) =>
                          setBusinessForm({ ...businessForm, logo: e.target.value })
                        }
                        placeholder="https://..."
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
                    <Button type="submit" className="w-full">
                      {editingBusiness ? "Update Business" : "Add Business"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="bg-card rounded-lg p-4 shadow-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Store className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{business.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {business.whatsappNumber}
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
              ))}
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
                  <Button>
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
                        value={postForm.businessId}
                        onValueChange={(value) =>
                          setPostForm({ ...postForm, businessId: value })
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
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={postForm.title}
                        onChange={(e) =>
                          setPostForm({ ...postForm, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postDescription">Description</Label>
                      <Textarea
                        id="postDescription"
                        value={postForm.description}
                        onChange={(e) =>
                          setPostForm({ ...postForm, description: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={postForm.currency}
                          onValueChange={(value) =>
                            setPostForm({ ...postForm, currency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        value={postForm.image}
                        onChange={(e) =>
                          setPostForm({ ...postForm, image: e.target.value })
                        }
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postCategory">Category</Label>
                      <Select
                        value={postForm.category}
                        onValueChange={(value) =>
                          setPostForm({ ...postForm, category: value })
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
                    <div className="flex items-center gap-2">
                      <Switch
                        id="featured"
                        checked={postForm.featured}
                        onCheckedChange={(checked) =>
                          setPostForm({ ...postForm, featured: checked })
                        }
                      />
                      <Label htmlFor="featured">Featured Post</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingPost ? "Update Post" : "Add Post"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {posts.map((post) => {
                const business = getBusinessById(post.businessId);
                return (
                  <div
                    key={post.id}
                    className="bg-card rounded-lg p-4 shadow-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {business?.name} • ${post.price}
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
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
