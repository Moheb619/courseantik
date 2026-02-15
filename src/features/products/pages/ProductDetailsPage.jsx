// ============================================================
// ProductDetailsPage — Product view + variants + dynamic reviews
// ============================================================
import { useParams, Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Minus,
  Plus,
  Star,
  Truck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Trash2,
  Send,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { productApi } from "@/services/supabase/productApi";

// ── Star Rating (interactive) ──────────────────────────────
const StarRating = ({
  value = 0,
  onChange,
  size = "w-5 h-5",
  readOnly = false,
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readOnly && onChange?.(star)}
        className={
          readOnly
            ? "cursor-default"
            : "cursor-pointer hover:scale-110 transition-transform"
        }
        disabled={readOnly}
      >
        <Star
          className={`${size} ${
            star <= value ? "fill-accent text-accent" : "text-foreground/15"
          }`}
        />
      </button>
    ))}
  </div>
);

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // ── Product state ──────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // ── Independent Selection State ────────────────────────────
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // ── Review state ───────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    avg: 0,
    count: 0,
    distribution: [0, 0, 0, 0, 0],
  });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // ── Check if this user already reviewed ────────────────────
  const userReview = reviews.find((r) => r.user_id === user?.id);

  // ── Fetch product + reviews ────────────────────────────────
  const loadReviews = useCallback(async () => {
    try {
      const [revs, stats] = await Promise.all([
        productApi.getProductReviews(id),
        productApi.getProductRatingStats(id),
      ]);
      setReviews(revs);
      setRatingStats(stats);
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.getProductById(id);
        setProduct(data);
        // Initialize selection with first variant
        if (data.variants?.length > 0) {
          const first = data.variants[0];
          if (first.color) setSelectedColor(first.color);
          if (first.size) setSelectedSize(first.size);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    loadReviews();
  }, [id, loadReviews]);

  // ── Loading / Error states ─────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="text-primary mt-4 inline-block">
          ← Back to Merch
        </Link>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────
  const images = product.images?.length > 0 ? product.images : [];
  const hasImages = images.length > 0;
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  // Get all unique colors and sizes available across all variants
  const colors = [
    ...new Set(variants.filter((v) => v.color).map((v) => v.color)),
  ];
  const sizes = [...new Set(variants.filter((v) => v.size).map((v) => v.size))];

  // Find the exact variant matching BOTH selections
  // If only one attribute exists (e.g. only size), match that.
  const selectedVariant = variants.find((v) => {
    const colorMatch = colors.length > 0 ? v.color === selectedColor : true;
    const sizeMatch = sizes.length > 0 ? v.size === selectedSize : true;
    return colorMatch && sizeMatch;
  });

  // Calculate pricing and stock based on selection or fallback to product defaults
  // If specific variant is selected, use its overrides.
  // Otherwise use product base values.
  const currentPrice = selectedVariant?.price_override ?? product.price;
  const currentStock = hasVariants
    ? (selectedVariant?.stock ?? 0) // If variants exist but invalid combo selected -> 0 stock
    : product.stock; // No variants -> product stock

  const isCombinationAvailable = hasVariants ? !!selectedVariant : true;

  // ── Handlers for Independent Selection ──────────────────────
  const selectColor = (color) => {
    setSelectedColor(color);
    setQty(1); // Reset qty when changing options
  };

  const selectSize = (size) => {
    setSelectedSize(size);
    setQty(1); // Reset qty when changing options
  };

  // ── Add to cart (variant-aware) ────────────────────────────
  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) return;
    addToCart(product, selectedVariant, qty);
    setQty(1);
  };

  // ── Submit review ──────────────────────────────────────────
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (reviewForm.rating < 1) {
      setReviewError("Please select a star rating.");
      return;
    }

    setReviewLoading(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      await productApi.submitReview(
        id,
        { rating: reviewForm.rating, comment: reviewForm.comment },
        reviewImages,
      );
      setReviewForm({ rating: 5, comment: "" });
      setReviewImages([]);
      setReviewSuccess(true);
      await loadReviews();
    } catch (err) {
      console.error("Review submit error:", err);
      if (err.message?.includes("duplicate") || err.code === "23505") {
        setReviewError("You have already reviewed this product.");
      } else {
        setReviewError(err.message || "Failed to submit review.");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  // ── Delete review ──────────────────────────────────────────
  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    try {
      await productApi.deleteReview(id, reviewId);
      await loadReviews();
    } catch (err) {
      console.error("Delete review error:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Merch
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* ── Image gallery ─────────────────────────────────── */}
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl border-[3px] border-foreground/10 cartoon-shadow flex items-center justify-center overflow-hidden relative">
            {hasImages ? (
              <>
                <img
                  src={images[selectedImageIdx]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImageIdx((p) =>
                          p === 0 ? images.length - 1 : p - 1,
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIdx((p) =>
                          p === images.length - 1 ? 0 : p + 1,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <ShoppingBag className="w-24 h-24 text-secondary/20" />
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((url, idx) => (
                <button
                  key={url}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    idx === selectedImageIdx
                      ? "border-primary"
                      : "border-transparent hover:border-foreground/20"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ───────────────────────────────────────── */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
              {product.category?.name || "General"}
            </span>
            <h1 className="text-3xl font-black mt-3">{product.title}</h1>
            {/* Dynamic rating */}
            <div className="flex items-center gap-2 mt-2">
              <StarRating
                value={Math.round(ratingStats.avg)}
                readOnly
                size="w-4 h-4"
              />
              <span className="text-sm text-muted-foreground">
                {ratingStats.count > 0
                  ? `${ratingStats.avg} (${ratingStats.count} review${ratingStats.count !== 1 ? "s" : ""})`
                  : "No reviews yet"}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="text-4xl font-black text-primary">
            ৳{currentPrice.toLocaleString()}
            {/* Show strikethrough only if variant overrides price */}
            {selectedVariant?.price_override && (
              <span className="text-lg text-muted-foreground line-through ml-2 font-normal">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* ── Color selector ──────────────────────────── */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-semibold">Color:</span>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => selectColor(color)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      selectedColor === color
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-foreground/10 hover:border-primary/50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Size selector ───────────────────────────── */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-semibold">Size:</span>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => selectSize(size)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      selectedSize === size
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-foreground/10 hover:border-primary/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Availability Message ────────────────────── */}
          {!isCombinationAvailable && hasVariants && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg">
              This combination is currently unavailable. Please choose another
              option.
            </div>
          )}

          {/* ── Quantity ─────────────────────────────────── */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">Quantity:</span>
            <div className="flex items-center border-[2px] border-foreground/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={!isCombinationAvailable || currentStock === 0}
                className="p-2 hover:bg-muted transition-colors disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-bold text-sm">{qty}</span>
              <button
                onClick={() => setQty(Math.min(currentStock, qty + 1))}
                disabled={!isCombinationAvailable || qty >= currentStock}
                className="p-2 hover:bg-muted transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentStock > 0 ? `${currentStock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* ── Add to Cart ──────────────────────────────── */}
          <Button
            onClick={handleAddToCart}
            size="lg"
            disabled={!isCombinationAvailable || currentStock === 0}
            className="w-full rounded-xl font-bold text-lg py-6 cartoon-shadow-sm"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {currentStock > 0
              ? isCombinationAvailable
                ? `Add to Cart — ৳${(currentPrice * qty).toLocaleString()}`
                : "Unavailable"
              : "Out of Stock"}
          </Button>

          {/* ── Delivery ─────────────────────────────────── */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Truck className="w-4 h-4 text-primary" />
              Delivery Information
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Inside Dhaka</span>
              <span className="font-semibold text-foreground">৳60</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Outside Dhaka</span>
              <span className="font-semibold text-foreground">৳120</span>
            </div>
            <p className="text-xs text-destructive font-medium pt-1">
              ⚠️ No Cash on Delivery. Full payment required.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          REVIEWS SECTION
          ══════════════════════════════════════════════════════ */}
      <div className="mt-16">
        <h2 className="text-2xl font-black mb-6">
          Customer Reviews
          {ratingStats.count > 0 && (
            <span className="text-base font-normal text-muted-foreground ml-2">
              ({ratingStats.count})
            </span>
          )}
        </h2>

        {/* ── Rating summary bar ────────────────────────── */}
        {ratingStats.count > 0 && (
          <div className="flex items-start gap-8 mb-8 p-6 bg-muted/30 rounded-2xl border border-foreground/5">
            <div className="text-center">
              <div className="text-5xl font-black text-primary">
                {ratingStats.avg}
              </div>
              <StarRating
                value={Math.round(ratingStats.avg)}
                readOnly
                size="w-4 h-4"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {ratingStats.count} reviews
              </p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.distribution[star - 1];
                const pct =
                  ratingStats.count > 0 ? (count / ratingStats.count) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-right font-medium">{star}</span>
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <div className="flex-1 h-2.5 bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Write a review (logged-in, haven't reviewed yet) ── */}
        {user && !userReview && (
          <form
            onSubmit={handleSubmitReview}
            className="mb-10 p-6 rounded-2xl border-[3px] border-foreground/10 bg-white cartoon-shadow-sm space-y-4"
          >
            <h3 className="font-bold text-lg">Write a Review</h3>

            {/* Star picker */}
            <div className="space-y-1">
              <label className="text-sm font-semibold">Your Rating</label>
              <StarRating
                value={reviewForm.rating}
                onChange={(r) => setReviewForm((p) => ({ ...p, rating: r }))}
                size="w-7 h-7"
              />
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="text-sm font-semibold">Your Review</label>
              <textarea
                className="w-full rounded-xl border-[2px] border-foreground/10 p-3 text-sm focus:border-primary focus:outline-none resize-none"
                rows={4}
                placeholder="Share your experience with this product..."
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((p) => ({ ...p, comment: e.target.value }))
                }
              />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Attach Images (optional)
              </label>
              <div className="flex gap-2 flex-wrap">
                {reviewImages.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setReviewImages((p) => p.filter((_, i) => i !== idx))
                      }
                      className="absolute top-0 right-0 bg-destructive text-white rounded-bl p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {reviewImages.length < 3 && (
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-foreground/15 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setReviewImages((p) => [...p, e.target.files[0]]);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {reviewError && (
              <p className="text-sm text-destructive font-medium">
                {reviewError}
              </p>
            )}
            {reviewSuccess && (
              <p className="text-sm text-green-600 font-medium">
                Review submitted! ✨
              </p>
            )}

            <Button
              type="submit"
              disabled={reviewLoading}
              className="rounded-xl font-semibold cartoon-shadow-sm"
            >
              {reviewLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit Review
            </Button>
          </form>
        )}

        {/* Not logged in prompt */}
        {!user && (
          <div className="mb-8 p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>{" "}
              to leave a review.
            </p>
          </div>
        )}

        {/* ── Review list ──────────────────────────────── */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-3 text-foreground/10" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-5 rounded-2xl border border-foreground/5 bg-white space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {review.reviewer?.avatar_url ? (
                      <img
                        src={review.reviewer.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {(review.reviewer?.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">
                        {review.reviewer?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating
                      value={review.rating}
                      readOnly
                      size="w-3.5 h-3.5"
                    />
                    {/* Delete button — show for author or admin */}
                    {review.user_id === user?.id && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {/* Review images */}
                {review.images?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {review.images.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-20 h-20 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={url}
                          alt={`Review image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
