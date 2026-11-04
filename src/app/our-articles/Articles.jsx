"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? ""
        : new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
}

export default function Articles() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadBlogs() {
            try {
                const firstResponse = await fetch("/api/blogs?limit=24&page=1");

                if (!firstResponse.ok) {
                    throw new Error("Unable to load articles");
                }

                const firstData = await firstResponse.json();
                const allBlogs = [...(firstData.blogs || [])];
                const totalPages = firstData.pagination?.totalPages || 1;

                for (let page = 2; page <= totalPages; page += 1) {
                    const response = await fetch(`/api/blogs?limit=24&page=${page}`);

                    if (!response.ok) {
                        throw new Error("Unable to load articles");
                    }

                    const data = await response.json();
                    allBlogs.push(...(data.blogs || []));
                }

                if (active) setBlogs(allBlogs);
            } catch (loadError) {
                if (active) setError(loadError.message || "Unable to load articles");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadBlogs();

        return () => {
            active = false;
        };
    }, []);

    return (
        <main className="min-h-screen bg-[#fbfaf8] pt-24 text-[#171717] sm:pt-28 lg:pt-32">
            <header className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-black/55">
                    ASTRIDE / JOURNAL
                </p>
                <div className="flex flex-col gap-5 border-b border-black/10 pb-10 sm:flex-row sm:items-end sm:justify-between lg:pb-14">
                    <h1 className="max-w-3xl text-4xl font-medium tracking-[-0.06em] sm:text-5xl lg:text-7xl">
                        Our articles
                    </h1>
                    <p className="max-w-md text-sm leading-7 text-black/60">
                        Ideas, guidance, and perspectives for better workplaces and everyday seating.
                    </p>
                </div>
            </header>

            <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
                {loading && (
                    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="animate-pulse">
                                <div className="aspect-[4/3] rounded-[18px] bg-black/[0.07]" />
                                <div className="mt-5 h-3 w-24 rounded bg-black/[0.07]" />
                                <div className="mt-4 h-7 rounded bg-black/[0.07]" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="rounded-2xl border border-black/[0.08] bg-white px-5 py-8 text-sm text-black/60">
                        {error}
                    </p>
                )}

                {!loading && !error && blogs.length === 0 && (
                    <p className="rounded-2xl border border-black/[0.08] bg-white px-5 py-8 text-sm text-black/60">
                        No articles have been published yet.
                    </p>
                )}

                {!loading && !error && blogs.length > 0 && (
                    <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                        {blogs.map((blog) => (
                            <article key={blog._id || blog.slug} className="group min-w-0 overflow-hidden rounded-[18px] border border-black/[0.08] bg-white transition hover:shadow-lg">
                                <Link
                                    href={`/our-articles/${blog.slug}`}
                                    className="block"
                                    aria-label={`Read ${blog.title}`}
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-[#efede8]">
                                        {blog.image ? (
                                            <img
                                                src={blog.image}
                                                alt={blog.title}
                                                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-black/30">
                                                ASTRIDE Journal
                                            </div>
                                        )}
                                    </div>

                                    <div className="py-2 px-4">
                                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-black/45">
                                            {formatDate(blog.publishDate)}
                                        </p>
                                        <div className="mt-2 flex items-start justify-between gap-4">
                                            <h2 className="text-xl font-medium leading-snug tracking-[-0.03em] sm:text-2xl">
                                                {blog.title}
                                            </h2>
                                            <span className="mt-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 transition group-hover:border-black group-hover:bg-black group-hover:text-white">
                                                <ArrowUpRight size={16} aria-hidden="true" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
