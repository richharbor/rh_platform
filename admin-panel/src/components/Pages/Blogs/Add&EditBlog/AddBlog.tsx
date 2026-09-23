"use client";
import BlogForm from "./BlogForm";

interface AddBlogProps {
  routeSegment?: string;
  heading?: string;
}

// Ported from product-space-admin's Add&EditBlog/AddBlog.tsx.
const AddBlog = ({
  routeSegment = "blogs",
  heading = "Add Blog",
}: AddBlogProps) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-5 h-16 flex justify-between items-center border-b">
        <p className="text-lg font-semibold">{heading}</p>
      </div>
      <div className="flex flex-col h-full flex-1 overflow-auto">
        <BlogForm routeSegment={routeSegment} />
      </div>
    </div>
  );
};

export default AddBlog;
