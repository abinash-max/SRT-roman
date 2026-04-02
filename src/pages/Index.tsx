import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Download, RotateCcw } from "lucide-react";
import DropZone from "@/components/DropZone";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ROMANIZE_LANGUAGES = [
  { value: "hindi", label: "Hindi (Devanagari)" },
  { value: "punjabi", label: "Punjabi (Gurmukhi)" },
  { value: "marathi", label: "Marathi (Devanagari)" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "kannada", label: "Kannada" },
  { value: "gujarati", label: "Gujarati" },
] as const;

type AppState = "upload" | "processing" | "done";

const Index = () => {
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("hindi");
  const [state, setState] = useState<AppState>("upload");
  const [outputContent, setOutputContent] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileReady = !!srtFile;
  const languageLabel =
    ROMANIZE_LANGUAGES.find((l) => l.value === language)?.label ?? language;

  const handleGenerate = useCallback(async () => {
    if (!srtFile) return;
    setState("processing");
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("srt_file", srtFile);
    const progressTimer = window.setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + Math.max(1, Math.round((95 - prev) / 12)) : prev));
    }, 350);

    const langParam = encodeURIComponent(language);
    try {
      const res = await fetch(
        `${API_BASE}/romanize-hindi-srt?model=claude-sonnet-4-6&chunk_size=100&language=${langParam}`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const result = await res.text();
      setOutputContent(result);
      setProgress(100);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed");
      setState("upload");
    } finally {
      window.clearInterval(progressTimer);
    }
  }, [srtFile, language]);

  const handleDownload = () => {
    const blob = new Blob([outputContent], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = srtFile?.name?.replace(/\.(srt|txt)$/i, "") || "merged";
    a.download = `${baseName}_roman.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSrtFile(null);
    setState("upload");
    setOutputContent("");
    setProgress(0);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden">
      {/* Background ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: state === "processing" ? 0.15 : 0.08,
            scale: state === "processing" ? 1.2 : 1,
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/30 blur-[150px]"
        />
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative z-10 mb-12 text-center"
      >
        <motion.div
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-body font-medium text-muted-foreground">Indic SRT Romanizer</span>
        </motion.div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-foreground sm:text-5xl">
          Romanize <span className="text-primary">Indic SRT</span>
        </h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground font-body">
          Upload an SRT in Hindi, Punjabi, Marathi, Tamil, Telugu, Kannada, or Gujarati and get Roman (Latin)
          transliteration with the same timings.
        </p>
        {error && (
          <p className="mt-2 text-sm text-destructive font-body">{error}</p>
        )}
      </motion.div>

      {/* Main content area */}
      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {state === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label htmlFor="romanize-language" className="text-sm font-medium text-foreground font-body">
                    Source language / script
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="romanize-language" className="w-full max-w-md mx-auto">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROMANIZE_LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DropZone
                  label="Subtitle SRT"
                  description="Drop your .srt file here"
                  accept=".srt"
                  file={srtFile}
                  onFile={setSrtFile}
                  icon={<FileText className="h-8 w-8" />}
                />
              </div>

              <AnimatePresence>
                {fileReady && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 20, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex justify-center pt-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGenerate}
                      className="group relative flex items-center gap-3 rounded-xl bg-primary px-8 py-4 font-display font-semibold text-primary-foreground shadow-lg transition-shadow hover:shadow-primary/30 hover:shadow-xl animate-pulse-glow"
                    >
                      <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
                      Romanize SRT
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {state === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15"
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <div className="text-center">
                <p className="text-lg font-display font-semibold text-foreground">Processing...</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Anthropic is romanizing your {languageLabel} subtitles
                </p>
              </div>
              <div className="w-full max-w-md">
                <Slider
                  value={[progress]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setProgress(v[0] ?? 0)}
                />
                <p className="mt-2 text-center text-xs text-muted-foreground font-body">{progress}%</p>
              </div>
            </motion.div>
          )}

          {state === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex flex-col gap-5"
            >
              {/* Header card */}
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-card p-8 glow-border">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15"
                >
                  <Download className="h-8 w-8 text-primary" />
                </motion.div>
                <div className="text-center">
                  <p className="text-xl font-display font-bold text-foreground">Roman SRT Ready!</p>
                  <p className="mt-1 text-sm text-muted-foreground">Preview your output below</p>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display font-semibold text-primary-foreground shadow-lg transition-shadow hover:shadow-primary/30 hover:shadow-xl"
                  >
                    <Download className="h-4 w-4" />
                    Download SRT
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3 font-display font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Start Over
                  </motion.button>
                </div>
              </div>

              {/* SRT Preview */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-display font-semibold text-foreground">
                    {srtFile ? `${srtFile.name.replace(/\.(srt|txt)$/i, "")}_roman.srt` : "romanized.srt"}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground font-body">
                    {outputContent.split("\n").filter(Boolean).length} lines
                  </span>
                </div>
                <pre className="max-h-72 overflow-auto p-5 text-sm font-mono text-muted-foreground leading-relaxed scrollbar-thin">
                  {outputContent}
                </pre>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
