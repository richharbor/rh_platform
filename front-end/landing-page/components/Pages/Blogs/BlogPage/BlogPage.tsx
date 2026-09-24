'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { getArticle } from "@/services/blogServices"
import { useEffect, useState } from "react"

export interface Article {
  articleId: string
  title: string
  content: string
  status: string
  views: number
  likes: number
  dislikes: number
  updatedAt: string
  createdAt: string
}

export default function ArticlePage({ id }: {id : string}) {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getArticleById(id);
    }, [id]);

    const getArticleById = async (articleId: string) => {
        try {
            const response = await getArticle(articleId);
            setArticle(response);
            console.log(response);
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false);
        }
    }

    if(loading){
        return <div className="mt-30">
            Loading...
        </div>
    }


  if (!article) {
    return (
      <main className="min-h-screen bg-background mt-20">
        <div className="min-w-4xl mx-auto px-4 py-12">
          <Link href="/blogs">
            <Button variant="ghost" className="mb-8">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Article not found</h1>
            <p className="text-muted-foreground">The article you're looking for doesn't exist.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen mt-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/blogs">
          <Button variant="ghost" className="mb-8">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={article.createdAt}>
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>•</span>
              <span>{article.views} views</span>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none">
            <div
              className="text-foreground leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>
      </div>
    </main>
  )
}
