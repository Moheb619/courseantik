import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Package,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { dummyProducts } from "../../../data/dummyData";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";
import { useAppDispatch } from "../../../store/hooks";
import { addToCart } from "../../../store/slices/cartSlice";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Find the product by slug
  const product = dummyProducts.find((p) => p.slug === slug);

  useEffect(() => {
    if (!product) {
      navigate("/shop");
      return;
    }

    // Set default selections if available
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product, navigate]);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes) {
      alert("Please select a size");
      return;
    }
    if (!selectedColor && product.colors) {
      alert("Please select a color");
      return;
    }

    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.salePriceCents || product.priceCents,
        image: product.images[0],
        type: "product",
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
      })
    );
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleImageNavigation = (direction) => {
    const newIndex = selectedImageIndex + direction;
    if (newIndex >= 0 && newIndex < product.images.length) {
      setSelectedImageIndex(newIndex);
    }
  };

  const discountPercentage = product.salePriceCents
    ? Math.round(
        ((product.priceCents - product.salePriceCents) / product.priceCents) *
          100
      )
    : 0;

  const currentPrice = product.salePriceCents || product.priceCents;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-neutral-500 mb-8">
          <button
            onClick={() => navigate("/shop")}
            className="hover:text-neutral-700"
          >
            Shop
          </button>
          <span>/</span>
          <span className="text-neutral-900 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden group">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setShowImageModal(true)}
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation(-1)}
                    disabled={selectedImageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation(1)}
                    disabled={selectedImageIndex === product.images.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Zoom Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100">
                <ZoomIn className="w-5 h-5" />
              </div>

              {/* Sale Badge */}
              {product.salePriceCents && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  -{discountPercentage}%
                </div>
              )}

              {/* Stock Status */}
              <div className="absolute bottom-4 left-4">
                {product.stockQuantity > 10 ? (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                ) : product.stockQuantity > 0 ? (
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Only {product.stockQuantity} left
                  </span>
                ) : (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-brand-500"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (product.rating || 4.5)
                          ? "text-yellow-400 fill-current"
                          : "text-neutral-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-neutral-600 ml-2">
                    ({product.reviews || 128} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-neutral-900">
                {formatCurrency(currentPrice)}
              </span>
              {product.salePriceCents && (
                <span className="text-xl text-neutral-500 line-through">
                  {formatCurrency(product.priceCents)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <div className="text-lg text-neutral-600 prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {product.shortDescription || product.description}
              </ReactMarkdown>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {/* Size Selection */}
              {product.sizes && (
                <div>
                  <h3 className="text-sm font-medium text-black mb-2">
                    Size: <span className="text-black">{selectedSize}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 text-black">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                          selectedSize === size
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-neutral-300 hover:border-neutral-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && (
                <div>
                  <h3 className="text-sm font-medium text-black mb-2">
                    Color: <span className="text-black">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? "border-brand-500 scale-110"
                            : "border-neutral-300 hover:border-neutral-400"
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <h3 className="text-sm font-medium text-black mb-2">
                  Quantity
                </h3>
                <div className="flex items-center space-x-3 text-black">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 border border-neutral-300 rounded-lg flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity}
                    className="w-10 h-10 border border-neutral-300 rounded-lg flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {product.stockQuantity} available
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="w-full"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-black" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Free Shipping
                  </p>
                  <p className="text-xs text-neutral-500">
                    On orders over ৳5,000
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-black" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    2 Year Warranty
                  </p>
                  <p className="text-xs text-neutral-500">Full coverage</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-6 h-6 text-black" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    30 Day Returns
                  </p>
                  <p className="text-xs text-neutral-500">No questions asked</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8">
              {[
                { id: "description", label: "Description" },
                { id: "reviews", label: "Reviews" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <div className="text-neutral-600 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {product.description}
                  </ReactMarkdown>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                      Key Features
                    </h3>
                    <ul className="space-y-2">
                      {product.features?.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-neutral-600">{feature}</span>
                        </li>
                      )) ||
                        [
                          "Premium quality materials",
                          "Ergonomic design",
                          "Easy to use",
                          "Durable construction",
                        ].map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-neutral-600">{feature}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                      What's Included
                    </h3>
                    <ul className="space-y-2">
                      {product.includes?.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Package className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                          <span className="text-neutral-600">{item}</span>
                        </li>
                      )) ||
                        [
                          "Main product",
                          "User manual",
                          "Warranty card",
                          "Original packaging",
                        ].map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <Package className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                            <span className="text-neutral-600">{item}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Customer Reviews
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= (product.rating || 4.5)
                              ? "text-yellow-400 fill-current"
                              : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">
                      {product.rating || 4.5} out of 5
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {product.reviewsList?.map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-neutral-200 pb-6"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-brand-700">
                            {review.author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {review.author}
                          </p>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-neutral-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-600">{review.comment}</p>
                      <p className="text-xs text-neutral-500 mt-2">
                        {review.date}
                      </p>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">
                        No reviews yet. Be the first to review this product!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={product.images[selectedImageIndex]}
              alt={product.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
