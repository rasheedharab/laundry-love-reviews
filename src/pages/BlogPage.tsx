import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Share2, BookOpen, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCardSkeleton from "@/components/skeletons/BlogCardSkeleton";
import AnimatedPage from "@/components/AnimatedPage";
import ReactMarkdown from "react-markdown";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<"blog_posts">;

function readTime(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

/* ─── List Card ─── */
function PostCard({ post, onClick, index }: { post: BlogPost; onClick: () => void; index: number }) {
  return (
    <motion.button
      onClick={onClick}
      className="group w-full text-left rounded-2xl glass overflow-hidden"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      {post.cover_image_url && (
        <div className="aspect-[2/1] overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime(post.content)} min
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-accent uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Detail View ─── */
function PostDetail({
  post,
  relatedPosts,
  onBack,
  onSelectPost,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
  onBack: () => void;
  onSelectPost: (slug: string) => void;
}) {
  const articleRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0.3]);
  const minutes = readTime(post.content);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt || "", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="pb-12"
    >
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-accent z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Floating Back Button */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="fixed top-5 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full glass shadow-lg"
      >
        <ArrowLeft className="h-4 w-4 text-foreground" />
      </motion.button>

      {/* Floating Share Button */}
      <motion.button
        onClick={handleShare}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed top-5 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full glass shadow-lg"
      >
        <Share2 className="h-4 w-4 text-foreground" />
      </motion.button>

      {/* Hero Image */}
      {post.cover_image_url && (
        <div ref={heroRef} className="relative -mx-5 -mt-6 mb-8 overflow-hidden" style={{ minHeight: "56vw", maxHeight: 360 }}>
          <motion.img
            src={post.cover_image_url}
            alt={post.title}
            className="absolute inset-0 h-[130%] w-full object-cover"
            style={{ y: heroY, opacity: heroOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      {/* Title & Meta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={post.cover_image_url ? "-mt-20 relative z-10" : "mt-12"}
      >
        <h1 className="text-[26px] md:text-3xl font-display font-bold text-foreground leading-tight mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
              <Calendar className="h-3 w-3" />
              {post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : "Draft"}
            </span>
            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
              <BookOpen className="h-3 w-3" />
              {minutes} min read
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-8" />
      </motion.div>

      {/* Article Body */}
      <motion.article
        ref={articleRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="prose prose-sm max-w-none
          prose-headings:text-foreground prose-headings:font-display prose-headings:mt-8 prose-headings:mb-3
          prose-h2:text-xl prose-h2:border-l-[3px] prose-h2:border-accent prose-h2:pl-4
          prose-h3:text-base
          prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:mb-4
          prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline
          prose-strong:text-foreground
          prose-img:rounded-2xl prose-img:shadow-md
          prose-blockquote:border-l-accent prose-blockquote:bg-secondary/50 prose-blockquote:rounded-r-xl prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic
          prose-li:text-muted-foreground prose-li:marker:text-accent
          prose-ul:my-4 prose-ol:my-4"
      >
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </motion.article>

      {/* End-of-Article CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 p-6 rounded-2xl glass text-center"
      >
        <Heart className="h-6 w-6 text-accent mx-auto mb-3" />
        <p className="text-sm font-display font-bold text-foreground mb-1">Enjoyed this article?</p>
        <p className="text-xs text-muted-foreground mb-4">Share it with someone who'd appreciate premium garment care.</p>
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="rounded-full gap-2 text-xs font-semibold"
        >
          <Share2 className="h-3.5 w-3.5" /> Share Article
        </Button>
      </motion.div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <h3 className="text-lg font-display font-bold text-foreground mb-4">Continue Reading</h3>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 no-scrollbar">
            {relatedPosts.map((rp) => (
              <motion.button
                key={rp.id}
                onClick={() => {
                  onSelectPost(rp.slug);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-shrink-0 w-[200px] rounded-2xl glass overflow-hidden text-left group"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                {rp.cover_image_url && (
                  <img
                    src={rp.cover_image_url}
                    alt={rp.title}
                    className="h-24 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{rp.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{readTime(rp.content)} min read</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Main Page ─── */
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
  const relatedPosts = selectedPost ? posts.filter((p) => p.id !== selectedPost.id).slice(0, 4) : [];

  // Scroll to top when opening a post
  useEffect(() => {
    if (selectedPost) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedSlug]);

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-4">
        <AnimatePresence mode="wait">
          {!selectedPost ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="section-label mb-1">THE WHITE RABBIT</p>
                  <h1 className="text-2xl font-display font-bold text-foreground">Journal</h1>
                </div>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-6">Stories, tips & insights on premium garment care.</p>

              {loading ? (
                <BlogCardSkeleton count={3} />
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-2">No posts yet</p>
                  <p className="text-xs text-muted-foreground">Check back soon for updates!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={i}
                      onClick={() => setSearchParams({ post: post.slug })}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <PostDetail
              key="detail"
              post={selectedPost}
              relatedPosts={relatedPosts}
              onBack={() => setSearchParams({})}
              onSelectPost={(slug) => setSearchParams({ post: slug })}
            />
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}
