import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Save, Film, Lightbulb, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const GENRE_OPTIONS = ["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mystery","Romance","Thriller"];

export default function AdminPanel({ open, onClose, movie, onSave }) {
  const [tab, setTab] = useState("movie"); // 'movie' or 'suggestions'
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState([]);
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setGenre(movie.genre.split(",").map(g=>g.trim()));
      setYear(movie.year?.toString()||"");
      setDescription(movie.description||"");
      setTab("movie");
    } else if (open && tab === "movie" && !title) {
      setTitle(""); setGenre([]); setYear(""); setDescription("");
    }
  }, [movie, open]);

  useEffect(() => {
    if (open && tab === "suggestions") {
      fetchSuggestions();
    }
  }, [open, tab]);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/suggestions");
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const toggleGenre = (g) => {
    setGenre(prev => prev.includes(g) ? prev.filter(x=>x!==g) : [...prev, g]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || genre.length === 0) return;
    setSaving(true);
    try {
      const url = movie ? `/api/movies/${movie.id}` : "/api/movies";
      const method = movie ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ title, genre: genre.join(", "), year: parseInt(year)||null, description }),
      });
      if (res.ok) { const data = await res.json(); onSave(data); onClose(); }
    } catch(e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDeleteSuggestion = async (id) => {
    try {
      const res = await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
        toast.success("Suggestion dismissed");
      }
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleApproveSuggestion = (s) => {
    setTitle(s.title);
    setGenre([]);
    setYear("");
    setDescription("");
    setTab("movie");
    handleDeleteSuggestion(s.id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[380px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b border-gray-100 flex flex-row items-center justify-between bg-white">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-purple-600 flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            {movie ? "Edit Movie" : "Admin Panel"}
          </DialogTitle>
        </DialogHeader>

        {!movie && (
          <div className="flex border-b border-gray-100 px-6">
            <button
              onClick={() => setTab("movie")}
              className={`py-3 px-4 font-poppins font-semibold text-sm border-b-2 transition-colors ${tab === "movie" ? "border-coral text-coral" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              Add Movie
            </button>
            <button
              onClick={() => setTab("suggestions")}
              className={`py-3 px-4 font-poppins font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${tab === "suggestions" ? "border-coral text-coral" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              <Lightbulb className="w-4 h-4" /> Suggestions
              {suggestions.length > 0 && tab !== "suggestions" && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {suggestions.length}
                </span>
              )}
            </button>
          </div>
        )}

        {tab === "movie" ? (
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">
            <div className="space-y-2">
              <Label>Movie Title *</Label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Dilwale Dulhania Le Jayenge" required />
            </div>
            <div className="space-y-2">
              <Label>Genre * <span className="text-xs text-muted-foreground">(select one or more)</span></Label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map(g => (
                  <motion.button key={g} type="button" whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border-2 ${genre.includes(g) ? "bg-gradient-to-r from-coral to-orange-500 text-white border-coral shadow-lg shadow-coral/20" : "bg-white text-gray-600 border-gray-200 hover:border-coral/50"}`}
                    onClick={()=>toggleGenre(g)}>{g}</motion.button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input type="number" value={year} onChange={e=>setYear(e.target.value)} placeholder="e.g. 2023" min="1950" max="2030" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What's this movie about? ✨" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={saving || !title.trim() || genre.length===0} className="flex-1">
                {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" />{movie?"Update":"Add Movie"}</>}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-6 pt-4 h-[400px] overflow-y-auto">
            {loadingSuggestions ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Lightbulb className="w-12 h-12 mb-2 opacity-50" />
                <p>No suggestions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map(s => (
                  <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-outfit font-bold">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveSuggestion(s)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteSuggestion(s.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
