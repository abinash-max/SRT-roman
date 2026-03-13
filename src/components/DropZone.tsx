import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Check, X } from "lucide-react";

interface DropZoneProps {
  label: string;
  description: string;
  accept: string;
  file: File | null;
  onFile: (file: File | null) => void;
  icon?: React.ReactNode;
}

const DropZone = ({ label, description, file, onFile, accept, icon }: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files?.[0]) onFile(files[0]);
    },
    [onFile]
  );

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) onFile(f);
    };
    input.click();
  };

  return (
    <motion.div
      layout
      className="relative w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
            className="cursor-pointer group"
          >
            <motion.div
              animate={isDragOver ? { scale: 1.02 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed 
                px-8 py-16 transition-colors duration-300
                ${isDragOver
                  ? "border-primary bg-primary/5 glow-border-intense"
                  : "border-border bg-card hover:border-muted-foreground/40 hover:bg-secondary/50"
                }
              `}
            >
              <motion.div
                animate={isDragOver ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`rounded-xl p-4 transition-colors duration-300 ${
                  isDragOver ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {icon || <Upload className="h-8 w-8" />}
              </motion.div>
              <div className="text-center">
                <p className="text-lg font-display font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              {isDragOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none"
                />
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="file-attached"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative flex items-center gap-4 rounded-2xl border border-primary/30 bg-card px-6 py-5 glow-border"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15"
            >
              <FileText className="h-6 w-6 text-primary" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-display font-semibold text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.2 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20"
            >
              <Check className="h-4 w-4 text-primary" />
            </motion.div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
              }}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DropZone;
