import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * ProductCard Core Component
 * Displays individual product summary in a grid
 */
const ProductCard = ({ product }) => {
  const { id, title, price, image_url, description } = product;

  // Formatting currency (assuming BDT based on requirements)
  const formattedPrice = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
  }).format(price);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={
            image_url || "/src/assets/images/placeholders/product/default.png"
          }
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-lg font-bold leading-tight text-primary line-clamp-2">
          <Link to={`/products/${id}`} className="hover:underline">
            {title}
          </Link>
        </h3>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Price and Action */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-black text-primary">
            {formattedPrice}
          </span>
          <Button
            size="sm"
            className="rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image_url: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
};

export default ProductCard;
