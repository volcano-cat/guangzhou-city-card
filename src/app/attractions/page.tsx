"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

interface Attraction {
  id: number;
  name: string;
  description: string;
  address: string;
  images: string[] | null;
  rating: number | null;
  viewCount: number;
  category: {
    id: number;
    name: string;
  };
  _count: {
    favorites: number;
    comments: number;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios.get("/api/categories?type=ATTRACTION").then((res) => {
      if (res.data.success) {
        setCategories(res.data.data);
      }
    });
  }, []);

  useEffect(() => {
    fetchAttractions();
  }, [page, selectedCategory]);

  const fetchAttractions = (searchKeyword = keyword) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: "12",
    });

    if (selectedCategory) {
      params.append("categoryId", selectedCategory.toString());
    }
    if (searchKeyword) {
      params.append("keyword", searchKeyword);
    }

    axios
      .get("/api/attractions?" + params.toString())
      .then((res) => {
        if (res.data.success) {
          setAttractions(res.data.data.list);
          setTotalPages(res.data.data.pagination.totalPages);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    setPage(1);
    // 直接传递 keyword 到 fetchAttractions 函数，确保使用最新的值
    fetchAttractions(keyword);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">广州景点</h1>
        <p className="text-gray-600 mt-2">
          探索广州的名胜古迹、自然风光和现代地标
        </p>
      </div>

      <div className="mb-8">
        <div className="flex-1 min-w-[200px] max-w-md flex gap-2 mb-4">
          <input
            type="text"
            placeholder="搜索景点..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="input flex-1"
          />
          <button onClick={handleSearch} className="btn-primary">
            搜索
          </button>
          <button 
            onClick={() => {
              // 重置状态
              setKeyword("");
              setPage(1);
              // 直接传递空字符串作为搜索关键词
              fetchAttractions("");
            }} 
            className="btn-secondary"
          >
            重置
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setPage(1);
            }}
            className={
              "px-4 py-2 rounded-full text-sm font-medium transition-colors " +
              (selectedCategory === null
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200")
            }
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setPage(1);
              }}
              className={
                "px-4 py-2 rounded-full text-sm font-medium transition-colors " +
                (selectedCategory === category.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200")
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : attractions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">暂无景点数据</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
            {attractions.map((attraction) => (
              <Link
                key={attraction.id}
                href={"/attractions/" + attraction.id}
                className="card group"
              >
                <div className="relative h-48 bg-gray-200">
                  {attraction.images && attraction.images.length > 0 ? (
                    <img
                      src={`/images/attractions/${attraction.images[0]}`} 
                      alt={attraction.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-sm">
                    {attraction.category.name}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 line-clamp-1">
                    {attraction.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {attraction.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {attraction.rating || "暂无"}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {attraction.viewCount}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        {attraction._count.favorites}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  下一页
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
