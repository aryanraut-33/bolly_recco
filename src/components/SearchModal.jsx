import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchModal({ open, onClose, searchQuery, setSearchQuery }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] sm:max-w-md p-6 bg-white rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="p-0 border-none">
          <DialogTitle className="sr-only">Search Movies</DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-coral" />
            <Input
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 bg-white h-14 rounded-2xl text-base font-poppins border-2 border-coral shadow-[0_0_15px_rgba(255,107,107,0.15)] focus-visible:ring-0 focus-visible:border-coral transition-colors"
              autoFocus
            />
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-4 font-poppins px-4">
            Start typing to instantly filter movies on the main screen.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
