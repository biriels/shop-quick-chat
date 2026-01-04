import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
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
import { categories } from "@/data/mockData";
import { Loader2, Upload, X, CheckCircle, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const submissionSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name is too long"),
  whatsapp_number: z.string().regex(/^[0-9]{10,15}$/, "Enter a valid phone number (10-15 digits)"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().max(500, "Description is too long").optional(),
});

const ListBusiness = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    business_name: "",
    whatsapp_number: "",
    category: "",
    description: "",
  });

  // Allowed image extensions (must match server-side storage policy)
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (productImages.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large. Max size is 5MB`);
          continue;
        }

        // Validate file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
          toast.error(`${file.name} is not a valid image type. Allowed: jpg, jpeg, png, webp, gif`);
          continue;
        }

        // Validate MIME type
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validMimeTypes.includes(file.type)) {
          toast.error(`${file.name} has an invalid file type`);
          continue;
        }

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(fileName, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}. Only image files are allowed.`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('business-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setProductImages([...productImages, ...uploadedUrls]);
      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} image(s) uploaded`);
      }
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validated = submissionSchema.parse(form);

      const { error } = await supabase.from("business_submissions").insert({
        business_name: validated.business_name,
        whatsapp_number: validated.whatsapp_number,
        category: validated.category,
        description: validated.description || null,
        product_images: productImages,
        status: "pending",
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Your business has been submitted for review!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container py-16 max-w-lg mx-auto text-center">
          <div className="bg-card rounded-xl p-8 shadow-card">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">
              Submission Received!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for submitting your business. We'll review it and get back to you soon.
            </p>
            <Button asChild>
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12 max-w-2xl mx-auto">
        {/* Hero Stats Section */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold mb-2">
            List Your Business
          </h1>
          <p className="text-muted-foreground mb-8">
            Get more customers on WhatsApp. Submit your business for review.
          </p>
          
          <div className="grid grid-cols-3 gap-4 bg-card rounded-xl p-6 shadow-card mb-8">
            <div className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">5K+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Active Buyers</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">200+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Businesses Listed</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-primary">50K+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Monthly Views</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-card space-y-6">
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="e.g. Kojo's Kitchen"
              required
            />
          </div>

          <div>
            <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
            <Input
              id="whatsapp_number"
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              placeholder="e.g. 233201234567"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter with country code, no spaces or dashes
            </p>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell us about your business..."
              rows={3}
            />
          </div>

          <div>
            <Label>Product Images (up to 5)</Label>
            <div className="mt-2">
              {productImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {productImages.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                      <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {productImages.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    {uploadingImages ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
                        <p className="text-sm text-muted-foreground">Click to upload images</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                </label>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit for Review
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            All businesses are vetted and approved before listing.
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default ListBusiness;
