import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Star,
  Eye as EyeIcon,
  ShoppingCart,
  Calendar,
  Tag,
} from "lucide-react";
import {
  productAdminService,
  categoryAdminService,
} from "../../services/adminService";
import Button from "../ui/Button";
import { toast } from "react-hot-toast";

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category_id: "",
    is_active: "",
    is_featured: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products", searchTerm, filters],
    queryFn: () =>
      productAdminService.getProducts({
        search: searchTerm,
        ...filters,
        limit: 20,
      }),
  });

  // Fetch product categories
  const { data: categories } = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: categoryAdminService.getCategories,
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: productAdminService.deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries(["admin-products"]);
    },
    onError: (error) => {
      toast.error("Failed to delete product: " + error.message);
    },
  });

  // Update product status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) =>
      productAdminService.updateProduct(id, { is_active }),
    onSuccess: () => {
      toast.success("Product status updated");
      queryClient.invalidateQueries(["admin-products"]);
    },
    onError: (error) => {
      toast.error("Failed to update product: " + error.message);
    },
  });

  // Update featured status mutation
  const updateFeaturedMutation = useMutation({
    mutationFn: ({ id, is_featured }) =>
      productAdminService.updateProduct(id, { is_featured }),
    onSuccess: () => {
      toast.success("Product featured status updated");
      queryClient.invalidateQueries(["admin-products"]);
    },
    onError: (error) => {
      toast.error("Failed to update product: " + error.message);
    },
  });

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleStatusToggle = (product) => {
    updateStatusMutation.mutate({
      id: product.id,
      is_active: !product.is_active,
    });
  };

  const handleFeaturedToggle = (product) => {
    updateFeaturedMutation.mutate({
      id: product.id,
      is_featured: !product.is_featured,
    });
  };

  const formatPrice = (priceCents) => {
    return `৳${(priceCents / 100).toFixed(0)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Product Management
          </h2>
          <p className="text-neutral-600">Manage all products in the shop</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={filters.category_id}
              onChange={(e) =>
                setFilters({ ...filters, category_id: e.target.value })
              }
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>

            <select
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={filters.is_active}
              onChange={(e) =>
                setFilters({ ...filters, is_active: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={filters.is_featured}
              onChange={(e) =>
                setFilters({ ...filters, is_featured: e.target.value })
              }
            >
              <option value="">All Featured</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {productsData?.data?.map((product) => (
              <div
                key={product.id}
                className="p-6 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-neutral-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {product.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                        {product.is_featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="text-neutral-600 mb-3 line-clamp-2">
                        {product.short_description || product.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {product.sale_price_cents ? (
                            <div className="flex items-center gap-1">
                              <span className="text-green-600 font-semibold">
                                {formatPrice(product.sale_price_cents)}
                              </span>
                              <span className="text-neutral-400 line-through">
                                {formatPrice(product.price_cents)}
                              </span>
                            </div>
                          ) : (
                            formatPrice(product.price_cents)
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {product.stock_quantity} in stock
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {product.rating || 0} rating
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          {product.reviews?.[0]?.count || 0} reviews
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(product.created_at)}
                        </div>
                        {product.category && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {product.category.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(product)}
                      disabled={updateStatusMutation.isPending}
                    >
                      {product.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeaturedToggle(product)}
                      disabled={updateFeaturedMutation.isPending}
                    >
                      {product.is_featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteProductMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {productsData?.count > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <span className="px-3 py-1 text-sm text-neutral-600">
            Page 1 of 5
          </span>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
