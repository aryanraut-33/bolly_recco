import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function StarRating({ rating = 0, onRate, readonly = false, size = "md" }) {
  const [hover, setHover] = useState(0);

  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readonly}
            className={`${readonly ? "cursor-default" : "cursor-pointer"} focus:outline-none`}
            onClick={() => !readonly && onRate?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            whileHover={!readonly ? { scale: 1.3 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            animate={filled ? { rotate: [0, -15, 15, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Star
              className={`${sizes[size]} transition-all duration-200 ${
                filled
                  ? "fill-sunshine text-sunshine drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                  : "fill-none text-gray-300"
              }`}
            />
          </motion.button>
        );
      })}
      {rating > 0 && (
        <span className="ml-1 text-sm font-semibold text-sunshine font-poppins">
          {rating}/5
        </span>
      )}
    </div>
  );
}
