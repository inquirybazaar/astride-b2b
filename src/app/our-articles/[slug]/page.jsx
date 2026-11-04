import Article from './Article'
import { connectDB } from "@/libs/db";
import Blog from "@/models/Blog";

export async function generateMetadata({ params }) {
    const { slug } = await params;

    try {
        await connectDB();
        const blog = await Blog.findOne({
            slug,
            publishDate: { $lte: new Date() },
        }).select("title metaTitle metaDescription image").lean();

        if (!blog) return {};

        const description = blog.metaDescription || "";

        return {
            title: blog.metaTitle || blog.title,
            description,
            openGraph: {
                title: blog.metaTitle || blog.title,
                description,
                images: blog.image ? [{ url: blog.image }] : [],
            },
        };
    } catch (error) {
        console.error("ARTICLE METADATA ERROR:", error);
        return {};
    }
}

export default function Page() {
    return (
        <Article />
    )
}
