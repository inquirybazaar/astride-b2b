"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? ""
        : new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
}

export default function Article() {
    const params = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadArticle() {
            try {
                const response = await fetch(
                    `/api/blogs/${encodeURIComponent(params.slug)}`
                );
                const data = await response.json();

                if (!response.ok || !data.blog) {
                    throw new Error(data.message || "Article not found");
                }

                if (active) setBlog(data.blog);
                document.title =
                    data.blog.metaTitle || data.blog.title || "Astride Article";

                let descriptionMeta = document.querySelector(
                    'meta[name="description"]'
                );

                if (!descriptionMeta) {
                    descriptionMeta = document.createElement("meta");
                    descriptionMeta.setAttribute("name", "description");
                    document.head.appendChild(descriptionMeta);
                }

                descriptionMeta.setAttribute(
                    "content",
                    data.blog.metaDescription || ""
                );
            } catch (loadError) {
                if (active) setError(loadError.message || "Unable to load article");
            } finally {
                if (active) setLoading(false);
            }
        }

        if (params.slug) loadArticle();

        return () => {
            active = false;
        };
    }, [params.slug]);

    return (
        <main className="min-h-screen bg-[#fbfaf8] pb-10 pt-24 text-[#171717] sm:pt-28 lg:pt-32">
            <div className="mx-auto max-w-5xl px-5 sm:px-8">
                <Link
                    href="/our-articles"
                    className="mb-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-black/55 transition hover:text-black"
                >
                    <ArrowLeft size={15} aria-hidden="true" />
                    All articles
                </Link>

                {loading && (
                    <div className="animate-pulse">
                        <div className="h-3 w-28 rounded bg-black/[0.07]" />
                        <div className="mt-7 h-14 rounded bg-black/[0.07]" />
                        <div className="mt-9 aspect-[16/9] rounded-[20px] bg-black/[0.07]" />
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-[20px] border border-black/[0.08] bg-white px-6 py-12 text-center">
                        <h1 className="text-3xl font-medium tracking-[-0.04em]">Article unavailable</h1>
                        <p className="mt-3 text-sm text-black/55">{error}</p>
                    </div>
                )}

                {!loading && blog && (
                    <article>
                        <header>
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/45">
                                {formatDate(blog.publishDate)}
                            </p>
                            <h1 className="mt-2 max-w-4xl text-4xl font-medium leading-[1.08] tracking-[-0.055em] sm:text-5xl lg:text-7xl">
                                {blog.title}
                            </h1>
                            {(blog.metaTitle || blog.metaDescription) && (
                                <div className="mt-6 border-l-2 border-black/15 pl-4">
                                    {blog.metaTitle && blog.metaTitle !== blog.title && (
                                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/45">
                                            {blog.metaTitle}
                                        </p>
                                    )}
                                    {blog.metaDescription && (
                                        <p className="mt-2 max-w-2xl text-base leading-7 text-black/60">
                                            {blog.metaDescription}
                                        </p>
                                    )}
                                </div>
                            )}
                        </header>

                        {blog.image && (
                            <figure className="mt-8 overflow-hidden rounded-[20px] bg-[#efede8]">
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="aspect-[16/9] h-full w-full object-contain"
                                />
                            </figure>
                        )}

                        <div
                            className="blog-content mt-10"
                            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
                        />
                    </article>
                )}
            </div>
        </main>
    );
}
