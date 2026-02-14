import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { productApi } from "@/services/supabase/productApi";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filtered = products
    .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => categoryFilter === "All" || p.category === categoryFilter);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-black">Merch Store 🛍️</h1>
        <p className="text-muted-foreground">
          Exclusive art supplies & creator merchandise
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-10 rounded-xl border-[2px] border-foreground/10 focus:border-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full font-semibold whitespace-nowrap ${
                categoryFilter === cat
                  ? "cartoon-shadow-sm"
                  : "border-[2px] border-foreground/10"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group bg-white rounded-2xl border-[3px] border-foreground/10 overflow-hidden cartoon-hover"
            >
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center relative">
                <ShoppingBag className="w-12 h-12 text-secondary/20" />
                <span className="absolute top-2 left-2 bg-accent text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-primary">
                    ৳{product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
