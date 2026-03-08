import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedPage from "@/components/AnimatedPage";
import ReactMarkdown from "react-markdown";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<"blog_posts">;

function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl glass overflow-hidden transition-all hover:shadow-md"
    >
      {post.cover_image_url && (
        <div className="aspect-[2/1] overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-lg font-display font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {Math.max(1, Math.ceil(post.content.length / 1000))} min read
          </span>
        </div>
      </div>
    </button>
  );
}

function PostDetail({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <div className="pb-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </button>

      {post.cover_image_url && (
        <div className="rounded-2xl overflow-hidden mb-6 aspect-[2/1]">
          <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">{post.title}</h1>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-8">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : ""}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {Math.max(1, Math.ceil(post.content.length / 1000))} min read
        </span>
      </div>

      <article className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-display prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-xl">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </div>
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedSlug = searchParams.get("post");

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  const selectedPost = selectedSlug ? posts.find((p) => p.slug === selectedSlug) : null;

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-4">
        {!selectedPost && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-display font-bold text-foreground">Blog</h1>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <Skeleton className="aspect-[2/1] w-full" />
                    <div className="p-5 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground mb-2">No posts yet</p>
                <p className="text-xs text-muted-foreground">Check back soon for updates!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => setSearchParams({ post: post.slug })}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {selectedPost && (
          <PostDetail post={selectedPost} onBack={() => setSearchParams({})} />
        )}
      </div>
    </AnimatedPage>
  );
}
