import { getBlogBySlug } from "@/src/lib/supabase/admin";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export const revalidate = 3600;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.is_published) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/blogs">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Blogs
        </Button>
      </Link>

      <article>
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="h-4 w-4" />
            {new Date(blog.published_at || blog.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{blog.title}</h1>
          {blog.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {blog.excerpt}
            </p>
          )}
        </header>

        {blog.image_url && (
          <div className="relative w-full aspect-[21/9] mb-10 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={blog.image_url}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content - Simple Textarea rendering with basic line breaks support */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
            {blog.content.split('\n').map((paragraph: string, index: number) => (
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
            ))}
        </div>
      </article>
    </div>
  );
}
