import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PostCard } from "@/components/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { Post, Business } from "@/types/marketplace";
import { Loader2 } from "lucide-react";

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [businesses, setBusinesses] = useState<Record<string, Business>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        // Fetch active posts sorted by most recent
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (postsError) {
          console.error("[Feed] Error fetching posts");
          return;
        }

        // Fetch active businesses
        const { data: businessesData, error: businessesError } = await supabase
          .from("businesses")
          .select("*")
          .eq("active", true);

        if (businessesError) {
          console.error("[Feed] Error fetching businesses");
          return;
        }

        // Create business lookup map
        const businessMap: Record<string, Business> = {};
        businessesData?.forEach((b) => {
          businessMap[b.id] = b as Business;
        });

        // Filter posts to only include those from active businesses
        const activePosts = (postsData || []).filter(
          (post) => businessMap[post.business_id]
        ) as Post[];

        setPosts(activePosts);
        setBusinesses(businessMap);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
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
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Latest Products
          </h1>
          <p className="text-muted-foreground">
            Discover the newest products from our verified sellers
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-secondary/50 rounded-xl">
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                business={businesses[post.business_id]}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Feed;
