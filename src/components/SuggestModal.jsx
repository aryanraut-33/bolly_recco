import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function SuggestModal({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        toast.success("Suggestion sent to Aryan! 💌");
        setTitle("");
        onClose();
      } else {
        toast.error("Failed to send suggestion");
      }
    } catch (error) {
      toast.error("Error submitting suggestion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] sm:max-w-md p-6 bg-white rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="p-0 pb-2 text-center border-none">
          <DialogTitle className="text-2xl font-outfit font-bold flex flex-col items-center gap-2">
            <span className="text-4xl">💡</span>
            Suggest a Movie
          </DialogTitle>
          <p className="text-muted-foreground font-poppins text-sm mt-1 px-2">
            Know a great movie Aryan should watch too? Suggest it here!
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="pt-4 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block pl-1">Movie Title</label>
            <Input
              placeholder="e.g. Interstellar, Sholay..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-14 bg-white rounded-2xl text-base font-poppins border-2 border-coral shadow-[0_0_15px_rgba(255,107,107,0.15)] focus-visible:ring-0 focus-visible:border-coral transition-colors"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={!title.trim() || loading} className="w-full h-12 text-base bg-electric hover:bg-electric/90 text-white shadow-lg shadow-electric/20">
            {loading ? "Sending..." : "Send Suggestion 🚀"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
