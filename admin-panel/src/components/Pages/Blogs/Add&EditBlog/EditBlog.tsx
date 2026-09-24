"use client";
import { useEffect, useState } from "react";
import BlogForm from "./BlogForm";
import { getBlogById } from "@/services/blog/blogService";
import { FormValues } from "./BlogForm";
import { useParams, useRouter } from "next/navigation";
import { HoverLoading } from "@/components/Common/Loading/HoverLoading";
import { useRoleSegment } from "@/helpers/useRoleSegment";

interface EditBlogProps {
  routeSegment?: string;
  heading?: string;
}

// Ported from product-space-admin's Add&EditBlog/EditBlog.tsx — this is the
// "v1" flat-form editor still used for blogs authored before the v2 (TipTap)
// editor existed. `blog.version` decides which editor a given blog opens in
// (see BlogsTable's handleEdit) — v1 is NOT "Landing Blogs" and NOT legacy,
// it's simply the original content format, still actively edited.
export default function EditBlog({
  routeSegment = "blogs",
  heading = "Edit Blog",
}: EditBlogProps) {
  const { id } = useParams<{ id?: string }>();
  const router = useRouter();
  const roleSegment = useRoleSegment();
  const [blog, setBlog] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(true);

  const getBlogData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const blogData = await getBlogById(id);

      setBlog({
        ...blogData,
        publishedDate: new Date(blogData.publishedDate),
        content: blogData.content ?? [],
        faqs: blogData.faqs ?? [],
      });
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBlogData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <HoverLoading title="Loading blog..." />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Blog not found</p>
        <button
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={() => router.push(`/${roleSegment}/${routeSegment}`)}
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="px-5 h-16 flex justify-between items-center border-b">
        <p className="text-lg font-semibold">{heading}</p>
      </div>
      <div className="flex flex-col h-full flex-1 overflow-auto">
        <BlogForm initialData={blog} id={id} routeSegment={routeSegment} />
      </div>
    </div>
  );
}
