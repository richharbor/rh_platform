'use client'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { fetchKnowledgeBase } from "@/services/blogServices";
import { Button } from "@/components/ui/button";



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

export interface Folder {
  folderId: string
  name: string
  articles: Article[]
}


export default function Blogs() {
    const [loading, setLoading] = useState(true);
    const [blogData, setBlogData] = useState<Folder[]>([]);
    
    useEffect(()=>{
        fetchBlogData();
    },[])

    const fetchBlogData = async () => {
        try {
            const response = await fetchKnowledgeBase("701q3niwlyhwllafxhp49");
            setBlogData(response.folders);
            console.log(response.folders);
        } catch (error) {
            console.log("Error fetching blog data:", error);
        }finally{
            setLoading(false);
        }

    }


    if(loading){
        return (
            <div>
                Loading....
            </div>
        )
    }
    


    const allArticles = blogData.flatMap((folder) => folder.articles)

  return (
    <main className="min-h-screen mt-20 bg-background">
      <div className="max-w-screen mx-auto py-12">
        {/* Header */}
        <section className="border-b border-border mb-5 py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Market Insights & Investment Knowledge
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Learn about unlisted shares, pre-IPOs, and private market opportunities.  
            Stay informed with expert research and Rich Harbor’s latest articles.
          </p>
          <Button asChild size="lg" className="font-medium">
            <Link href="#latest">Explore Articles</Link>
          </Button>
        </div>
      </section>

        {/* Articles by Folder */}
        {blogData.map((folder) => (
          <div key={folder.folderId} className="mb-12 px-20">
            <h2 className="text-2xl font-semibold text-foreground mb-6">{folder.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folder.articles.map((article) => (
                <Link key={article.articleId} href={`/blogs/${article.articleId}`} className="group">
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-border hover:border-primary/50">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription>
                        {new Date(article.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
