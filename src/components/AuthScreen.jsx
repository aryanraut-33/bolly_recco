import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthScreen({ onAuth }) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("bollyrecco_token", data.token);
        onAuth(true);
      } else {
        setError("Access Denied");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError("System Offline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`w-full max-w-sm relative z-10 ${shake ? "animate-wiggle" : ""}`}
      >
        <div className="text-center mb-12">
          <Lock className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
          <h1 className="text-zinc-400 font-outfit text-xs tracking-[0.5em] uppercase font-light">
            Security Protocol
          </h1>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-600 uppercase tracking-widest block text-center">
              Identity Verification Required
            </label>
            <div className="h-[1px] w-full bg-zinc-900" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="ENTRY KEY"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="bg-transparent border-zinc-900 border-x-0 border-t-0 rounded-none h-12 text-center text-zinc-300 placeholder:text-zinc-800 focus-visible:ring-0 focus-visible:border-zinc-700 transition-colors uppercase tracking-[0.2em] font-light"
                autoFocus
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-red-900/50 text-[10px] uppercase tracking-widest"
                >
                  <ShieldAlert className="w-3 h-3" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading || !answer.trim()}
                className="w-full h-12 bg-transparent hover:bg-zinc-900 text-zinc-600 border border-zinc-900 rounded-none uppercase tracking-[0.3em] text-[10px] font-light transition-all duration-500"
              >
                {loading ? "Verifying..." : "Validate"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-zinc-800 text-[8px] uppercase tracking-widest hover:text-zinc-600 transition-colors"
                >
                  {showHint ? "[ Close Hint ]" : "[ Request Hint ]"}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-zinc-700 text-[9px] uppercase tracking-widest mt-2 italic"
                    >
                      Leak: It&apos;s Aryan&apos;s birthday
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-24 text-center">
          <p className="text-zinc-900 text-[8px] uppercase tracking-[0.2em]">
            Terminal Instance ID: {Math.random().toString(36).substring(7).toUpperCase()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

