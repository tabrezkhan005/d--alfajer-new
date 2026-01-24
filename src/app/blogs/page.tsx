import { getBlogs } from "@/src/lib/supabase/admin";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogsPage() {
  let blogs = [];
  try {
    blogs = await getBlogs();
  } catch (e) {
    console.error("Failed to fetch blogs in page", e);
  }

  const publishedBlogs = Array.isArray(blogs) ? blogs.filter((b: any) => b.is_published) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Blog</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          News, updates, and stories from Al Fajer Mart.
        </p>
      </div>

      {publishedBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedBlogs.map((blog: any) => (
            <Card key={blog.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              {blog.image_url && (
                <div className="relative w-full h-48">
                  <Image
                    src={blog.image_url}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                </div>
                <CardTitle className="line-clamp-2 hover:text-green-600 transition-colors">
                  <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {blog.excerpt || blog.content.substring(0, 150) + "..."}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/blogs/${blog.slug}`} className="w-full">
                  <Button variant="outline" className="w-full">Read More</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">No blog posts found.</p>
        </div>
      )}
    </div>
  );
}
