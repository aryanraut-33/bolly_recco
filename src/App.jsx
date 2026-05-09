import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clapperboard, Lock, LockOpen, Plus, LogOut, Search, Film, Popcorn, Star, LayoutGrid, GalleryHorizontalEnd, Lightbulb, PieChart, Sparkles, Home } from "lucide-react";
import AuthScreen from "./components/AuthScreen";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import AdminPanel from "./components/AdminPanel";
import MoodRecommender from "./components/MoodRecommender";
import StatsModal from "./components/StatsModal";
import SearchModal from "./components/SearchModal";
import SuggestModal from "./components/SuggestModal";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./components/ui/carousel";
import { Toaster, toast } from "sonner";

const floatingPopcorns = Array.from({ length: 15 });

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("bollyrecco_token"));
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("bollyrecco_admin"));
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(["All"]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("swipe");
  const [adminPass, setAdminPass] = useState("");

  const [activeTab, setActiveTab] = useState("home");
  const [showStats, setShowStats] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showMood, setShowMood] = useState(false);

  // Sync activeTab with modal closures
  useEffect(() => {
    if (!showStats && !showSearch && !showSuggest && !showMood) {
      setActiveTab("home");
    }
  }, [showStats, showSearch, showSuggest, showMood]);

  const fetchMovies = useCallback(async (silent = false) => {
    try {
      const q = activeGenre !== "All" ? `?genre=${activeGenre}` : "";
      const res = await fetch(`/api/movies${q}`);
      const data = await res.json();
      setMovies(data);
      if (selectedMovie) {
        const updatedSelected = data.find(m => m.id === selectedMovie.id);
        // Only update if something actually changed to prevent cyclical re-renders
        if (updatedSelected && (
          updatedSelected.watched !== selectedMovie.watched || 
          updatedSelected.rating !== selectedMovie.rating || 
          updatedSelected.review_text !== selectedMovie.review_text
        )) {
          setSelectedMovie(updatedSelected);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeGenre, selectedMovie]);

  const fetchGenres = async () => {
    try {
      const res = await fetch("/api/genres");
      setGenres(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (auth) {
      fetchMovies();
      fetchGenres();
      const interval = setInterval(() => fetchMovies(true), 10000); // 10s
      return () => clearInterval(interval);
    }
  }, [auth, activeGenre, fetchMovies]);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const handleMovieUpdate = (updated) => {
    setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelectedMovie(updated);
    toast.success("Review saved! 🎬");
  };

  const handleAdminLogin = async () => {
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass }),
      });
      if (res.ok) {
        setIsAdmin(true);
        localStorage.setItem("bollyrecco_admin", "true");
        setShowAdminLogin(false);
        setAdminPass("");
        toast.success("Admin mode activated! 🔓");
      } else {
        toast.error("Wrong password!");
      }
    } catch (e) {
      toast.error("Error");
    }
  };

  const handleAdminSave = (movie) => {
    if (editMovie) {
      setMovies((prev) => prev.map((m) => (m.id === movie.id ? movie : m)));
      toast.success("Movie updated! ✅");
    } else {
      setMovies((prev) => [movie, ...prev]);
      toast.success("Movie added! 🎉");
    }
    setEditMovie(null);
    fetchGenres();
  };

  const handleDelete = async (movie) => {
    if (!confirm(`Delete "${movie.title}"?`)) return;
    try {
      const res = await fetch(`/api/movies/${movie.id}`, { method: "DELETE" });
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.id !== movie.id));
        toast.success("Deleted! 🗑️");
        fetchGenres();
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bollyrecco_token");
    localStorage.removeItem("bollyrecco_admin");
    setAuth(false);
    setIsAdmin(false);
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!auth) return <AuthScreen onAuth={setAuth} />;

  const watchedCount = movies.filter((m) => m.watched).length;

  const NavItem = ({ id, icon: Icon, label, onClick }) => {
    const isActive = activeTab === id;
    return (
      <button onClick={() => { setActiveTab(id); onClick(); }} className="relative flex flex-col items-center justify-center w-12 h-12 flex-shrink-0 outline-none">
        {isActive && (
          <motion.div layoutId="activeTab" className="absolute -top-7 w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center border-[6px] border-[#fafaf9]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-coral to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(255,107,107,0.5)]">
              <Icon className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
          </motion.div>
        )}
        {!isActive && <Icon className={`w-6 h-6 transition-colors ${id === 'mood' ? 'text-coral animate-pulse drop-shadow-md' : 'text-gray-400 hover:text-coral'}`} />}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100/50 flex justify-center w-full font-poppins">
      <div className="w-full max-w-[420px] bg-[#fafaf9] h-[100dvh] relative overflow-hidden flex flex-col shadow-2xl sm:border-x border-gray-200">
        <Toaster position="top-center" richColors toastOptions={{ className: "font-poppins" }} />

        {/* Background Bouncing Popcorns */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {floatingPopcorns.map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-[0.15] drop-shadow-sm"
              initial={{ x: Math.random() * 400, y: 1000 }}
              animate={{ y: -100, rotate: Math.random() * 360, x: (Math.random() - 0.5) * 200 + (Math.random() * 400) }}
              transition={{ duration: 8 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            >
              🍿
            </motion.div>
          ))}
        </div>

        {/* Navbar */}
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex-shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-orange-500 flex items-center justify-center shadow-md shadow-coral/20 shrink-0">
                <Clapperboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-outfit font-bold text-xl text-foreground leading-none">BollyRecco</h1>
                <p className="text-[10px] text-muted-foreground font-poppins mt-0.5 whitespace-nowrap">Aryan&apos;s picks for you 🍿</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button size="icon" onClick={() => { setEditMovie(null); setShowAdmin(true); }} className="w-8 h-8 rounded-xl shadow-sm">
                  <Plus className="w-4 h-4" />
                </Button>
              )}
              <button
                onClick={() => isAdmin ? (setIsAdmin(false), localStorage.removeItem("bollyrecco_admin"), toast("Admin mode off")) : setShowAdminLogin(true)}
                className={`p-2 rounded-xl transition-all ${isAdmin ? "bg-electric/10 text-electric" : "bg-white text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100"}`}
              >
                {isAdmin ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
              <button onClick={handleLogout} className="p-2 rounded-xl bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm border border-gray-100">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 px-4 pt-5 pb-28 scrollbar-hide">
          <div className="flex justify-between items-center mb-6 w-full gap-3">
            <div className="flex-1 relative z-20">
              <Select value={activeGenre} onValueChange={setActiveGenre}>
                <SelectTrigger className="h-12 bg-white border-gray-200 shadow-sm rounded-2xl w-full">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(g => <SelectItem key={g} value={g}>{g === "All" ? "All Movies" : g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm flex items-center shrink-0">
              <button onClick={() => setViewMode("swipe")} className={`p-2 rounded-xl transition-colors ${viewMode === "swipe" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <GalleryHorizontalEnd className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-xl transition-colors ${viewMode === "grid" ? "bg-gray-100 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {searchQuery && (
            <div className="mb-4 bg-coral/10 text-coral px-4 py-2 rounded-xl text-sm font-semibold flex justify-between items-center">
              <span className="line-clamp-1">Search: &quot;{searchQuery}&quot;</span>
              <button onClick={() => setSearchQuery("")} className="hover:text-red-500 shrink-0 ml-2">Clear</button>
            </div>
          )}

          {loading && movies.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[2/3] rounded-3xl bg-gray-200 animate-pulse w-full" />)}
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 opacity-50 w-full">
              <Film className="w-16 h-16 mb-4 text-gray-300" />
              <p className="font-outfit text-xl font-bold text-foreground">No movies found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search or genre</p>
            </div>
          ) : viewMode === "swipe" ? (
            <div className="w-full flex-grow flex items-center justify-center py-2 relative z-0">
              <Carousel opts={{ align: "center", containScroll: "trimSnaps" }} className="w-full">
                <CarouselContent className="-ml-2">
                  {filteredMovies.map((movie, i) => (
                    <CarouselItem key={movie.id} className="pl-2 basis-[88%] sm:basis-[80%]">
                      <div className="h-full px-1">
                        <MovieCard movie={movie} index={i} onClick={handleMovieClick} isAdmin={isAdmin} onEdit={(m) => { setEditMovie(m); setShowAdmin(true); }} onDelete={handleDelete} isSwipeMode={true} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-2 gap-4 w-full relative z-0">
                {filteredMovies.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} onClick={handleMovieClick} isAdmin={isAdmin} onEdit={(m) => { setEditMovie(m); setShowAdmin(true); }} onDelete={handleDelete} isSwipeMode={false} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Custom Nav Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-2 z-50 pointer-events-none w-full">
          <div className="bg-white rounded-[28px] h-[72px] px-6 flex justify-between items-center relative shadow-[0_0_20px_rgba(255,107,107,0.3)] border-2 border-coral/30 pointer-events-auto w-full mx-auto">
            <NavItem id="mood" icon={Sparkles} onClick={() => setShowMood(true)} />
            <NavItem id="search" icon={Search} onClick={() => setShowSearch(true)} />
            <NavItem id="stats" icon={PieChart} onClick={() => setShowStats(true)} />
            <NavItem id="suggest" icon={Lightbulb} onClick={() => setShowSuggest(true)} />
          </div>
        </div>

        {/* Modals */}
        <StatsModal open={showStats} onClose={setShowStats} movies={movies} watchedCount={watchedCount} />
        <SearchModal open={showSearch} onClose={setShowSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <SuggestModal open={showSuggest} onClose={setShowSuggest} />
        
        <Dialog open={showMood} onOpenChange={setShowMood}>
          <DialogContent className="max-w-[380px] p-0 bg-transparent border-none shadow-none">
            <MoodRecommender movies={movies} onSelectMovie={(m) => { handleMovieClick(m); setShowMood(false); }} defaultOpen={true} hideFAB={true} />
          </DialogContent>
        </Dialog>

        <MovieModal movie={selectedMovie} open={showModal} onClose={() => { setShowModal(false); setSelectedMovie(null); }} onUpdate={handleMovieUpdate} />
        <AdminPanel open={showAdmin} onClose={() => { setShowAdmin(false); setEditMovie(null); }} movie={editMovie} onSave={handleAdminSave} />

        <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
          <DialogContent className="max-w-[380px]">
            <DialogHeader className="p-6 pb-0"><DialogTitle>Admin Login 🔐</DialogTitle></DialogHeader>
            <div className="p-6 pt-4 space-y-4">
              <Input type="password" placeholder="Enter admin password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} className="h-12" />
              <Button onClick={handleAdminLogin} className="w-full h-12 text-base">Unlock</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
