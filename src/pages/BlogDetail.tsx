import { useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/shell/PageShell";
import { JsonLdSchema } from "@/components/JsonLdSchema";
import { ArrowLeft, Clock, Tag, Eye, Share2, Facebook, Twitter, Linkedin, Link2, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { blogPosts } from "@/data/blogData";

export const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ name: string; text: string; date: string }[]>([]);
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <PageShell rail={{ no: "R2", label: "GÜNLÜK" }}>
        <div className="container-industrial text-center py-20">
          <h1 className="heading-industrial text-3xl mb-4">Yazı Bulunamadı</h1>
          <Link to="/blog" className="btn-industrial-primary">Blog'a Dön</Link>
        </div>
      </PageShell>
    );
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      { name: commentName, text: commentText, date: new Date().toLocaleDateString("tr-TR") },
    ]);
    setCommentName("");
    setCommentText("");
  };

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    /* Shell only (Phase 04) — see `KVKK.tsx`. Body untouched. */
    <PageShell rail={{ no: "R2", label: "İÇGÖRÜ" }}>
      <JsonLdSchema type="article" name={post.title} description={post.excerpt} datePublished={post.date} category={post.category} />
        <article className="container-industrial max-w-4xl">
          {/* Back */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={16} /> Blog'a Dön
          </Link>

          {/* Hero Image */}
          <motion.div
            className="aspect-[16/9] overflow-hidden mb-8 border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </motion.div>

          {/* Meta */}
          <motion.div
            className="flex flex-wrap items-center gap-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-xs font-semibold text-primary flex items-center gap-1"><Tag size={12} />{post.category}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} />{post.readTime}</span>
            <span className="text-xs text-muted-foreground">{post.date}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye size={12} />{post.views.toLocaleString()} okuma</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="heading-industrial text-3xl md:text-4xl mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {post.title}
          </motion.h1>

          {/* Content */}
          <motion.div
            className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {post.fullContent.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </motion.div>

          {/* Share */}
          <motion.div
            className="mt-12 pt-8 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Share2 size={16} /> Bu Yazıyı Paylaş
            </h3>
            <div className="flex gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook'ta paylaş (yeni sekmede açılır)"
                className="w-10 h-10 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Facebook size={16} aria-hidden="true" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X'te paylaş (yeni sekmede açılır)"
                className="w-10 h-10 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Twitter size={16} aria-hidden="true" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn'de paylaş (yeni sekmede açılır)"
                className="w-10 h-10 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Linkedin size={16} aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label={copied ? "Bağlantı kopyalandı" : "Bağlantıyı kopyala"}
                className="w-10 h-10 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Link2 size={16} aria-hidden="true" />
              </button>
              <span className="text-xs text-primary self-center" role="status" aria-live="polite">
                {copied ? "Kopyalandı!" : ""}
              </span>
            </div>
          </motion.div>

          {/* Comments */}
          <motion.div
            className="mt-12 pt-8 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <MessageSquare size={16} /> Yorumlar ({comments.length})
            </h3>

            {/* Comment List */}
            {comments.length > 0 && (
              <div className="space-y-4 mb-8">
                {comments.map((c, i) => (
                  <div key={i} className="bg-card border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleComment} className="space-y-4">
              <input
                type="text"
                placeholder="Adınız"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <textarea
                placeholder="Yorumunuz..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                className="w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              />
              <button type="submit" className="btn-industrial-primary !py-3 !px-6 flex items-center gap-2">
                <Send size={14} /> Yorum Yap
              </button>
            </form>
          </motion.div>

          {/* Related */}
          {related.length > 0 && (
            <motion.div
              className="mt-12 pt-8 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="heading-industrial text-xl mb-6">İlgili Yazılar</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    to={`/blog/${rp.slug}`}
                    className="border border-border bg-card overflow-hidden hover:border-primary transition-colors group"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-primary font-semibold">{rp.category}</span>
                      <h4 className="font-bold text-sm mt-1 group-hover:text-primary transition-colors line-clamp-2">{rp.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </article>
    </PageShell>
  );
};
