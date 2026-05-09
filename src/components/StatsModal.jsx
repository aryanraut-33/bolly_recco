import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Popcorn, Film } from "lucide-react";

export default function StatsModal({ open, onClose, movies, watchedCount }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader className="p-6 pb-2 text-center">
          <DialogTitle className="text-2xl font-outfit font-bold flex flex-col items-center gap-2">
            <span className="text-4xl">📊</span>
            My Movie Stats
          </DialogTitle>
          <p className="text-muted-foreground font-poppins text-sm mt-1">
            Your Bollywood journey so far.
          </p>
        </DialogHeader>

        <div className="p-6 pt-4 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-3 rounded-full text-gray-500"><Film className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground font-poppins font-semibold uppercase tracking-wider">Total Movies</p>
                <p className="text-2xl font-outfit font-bold text-foreground leading-tight">{movies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><Star className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] text-emerald-600 font-poppins font-semibold uppercase tracking-wider">Watched ✅</p>
                <p className="text-2xl font-outfit font-bold text-emerald-600 leading-tight">{watchedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-coral/5 rounded-2xl p-4 border border-coral/10 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-coral/10 p-3 rounded-full text-coral"><Popcorn className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] text-coral font-poppins font-semibold uppercase tracking-wider">Remaining 🍿</p>
                <p className="text-2xl font-outfit font-bold text-coral leading-tight">{movies.length - watchedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
