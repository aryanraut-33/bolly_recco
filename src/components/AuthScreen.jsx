import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Popcorn, Clapperboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const floatingEmojis = ["🎬", "🍿", "⭐", "🎥", "🎭", "🎞️", "🌟", "💫"];

export default function AuthScreen({ onAuth }) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

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
        setError(data.error || "Wrong answer!");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating background emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl select-none pointer-events-none opacity-20"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, -20, 20, -10, 10, 0],
            rotate: [0, 10, -10, 5, -5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            repeatType: "reverse",
            delay: Math.random() * 2,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Film strip top decoration */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center overflow-hidden">
        <motion.div
          className="flex gap-3 whitespace-nowrap"
          animate={{ x: [0, -400] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-6 rounded-sm bg-gray-700/60 border border-gray-600/30 flex-shrink-0"
            />
          ))}
        </motion.div>
      </div>

      {/* Film strip bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 flex items-center overflow-hidden">
        <motion.div
          className="flex gap-3 whitespace-nowrap"
          animate={{ x: [-400, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-6 rounded-sm bg-gray-700/60 border border-gray-600/30 flex-shrink-0"
            />
          ))}
        </motion.div>
      </div>

      {/* Main auth card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full max-w-md ${shake ? "animate-wiggle" : ""}`}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-coral/10 border border-white/50 p-8 relative overflow-hidden">
          {/* Decorative gradient blob */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-coral/30 to-hotpink/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-sunshine/30 to-orange-300/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* Logo / Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-coral to-orange-500 shadow-lg shadow-coral/30 mb-4"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Clapperboard className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="font-outfit text-3xl font-extrabold bg-gradient-to-r from-coral via-hotpink to-electric bg-clip-text text-transparent">
                BollyRecco
              </h1>
              <p className="text-muted-foreground font-poppins mt-1 text-sm">
                Aryan's curated Bollywood picks 🍿
              </p>
            </motion.div>

            {/* Question */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-sunshine" />
                <label className="font-poppins text-sm font-semibold text-foreground">
                  Quick vibe check ✨
                </label>
              </div>
              <div className="bg-gradient-to-r from-coral/5 to-hotpink/5 rounded-xl p-4 border border-coral/10">
                <p className="font-outfit text-lg font-bold text-foreground">
                  When's Aryan's birthday? 🎂
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-poppins">
                  (if you know, you know 😉)
                </p>
              </div>
            </motion.div>

            {/* Answer input */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Input
                type="text"
                placeholder="Type your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="text-base h-12"
                autoFocus
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-500 font-poppins flex items-center gap-1"
                  >
                    <span>❌</span> {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loading || !answer.trim()}
                className="w-full h-12 text-base font-bold"
                size="lg"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Film className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Popcorn className="w-5 h-5 mr-2" />
                    Let me in!
                  </>
                )}
              </Button>
            </motion.form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
