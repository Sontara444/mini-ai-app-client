'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Image as ImageIcon, AlertCircle, Download, X, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/personalize`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.result && Array.isArray(data.result) && data.result.length > 0) {
        setResultUrl(data.result[0]);
      } else if (data.result && typeof data.result === 'string') {
        setResultUrl(data.result);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err: any) {
      console.error(err);
      if (err.message === 'PAYMENT_REQUIRED') {
        setError({
          title: 'Insufficient Credits',
          message: 'The AI model requires credits to run. Please add a payment method to your Replicate account.',
        });
      } else {
        setError({
          title: 'Generation Failed',
          message: err.message || 'Something went wrong. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden text-zinc-100 selection:bg-purple-500/30">

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-float"
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-600/10 blur-[100px] animate-pulse"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center gap-12">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-zinc-300">Next-Gen AI Portraits</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Little Portrait AI
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Turn ordinary photos into magical watercolor illustrations in seconds.
          </p>
        </motion.div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div
              className={cn(
                "glass-card rounded-3xl p-8 transition-all duration-300 border-dashed border-2",
                isDragging ? "border-purple-500 bg-purple-500/10 scale-[1.02]" : "border-white/10 hover:border-white/20"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="h-64 flex flex-col items-center justify-center text-center gap-4 relative">
                {previewUrl ? (
                  <motion.div
                    layoutId="preview"
                    className="relative w-full h-full rounded-2xl overflow-hidden group"
                  >
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => {
                          setPreviewUrl(null);
                          setSelectedFile(null);
                          setResultUrl(null);
                        }}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-white"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-2">
                      <Upload className="w-8 h-8 text-zinc-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-white">Drag & drop your photo here</p>
                      <p className="text-sm text-zinc-500">or click to browse files</p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                  </>
                )}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4"
                >
                  <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-200">{error.title}</h4>
                    <p className="text-sm text-red-200/80 mt-1">{error.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleGenerate}
              disabled={!selectedFile || loading}
              className={cn(
                "relative group overflow-hidden w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]",
                !selectedFile || loading
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:scale-[1.02] hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.5)]"
              )}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Magic...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>Generate Artwork</span>
                  </>
                )}
              </div>
            </button>
          </motion.div>

          <div className="relative min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {resultUrl ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-full"
                >
                  <div className="glass-card p-2 rounded-3xl border border-white/20 shadow-2xl relative group">

                    <div className="relative aspect-[3/4] md:aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900">
                      <Image
                        src={resultUrl}
                        alt="Generated Result"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <a
                            href={resultUrl}
                            target="_blank"
                            rel="noreferrer"
                            download="protrait-ai.png"
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-6"
                  >
                    <p className="text-zinc-400 text-sm">✨ "Watercolor illustration portrait"</p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                      <ImageIcon className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 font-medium">Your masterpiece will appear here</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </main>
  );
}
