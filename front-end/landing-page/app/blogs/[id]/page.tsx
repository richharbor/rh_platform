import BlogPage from "@/components/Pages/Blogs/BlogPage/BlogPage"
import { Metadata } from "next";

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params
  return {
    alternates: {
      canonical: `/blogs/${id}`,
    },
  };
}

export default function page({ params }: PageProps) {
  const { id } = params

  return <BlogPage id={id} />
}
