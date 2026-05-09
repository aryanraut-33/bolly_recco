import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchModal({ open, onClose, searchQuery, setSearchQuery }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none top-[33%] translate-y-[-50%] flex flex-col items-center">
        <DialogHeader className="p-0 border-none">
          <DialogTitle className="sr-only">Search Movies</DialogTitle>
        </DialogHeader>
        
        <div className="w-full px-6 flex flex-col items-center">
          <div className="relative w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 group-focus-within:text-coral transition-colors" />
            <Input
              placeholder="SEARCH MOVIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 bg-black/40 backdrop-blur-xl h-16 rounded-full text-lg font-outfit text-white placeholder:text-zinc-600 border-zinc-800 focus-visible:ring-0 focus-visible:border-coral/50 transition-all tracking-widest uppercase"
              autoFocus
            />
          </div>
          
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mt-6 font-poppins text-center opacity-60">
            Real-time filtering enabled
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

