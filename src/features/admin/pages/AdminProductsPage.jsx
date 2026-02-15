// ============================================================
// AdminProductsPage — Product list + inline category management
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ShoppingBag,
  Loader2,
  Eye,
  EyeOff,
  Star,
  Package,
  Search,
  RefreshCcw,
  Tag,
  X,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productApi } from "@/services/supabase/productApi";
import { categoryApi } from "@/services/supabase/categoryApi";

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [togglingId, setTogglingId] = useState(null);

  // Category management modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState(null);

  // ── Fetch products + categories ────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([
        productApi.getAllProducts(),
        categoryApi.getCategories(),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch (err) {
      console.error("[AdminProducts] Fetch error:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Toggle active ──────────────────────────────────────────
  const handleToggleActive = async (product) => {
    setTogglingId(product.id);
    try {
      const updated = await productApi.updateProduct(product.id, {
        active: !product.active,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, ...updated } : p)),
      );
    } catch (err) {
      console.error("[AdminProducts] Toggle error:", err);
      alert("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Hard delete product ────────────────────────────────────
  const handleDelete = async (product) => {
    const ok = window.confirm(
      `Permanently delete "${product.title}"?\n\nThis removes the product, all variants, and all images.`,
    );
    if (!ok) return;
    try {
      await productApi.hardDeleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      console.error("[AdminProducts] Delete error:", err);
      alert("Failed to delete product.");
    }
  };

  // ── Category CRUD ──────────────────────────────────────────
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatSaving(true);
    setCatError(null);
    try {
      const created = await categoryApi.createCategory({
        name: newCatName.trim(),
      });
      setCategories((prev) => [...prev, created]);
      setNewCatName("");
    } catch (err) {
      setCatError(err.message || "Failed to create category.");
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const ok = window.confirm(
      `Delete category "${cat.name}"?\n\nProducts using this category will become uncategorized.`,
    );
    if (!ok) return;
    try {
      await categoryApi.deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      alert(err.message || "Failed to delete category.");
    }
  };

  // ── Filter ─────────────────────────────────────────────────
  const filtered = products
    .filter(
      (p) =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      (p) => categoryFilter === "all" || p.category_id === categoryFilter,
    );

  // ── Loading / Error ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive font-semibold">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCcw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Package className="w-6 h-6" /> Products
          </h1>
          <p className="text-muted-foreground text-sm">
            {products.length} total • {products.filter((p) => p.active).length}{" "}
            active
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCatModal(true)}
          >
            <Tag className="w-4 h-4 mr-1" /> Categories
          </Button>
          <Button
            className="rounded-xl cartoon-shadow-sm"
            onClick={() => navigate("/admin/products/new")}
          >
            <Plus className="w-4 h-4 mr-2" /> New Product
          </Button>
        </div>
      </div>

      {/* ── Category filter pills ──────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            categoryFilter === "all"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === cat.id
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
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
              <th className="text-left p-4 font-semibold hidden sm:table-cell">
                Status
              </th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  {search ? "No products match." : "No products yet."}
                </td>
              </tr>
            )}
            {filtered.map((product) => {
              const variantCount = product.variants?.length || 0;
              const totalStock =
                variantCount > 0
                  ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                  : product.stock;

              return (
                <tr
                  key={product.id}
                  className={`border-t hover:bg-muted/20 transition-colors ${!product.active ? "opacity-60" : ""}`}
                >
                  {/* Product: thumbnail + title */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-secondary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold truncate block max-w-[200px]">
                          {product.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{" "}
                              Featured
                            </span>
                          )}
                          {variantCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                              <Palette className="w-3 h-3" /> {variantCount}{" "}
                              variant{variantCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
                      {product.category?.name || "—"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-bold text-primary">
                    ৳{product.price?.toLocaleString()}
                  </td>

                  {/* Stock */}
                  <td className="p-4 hidden md:table-cell">
                    <span
                      className={`font-medium ${totalStock < 10 ? "text-destructive" : totalStock < 50 ? "text-amber-600" : "text-emerald-600"}`}
                    >
                      {totalStock}
                    </span>
                  </td>

                  {/* Active toggle */}
                  <td className="p-4 hidden sm:table-cell">
                    <button
                      onClick={() => handleToggleActive(product)}
                      disabled={togglingId === product.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        product.active
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {togglingId === product.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : product.active ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {product.active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          navigate(`/admin/products/${product.id}/edit`)
                        }
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-destructive/60" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Category Management Modal ──────────────────────── */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Tag className="w-5 h-5" /> Manage Categories
              </h2>
              <button
                onClick={() => setShowCatModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Add new */}
              <div className="flex gap-2">
                <Input
                  placeholder="New category name…"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button
                  onClick={handleAddCategory}
                  disabled={catSaving}
                  size="sm"
                >
                  {catSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {catError && (
                <p className="text-destructive text-sm">{catError}</p>
              )}

              {/* List */}
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                  >
                    <span className="font-medium text-sm">{cat.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4 text-destructive/60" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
