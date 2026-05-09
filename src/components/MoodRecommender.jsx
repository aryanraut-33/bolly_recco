import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const MOODS = [
  { id: "happy", emoji: "😄", label: "Happy", description: "Feel-good & lighthearted", genres: ["Comedy", "Adventure"], color: "bg-orange-50/40 hover:bg-orange-100/60 border-orange-100/50 text-orange-900 hover:shadow-orange-100" },
  { id: "love", emoji: "❤️", label: "In Love", description: "Romantic & dreamy", genres: ["Romance"], color: "bg-rose-50/40 hover:bg-rose-100/60 border-rose-100/50 text-rose-900 hover:shadow-rose-100" },
  { id: "chill", emoji: "🛋️", label: "Chill", description: "Relaxed & easy-going", genres: ["Drama", "Comedy"], color: "bg-blue-50/40 hover:bg-blue-100/60 border-blue-100/50 text-blue-900 hover:shadow-blue-100" },
  { id: "excited", emoji: "🤩", label: "Excited", description: "Action-packed & thrilling", genres: ["Action", "Thriller", "Mystery"], color: "bg-yellow-50/40 hover:bg-yellow-100/60 border-yellow-100/50 text-yellow-900 hover:shadow-yellow-100" },
  { id: "sad", emoji: "😢", label: "Sad", description: "Emotional & moving", genres: ["Drama", "Romance"], color: "bg-indigo-50/40 hover:bg-indigo-100/60 border-indigo-100/50 text-indigo-900 hover:shadow-indigo-100" },
];

