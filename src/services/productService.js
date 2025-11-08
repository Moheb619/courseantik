// Product service for e-commerce functionality
import { supabase } from '../lib/supabase';

export const productService = {
  // Get all products with filtering and sorting
  async getProducts(options = {}) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:category_id(name, slug),
          reviews:product_reviews(rating)
        `)
        .eq('is_active', true);

      // Apply filters
      if (options.category && options.category !== 'all') {
        query = query.eq('category_id', options.category);
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%,short_description.ilike.%${options.search}%`);
      }

      if (options.featured) {
        query = query.eq('is_featured', true);
      }

      if (options.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'price_low':
          query = query.order('price_cents', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price_cents', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          // This would need a computed column or separate query
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('is_featured', { ascending: false })
                      .order('created_at', { ascending: false });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to match expected format
      const processedData = data.map(product => ({
        ...product,
        category: product.category?.name || 'Uncategorized',
        categorySlug: product.category?.slug,
        rating: product.reviews?.length > 0 
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : product.rating || 4.5,
        reviewCount: product.reviews_count || 0,
        isInStock: product.stock_quantity > 0,
        originalPriceCents: product.sale_price_cents,
        isOnSale: product.sale_price_cents && product.sale_price_cents < product.price_cents,
        image_url: product.images?.[0] || null // Use first image as main image
      }));

      return { data: processedData, error: null };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], error };
    }
  },

  // Get product by slug
  async getProductBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:product_categories(name),
          reviews:product_reviews(rating, comment, user_id, created_at, profiles(full_name))
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;

      // Process the data
      const processedData = {
        ...data,
        category: data.categories?.name || 'Uncategorized',
        rating: data.reviews?.length > 0 
          ? data.reviews.reduce((sum, review) => sum + review.rating, 0) / data.reviews.length
          : 4.5,
        reviewCount: data.reviews?.length || 0,
        isInStock: data.stock_quantity > 0,
        originalPriceCents: data.original_price_cents,
        isOnSale: data.original_price_cents > data.price_cents,
        reviews: data.reviews?.map(review => ({
          ...review,
          userName: review.profiles?.full_name || 'Anonymous'
        })) || []
      };

      return { data: processedData, error: null };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { data: null, error };
    }
  },

  // Get product categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: [], error };
    }
  },

  // Get featured products
  async getFeaturedProducts(limit = 4) {
    return this.getProducts({ featured: true, limit });
  },

  // Search products
  async searchProducts(searchTerm) {
    return this.getProducts({ search: searchTerm });
  },

  // Get product reviews
  async getProductReviews(productId) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData = data.map(review => ({
        ...review,
        userName: review.profiles?.full_name || 'Anonymous',
        userAvatar: review.profiles?.avatar_url
      }));

      return { data: processedData, error: null };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { data: [], error };
    }
  }
};

export default productService;
