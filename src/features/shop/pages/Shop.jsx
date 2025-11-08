import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Star,
  Tag,
  Heart,
  Eye,
  Grid3X3,
  List,
  Zap,
  Award,
  Loader,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";
import { useAppDispatch } from "../../../store/hooks";
import { addToCart } from "../../../store/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";
import productService from "../../../services/productService";

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("featured");
  const dispatch = useAppDispatch();

  // Fetch products from database
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: [
      "products",
      { search: searchTerm, category: selectedCategory, sortBy },
    ],
    queryFn: () =>
      productService.getProducts({
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sortBy: sortBy,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories from database
  const { data: categoriesResponse } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => productService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const sortedProducts = productsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price_cents,
        image:
          product.image_url ||
          (product.images && product.images[0]) ||
          "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
        type: "product",
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Shop Premium Products
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Discover high-quality products designed to enhance your learning and
            development journey
          </p>
        </div>
        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 mb-8 text-black">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Right Side - View Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-brand-600"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-brand-600"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-neutral-600">
                {sortedProducts.length} products found
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-neutral-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-neutral-600">
              Error loading products. Please try again.
            </p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600">
              No products found matching your criteria.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={
                      product.image_url ||
                      product.images?.[0] ||
                      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop"
                    }
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.salePriceCents && (
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -
                        {Math.round(
                          (1 - product.salePriceCents / product.priceCents) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-neutral-600" />
                    </button>
                    <Link to={`/product/${product.slug}`}>
                      <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                        <Eye className="w-5 h-5 text-neutral-600" />
                      </button>
                    </Link>
                  </div>

                  {/* Stock Status */}
                  <div className="absolute bottom-4 left-4">
                    {product.stockQuantity > 0 ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-brand-500" />
                    <span className="text-sm text-brand-600 font-medium">
                      {product.category.name}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {product.title}
                  </h3>

                  {/* Description */}
                  <div className="text-neutral-600 mb-3 text-sm line-clamp-2 prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {product.shortDescription}
                    </ReactMarkdown>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {product.salePriceCents ? (
                        <>
                          <span className="text-2xl font-bold text-neutral-900">
                            {formatCurrency(product.salePriceCents / 100)}
                          </span>
                          <span className="text-lg text-neutral-500 line-through">
                            {formatCurrency(product.priceCents / 100)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-neutral-900">
                          {formatCurrency(product.priceCents / 100)}
                        </span>
                      )}
                    </div>
                    {product.stockQuantity > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        {product.stockQuantity} left
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link to={`/product/${product.slug}`} className="flex-1">
                      <Button
                        variant="outline"
                        fullWidth
                        className="group-hover:border-brand-500 group-hover:text-brand-600"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity === 0}
                      className="px-6 group-hover:bg-brand-600 group-hover:scale-105 transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-80 relative">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                    {product.salePriceCents && (
                      <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Sale
                      </span>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-brand-500" />
                          <span className="text-sm text-brand-600 font-medium">
                            {product.category.name}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                          {product.title}
                        </h3>

                        <div className="text-neutral-600 mb-4 prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {product.shortDescription}
                          </ReactMarkdown>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-neutral-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-neutral-600">
                            {product.rating} ({product.reviews} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {product.salePriceCents ? (
                            <>
                              <span className="text-3xl font-bold text-neutral-900">
                                {formatCurrency(product.salePriceCents / 100)}
                              </span>
                              <span className="text-xl text-neutral-500 line-through">
                                {formatCurrency(product.priceCents / 100)}
                              </span>
                            </>
                          ) : (
                            <span className="text-3xl font-bold text-neutral-900">
                              {formatCurrency(product.priceCents / 100)}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Link to={`/product/${product.slug}`}>
                            <Button variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="primary"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stockQuantity === 0}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-16 h-16 text-neutral-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              No products found
            </h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              We couldn't find any products matching your criteria. Try
              adjusting your filters or search terms.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSortBy("featured");
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