export default function MoodRecommender({ movies, onSelectMovie, defaultOpen = false, hideFAB = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendedMovie, setRecommendedMovie] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setIsAnimating(true);
    
    setTimeout(() => {
      let filtered = [];
      switch (mood.id) {
        case "happy":
          filtered = movies.filter(m => m.genre.includes("Comedy") || m.genre.includes("Adventure"));
          break;
        case "love":
          filtered = movies.filter(m => m.genre.includes("Romance"));
          break;
        case "chill":
          filtered = movies.filter(m => m.genre.includes("Drama") || m.genre.includes("Romance"));
          break;
        case "excited":
          filtered = movies.filter(m => m.genre.includes("Action") || m.genre.includes("Thriller"));
          break;
        case "sad":
          filtered = movies.filter(m => m.genre.includes("Drama") && !m.genre.includes("Comedy"));
          break;
        default:
          filtered = movies;
      }

      if (filtered.length === 0) filtered = movies;
      
      const randomMovie = filtered[Math.floor(Math.random() * filtered.length)];
      setRecommendedMovie(randomMovie);
      setIsAnimating(false);
    }, 1500);
  };

  const reset = () => {
    setSelectedMood(null);
    setRecommendedMovie(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(reset, 300);
  };

  return (
    <>
      {!hideFAB && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full p-4 shadow-xl shadow-purple-500/30 flex items-center gap-2 font-poppins font-semibold"
        >
          <Sparkles className="w-5 h-5" />
          <span className="hidden sm:inline">Movie Magic</span>
        </motion.button>
      )}

      {hideFAB ? (
          <div className="bg-white rounded-[2rem] w-full shadow-2xl border-none overflow-hidden max-w-[340px] sm:max-w-md mx-auto">
            <div className="p-6 text-center bg-white border-b border-gray-50/50">
              <h2 className="text-2xl font-outfit font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Mood Matcher
              </h2>
              <p className="text-sm text-muted-foreground font-poppins mt-1">
                How are you feeling right now?
              </p>
            </div>

            <div className="p-6 pt-4 min-h-[300px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!selectedMood ? (
                  <motion.div
                    key="mood-selector"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 gap-3"
                  >
                    {MOODS.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood)}
                        className={`flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 text-left group hover:shadow-lg hover:-translate-y-0.5 ${mood.color}`}
                      >
                        <span className="text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-sm">{mood.emoji}</span>
                        <div className="flex-grow">
                          <h3 className="font-poppins font-bold text-base">{mood.label}</h3>
                          <p className="text-[13px] opacity-70 font-medium leading-tight mt-0.5">{mood.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </motion.div>
                ) : isAnimating ? (
                  <motion.div
                    key="animating"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-6xl mb-4"
                    >
                      🪄
                    </motion.div>
                    <p className="font-poppins font-medium animate-pulse text-purple-600">
                      Finding the perfect movie...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-center mb-6">
                      <span className="text-5xl mb-2 block">{selectedMood.emoji}</span>
                      <p className="text-sm font-poppins text-muted-foreground">
                        Since you're feeling {selectedMood.label.toLowerCase()}...
                      </p>
                    </div>

                    <div 
                      onClick={() => onSelectMovie(recommendedMovie)}
                      className="w-full max-w-[240px] aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 relative group"
                    >
                      {recommendedMovie.poster_url ? (
                        <img src={recommendedMovie.poster_url} alt={recommendedMovie.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4 text-center">
                          <span className="font-outfit font-bold text-white text-xl">{recommendedMovie.title}</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-sm font-poppins font-medium line-clamp-2">
                          Click to view details
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full justify-center">
                      <Button variant="default" onClick={() => handleMoodSelect(selectedMood)} className="w-full sm:w-auto font-semibold bg-purple-600 hover:bg-purple-700">
                        Suggest Another 🎲
                      </Button>
                      <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
                        Try another mood
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
      ) : (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-[340px] sm:max-w-md p-0 overflow-hidden bg-white rounded-[2rem] border-none shadow-2xl">
            <DialogTitle className="sr-only">Mood Recommender</DialogTitle>
            
            <div className="p-6 text-center bg-white border-b border-gray-50/50">
              <h2 className="text-2xl font-outfit font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Mood Matcher
              </h2>
              <p className="text-sm text-muted-foreground font-poppins mt-1">
                How are you feeling right now?
              </p>
            </div>

            <div className="p-6 pt-4 min-h-[400px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!selectedMood ? (
                  <motion.div
                    key="mood-selector"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 gap-3"
                  >
                    {MOODS.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood)}
                        className={`flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 text-left group hover:shadow-lg hover:-translate-y-0.5 ${mood.color}`}
                      >
                        <span className="text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-sm">{mood.emoji}</span>
                        <div className="flex-grow">
                          <h3 className="font-poppins font-bold text-base">{mood.label}</h3>
                          <p className="text-[13px] opacity-70 font-medium leading-tight mt-0.5">{mood.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </motion.div>
                ) : isAnimating ? (
                  <motion.div
                    key="animating"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-6xl mb-4"
                    >
                      🪄
                    </motion.div>
                    <p className="font-poppins font-medium animate-pulse text-purple-600">
                      Finding the perfect movie...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-center mb-6">
                      <span className="text-5xl mb-2 block">{selectedMood.emoji}</span>
                      <p className="text-sm font-poppins text-muted-foreground">
                        Since you're feeling {selectedMood.label.toLowerCase()}...
                      </p>
                    </div>

                    <div 
                      onClick={() => { handleClose(); onSelectMovie(recommendedMovie); }}
                      className="w-full max-w-[200px] aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 relative group"
                    >
                      {recommendedMovie.poster_url ? (
                        <img src={recommendedMovie.poster_url} alt={recommendedMovie.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4 text-center">
                          <span className="font-outfit font-bold text-white text-xl">{recommendedMovie.title}</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-sm font-poppins font-medium line-clamp-2">
                          Click to view details
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full justify-center">
                      <Button variant="default" onClick={() => handleMoodSelect(selectedMood)} className="w-full sm:w-auto font-semibold bg-purple-600 hover:bg-purple-700">
                        Suggest Another 🎲
                      </Button>
                      <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
                        Try another mood
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
