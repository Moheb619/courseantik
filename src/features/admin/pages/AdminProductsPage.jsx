import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productApi } from "@/services/supabase/productApi";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productApi.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Products</h1>
          <p className="text-muted-foreground text-sm">
            {products.length} total products
          </p>
        </div>
        <Button className="rounded-xl cartoon-shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Product
        </Button>
      </div>

      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Product</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Category
              </th>
              <th className="text-left p-4 font-semibold">Price</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Stock
              </th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="font-semibold truncate max-w-[200px]">
                      {product.title}
                    </span>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="p-4 font-bold text-primary">
                  ৳{product.price?.toLocaleString()}
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span
                    className={`font-medium ${product.stock < 50 ? "text-destructive" : "text-success"}`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive/60" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
