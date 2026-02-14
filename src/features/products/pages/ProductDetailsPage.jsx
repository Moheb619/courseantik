import { useParams, Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Minus,
  Plus,
  Star,
  Truck,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { productApi } from "@/services/supabase/productApi";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
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
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl border-[3px] border-foreground/10 cartoon-shadow flex items-center justify-center">
          <ShoppingBag className="w-24 h-24 text-secondary/20" />
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-3xl font-black mt-3">{product.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <Star className="w-4 h-4 fill-accent text-accent" />
              <Star className="w-4 h-4 fill-accent text-accent" />
              <Star className="w-4 h-4 fill-accent text-accent" />
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">
                (24 reviews)
              </span>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="text-4xl font-black text-primary">
            ৳{product.price.toLocaleString()}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">Quantity:</span>
            <div className="flex items-center border-[2px] border-foreground/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-2 hover:bg-muted transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-bold text-sm">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="p-2 hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {product.stock} in stock
            </span>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full rounded-xl font-bold text-lg py-6 cartoon-shadow-sm"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Add to Cart — ৳{(product.price * qty).toLocaleString()}
          </Button>

          {/* Delivery Info */}
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
    </div>
  );
};

export default ProductDetailsPage;
