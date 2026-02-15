// ============================================================
// ProductEditorPage — Create / Edit product with variants & images
// ============================================================
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "@/services/supabase/productApi";
import { categoryApi } from "@/services/supabase/categoryApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Save,
  ArrowLeft,
  Upload,
  X,
  ImagePlus,
  Package,
  Plus,
  Trash2,
  Palette,
  Ruler,
} from "lucide-react";

// ── Component ─────────────────────────────────────────────────
const ProductEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  // ── State ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category_id: "",
    stock: 0,
    featured: false,
    active: true,
  });

  // Images stored as array of URLs
  const [images, setImages] = useState([]);
  // Variants array
  const [variants, setVariants] = useState([]);
  // Product ID (needed for image upload before first save)
  const [productId, setProductId] = useState(id || null);

  // ── Load categories + existing product ────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        // Always load categories
        const cats = await categoryApi.getCategories();
        setCategories(cats);

        if (isEditing) {
          const data = await productApi.getProductById(id);
          setFormData({
            title: data.title || "",
            description: data.description || "",
            price: data.price || 0,
            category_id: data.category_id || cats[0]?.id || "",
            stock: data.stock || 0,
            featured: data.featured || false,
            active: data.active ?? true,
          });
          setImages(data.images || []);
          setVariants(data.variants || []);
        } else {
          // Default to first category
          setFormData((prev) => ({
            ...prev,
            category_id: cats[0]?.id || "",
          }));
        }
      } catch (err) {
        console.error("[ProductEditor] Load error:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEditing]);

  // ── Form helpers ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  // ── Image upload ──────────────────────────────────────────
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setError(null);

    try {
      let pid = productId;
      // Need a product ID to upload to — create product first if new
      if (!pid) {
        const created = await productApi.createProduct({
          ...formData,
          images: [],
          thumbnail: null,
        });
        pid = created.id;
        setProductId(pid);
        navigate(`/admin/products/${pid}/edit`, { replace: true });
      }

      const newUrls = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const url = await productApi.uploadProductImage(pid, file, "gallery");
        newUrls.push(url);
      }

      const updatedImages = [...images, ...newUrls];
      setImages(updatedImages);

      // Persist — first image = thumbnail
      await productApi.updateProduct(pid, {
        images: updatedImages,
        thumbnail: updatedImages[0] || null,
      });
    } catch (err) {
      console.error("[ProductEditor] Upload error:", err);
      setError("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async (urlToRemove) => {
    try {
      await productApi.deleteProductImage(urlToRemove);
      const updated = images.filter((u) => u !== urlToRemove);
      setImages(updated);

      if (productId) {
        await productApi.updateProduct(productId, {
          images: updated,
          thumbnail: updated[0] || null,
        });
      }
    } catch (err) {
      console.error("[ProductEditor] Delete image error:", err);
      setError("Failed to remove image.");
    }
  };

  // ── Drag & Drop ───────────────────────────────────────────
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  // ── Variant management ────────────────────────────────────
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        _temp: Date.now(),
        color: "",
        size: "",
        stock: 0,
        price_override: null,
      },
    ]);
  };

  const updateVariantField = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const removeVariant = async (index) => {
    const variant = variants[index];
    // If it has an ID it exists in DB — delete it
    if (variant.id && productId) {
      try {
        await productApi.deleteVariant(productId, variant.id);
      } catch (err) {
        console.error("[ProductEditor] Delete variant error:", err);
        setError("Failed to delete variant.");
        return;
      }
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("Product title is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images,
        thumbnail: images[0] || null,
      };

      let pid = productId;

      if (isEditing || pid) {
        await productApi.updateProduct(pid, payload);
      } else {
        const created = await productApi.createProduct(payload);
        pid = created.id;
        setProductId(pid);
      }

      // Save variants
      for (const v of variants) {
        const variantPayload = {
          product_id: pid,
          color: v.color || null,
          size: v.size || null,
          stock: Number(v.stock) || 0,
          price_override: v.price_override ? Number(v.price_override) : null,
        };

        if (v.id) {
          // Update existing
          await productApi.updateVariant(v.id, variantPayload);
        } else {
          // Create new
          await productApi.createVariant(variantPayload);
        }
      }

      navigate("/admin/products");
    } catch (err) {
      console.error("[ProductEditor] Save error:", err);
      setError("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/products")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Product" : "Create New Product"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update product details, images and variants."
              : "Fill in the details for your new product."}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>

      {/* ── Error banner ──────────────────────────────────── */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Left: Product Info ───────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
              <Package className="w-4 h-4" /> Product Info
            </h2>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Drawing Pencil Set"
              />
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price">Price (BDT)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            {/* Category — from DB */}
            <div className="grid gap-2">
              <Label htmlFor="category_id">Category</Label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock (base) */}
            <div className="grid gap-2">
              <Label htmlFor="stock">
                Base Stock {variants.length > 0 && "(ignored — using variants)"}
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                disabled={variants.length > 0}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe the product..."
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Active (visible to customers)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured Product
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Images + Variants ─────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Images ─────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="font-semibold text-lg border-b pb-2 mb-6 flex items-center gap-2">
              <ImagePlus className="w-4 h-4" /> Product Images
            </h2>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {uploadingImage ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Uploading…
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-sm">
                    Drag & drop images here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse • PNG, JPG, WEBP
                  </p>
                </div>
              )}
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((url, idx) => (
                  <div
                    key={url}
                    className="relative group rounded-xl overflow-hidden border-2 border-foreground/5 aspect-square bg-muted"
                  >
                    <img
                      src={url}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        THUMBNAIL
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(url);
                      }}
                      className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                No images yet. First uploaded image becomes the thumbnail.
              </p>
            )}
          </div>

          {/* ── Variants ───────────────────────────────────── */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Palette className="w-4 h-4" /> Variants
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (optional)
                </span>
              </h2>
              <Button size="sm" variant="outline" onClick={addVariant}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Variant
              </Button>
            </div>

            {variants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No variants. Product uses base stock. Add variants for
                color/size options.
              </p>
            ) : (
              <div className="space-y-4">
                {variants.map((v, idx) => (
                  <div
                    key={v.id || v._temp}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end p-4 bg-muted/30 rounded-xl border"
                  >
                    {/* Color */}
                    <div className="grid gap-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Color
                      </Label>
                      <Input
                        value={v.color || ""}
                        onChange={(e) =>
                          updateVariantField(idx, "color", e.target.value)
                        }
                        placeholder="e.g. Red"
                        className="h-9"
                      />
                    </div>

                    {/* Size */}
                    <div className="grid gap-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Ruler className="w-3 h-3" /> Size
                      </Label>
                      <Input
                        value={v.size || ""}
                        onChange={(e) =>
                          updateVariantField(idx, "size", e.target.value)
                        }
                        placeholder="e.g. M"
                        className="h-9"
                      />
                    </div>

                    {/* Stock */}
                    <div className="grid gap-1">
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={v.stock || 0}
                        onChange={(e) =>
                          updateVariantField(
                            idx,
                            "stock",
                            Number(e.target.value),
                          )
                        }
                        className="h-9"
                      />
                    </div>

                    {/* Price Override */}
                    <div className="grid gap-1">
                      <Label className="text-xs">Price Override</Label>
                      <Input
                        type="number"
                        min="0"
                        value={v.price_override || ""}
                        onChange={(e) =>
                          updateVariantField(
                            idx,
                            "price_override",
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        placeholder="Base price"
                        className="h-9"
                      />
                    </div>

                    {/* Remove */}
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive/60 hover:text-destructive"
                        onClick={() => removeVariant(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditorPage;
