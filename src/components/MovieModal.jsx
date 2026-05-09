import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Calendar, MessageSquare, Save } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StarRating from "./StarRating";
import confetti from "canvas-confetti";

const genreColorMap = { Romance:"romance", Action:"action", Comedy:"comedy", Thriller:"thriller", Horror:"horror", Adventure:"adventure", Drama:"drama", Fantasy:"fantasy", Mystery:"mystery" };
const gradients = ["from-coral to-orange-500","from-electric to-purple-600","from-hotpink to-rose-500","from-teal to-emerald-500","from-sunshine to-amber-500"];

export default function MovieModal({ movie, open, onClose, onUpdate }) {
  const [watched, setWatched] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (movie) { setWatched(!!movie.watched); setRating(movie.rating||0); setReviewText(movie.review_text||""); setSaved(false); }
  }, [movie]);

  const handleWatchedToggle = (checked) => {
    setWatched(checked);
    if (checked) confetti({ particleCount:80, spread:60, origin:{y:0.6}, colors:["#FF6B6B","#FBBF24","#A855F7","#EC4899","#2DD4BF"] });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/movies/${movie.id}/review`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({watched,rating,review_text:reviewText}) });
      if (res.ok) { const updated = await res.json(); onUpdate(updated); setSaved(true); setTimeout(()=>setSaved(false),2000); }
    } catch(e) { console.error(e); } finally { setSaving(false); }
  };

  if (!movie) return null;
  const genres = movie.genre.split(",").map(g=>g.trim());
  const grad = gradients[movie.id % gradients.length];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[380px] max-h-[90vh] overflow-y-auto p-0">
        <div className="relative h-64 sm:h-72 overflow-hidden">
          {movie.poster_url ? <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}><span className="text-white font-outfit font-bold text-4xl text-center drop-shadow-lg px-8">{movie.title}</span></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white drop-shadow-lg">{movie.title}</h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-white/80 text-sm font-poppins"><Calendar className="w-3.5 h-3.5" />{movie.year}</span>
              <div className="flex gap-1.5 flex-wrap">{genres.map(g=><Badge key={g} variant={genreColorMap[g]||"default"} className="text-[10px] bg-white/20 backdrop-blur-sm text-white border-white/20">{g}</Badge>)}</div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {movie.description && <p className="text-muted-foreground font-poppins text-sm leading-relaxed">{movie.description}</p>}
          <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${watched?"bg-emerald-50 border-emerald-200":"bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center gap-3">
              {watched ? <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><EyeOff className="w-5 h-5 text-gray-400" /></div>}
              <div><Label className="text-base font-outfit">{watched?"Watched! 🎉":"Not watched yet"}</Label><p className="text-xs text-muted-foreground font-poppins">{watched?"You've seen this one!":"Toggle when you watch it"}</p></div>
            </div>
            <Switch checked={watched} onCheckedChange={handleWatchedToggle} />
          </div>
          <div className="space-y-2"><Label className="text-base font-outfit flex items-center gap-2"><span>Rate it</span><span>⭐</span></Label><StarRating rating={rating} onRate={setRating} size="lg" /></div>
          <div className="space-y-2"><Label className="text-base font-outfit flex items-center gap-2"><MessageSquare className="w-4 h-4 text-electric" /><span>Drop your review</span></Label><Textarea placeholder="What did you think? Spill the tea... 🍵" value={reviewText} onChange={e=>setReviewText(e.target.value)} className="min-h-[100px]" /></div>
          <Button onClick={handleSave} disabled={saving} className="w-full h-12" variant={saved?"success":"default"} size="lg">{saving?"⏳ Saving...":saved?"✅ Saved!":<><Save className="w-4 h-4 mr-2" />Save Review</>}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
