import PropTypes from "prop-types";
import ProductCard from "./ProductCard";

/**
 * ProductList Component
 * Renders a grid of ProductCards
 */
const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
        <h3 className="mb-2 text-xl font-bold text-muted-foreground">
          No Products Found
        </h3>
        <p className="text-muted-foreground">
          Check back later for new amazing items!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.array,
};

export default ProductList;
