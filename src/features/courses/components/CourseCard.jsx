import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock } from "lucide-react";

const CourseCard = ({ course }) => {
  const { id, title, thumbnail_url, price, instructor, duration, level } =
    course;

  const isFree = price === 0;
  const formattedPrice = isFree
    ? "Free"
    : new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
      }).format(price);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="aspect-video w-full overflow-hidden bg-gray-200">
        <img
          src={
            thumbnail_url ||
            "/src/assets/images/placeholders/course/default.png"
          }
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-2 top-2 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {level || "Beginner"}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-lg font-bold leading-tight text-primary line-clamp-2">
          <Link to={`/courses/${id}`} className="hover:underline">
            {title}
          </Link>
        </h3>

        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <PlayCircle className="h-3 w-3" />
            <span>12 Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{duration || "2h 15m"}</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-primary">
              {formattedPrice}
            </span>
          </div>
          <Button
            size="sm"
            asChild
            className="rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <Link to={`/courses/${id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
};

export default CourseCard;
