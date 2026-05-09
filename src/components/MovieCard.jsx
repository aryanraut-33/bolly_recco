import { motion } from "framer-motion";
import { Eye, EyeOff, Pencil, Trash2, Calendar, Star, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const placeholderGradients = [
  "from-coral to-orange-500",
  "from-electric to-purple-600",
  "from-hotpink to-rose-500",
  "from-teal to-emerald-500",
  "from-sunshine to-amber-500",
  "from-blue-500 to-indigo-600",
  "from-pink-500 to-red-500",
  "from-green-400 to-teal",
];

export default function MovieCard({ movie, index, onClick, isAdmin, onEdit, onDelete, isSwipeMode }) {
  const gradientClass =
    placeholderGradients[movie.id % placeholderGradients.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`group cursor-pointer flex flex-col ${isSwipeMode ? 'w-full' : ''}`}
      onClick={() => onClick(movie)}
    >
      <div className="relative rounded-3xl overflow-hidden shadow-lg shadow-black/5 bg-gray-100 mb-3 w-full" style={{ aspectRatio: '2/3' }}>
        {/* Poster */}
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center p-4`}
          >
            <span className="text-white font-outfit font-bold text-xl text-center leading-tight drop-shadow-lg">
              {movie.title}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
          {movie.watched ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-lg shadow-emerald-500/30">
                <Eye className="w-4 h-4" />
              </div>
            </motion.div>
          ) : (
            <div>
              <div className="bg-white/80 backdrop-blur-sm text-gray-400 rounded-full p-1.5 shadow">
                <EyeOff className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="absolute top-3 left-3 z-20 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 shadow-lg shadow-black/20 hover:bg-blue-500 hover:text-white transition-colors flex items-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(movie);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Edit</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg shadow-black/20 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(movie);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Info (Below Poster) */}
      <div className="flex flex-col px-1">
        {movie.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-1 text-sm font-semibold text-gray-600">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-300 font-bold tracking-wide">IMDb</Badge>
            <span>{movie.rating}</span>
          </div>
        )}
        <h3 className="font-outfit font-bold text-[15px] text-foreground leading-tight line-clamp-1 group-hover:text-coral transition-colors mb-0.5">
          {movie.title}
        </h3>
        <p className="text-xs text-muted-foreground font-poppins line-clamp-1">
          {movie.genre}
        </p>
      </div>
    </motion.div>
  );
}
