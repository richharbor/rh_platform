"use client";
import { useParams } from "next/navigation";
import BlogV2Editor from "@/components/Pages/Blogs/v2/BlogV2Editor";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <BlogV2Editor blogId={id} routeSegment="blogs" />;
}
