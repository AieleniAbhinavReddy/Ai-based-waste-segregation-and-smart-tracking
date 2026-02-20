import React, { useRef, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Camera, Loader2, Leaf, Recycle, Trash2, CheckCircle, RotateCcw, Info } from "lucide-react";
import { classifyWaste, validateImageForClassification, type ClassificationResult } from "@/lib/ml-integration";

const categoryConfig = {
  organic: { icon: Leaf, color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/40", label: "Organic / Biodegradable" },
  recyclable: { icon: Recycle, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/40", label: "Recyclable" },
  "non-recyclable": { icon: Trash2, color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/40", label: "Non-Recyclable" },
};

const WasteClassification: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);

    const validation = validateImageForClassification(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Classify
    setLoading(true);
    try {
      const res = await classifyWaste(file);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Classification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const catInfo = result ? categoryConfig[result.category] : null;
  const CatIcon = catInfo?.icon || Recycle;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Classify Waste</h1>
          <p className="text-muted-foreground mt-1">
            Upload a photo to identify waste type and get proper disposal guidance
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">AI Powered</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Card */}
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Camera className="w-5 h-5" /> Upload Image</CardTitle>
            <CardDescription>Drag & drop or click to select a waste image</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-green-500/60 transition-colors min-h-[260px] flex flex-col items-center justify-center"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-56 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-slate-400 text-sm">Click or drag an image here</p>
                  <p className="text-slate-500 text-xs mt-1">JPEG, PNG, WebP — max 5 MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>

            {preview && (
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-1" /> New Image
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card className="bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Info className="w-5 h-5" /> Classification Result</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[260px]">
            {loading ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-green-400 mx-auto mb-3" />
                <p className="text-slate-400">Analyzing waste image…</p>
              </div>
            ) : result && catInfo ? (
              <div className="w-full space-y-4">
                {/* Category badge */}
                <div className={`flex items-center gap-3 p-4 rounded-xl ${catInfo.bg} ${catInfo.border} border`}>
                  <CatIcon className={`w-8 h-8 ${catInfo.color}`} />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Category</p>
                    <p className={`text-lg font-bold ${catInfo.color}`}>{catInfo.label}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">Detected Class</p>
                    <p className="text-white font-semibold capitalize">{result.detailedClass}</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">Confidence</p>
                    <p className="text-white font-semibold">{result.confidence}%</p>
                  </div>
                </div>

                {result.processingTime && (
                  <p className="text-xs text-slate-500 text-center">Processed in {result.processingTime} ms</p>
                )}

                {/* Disposal */}
                <div className="bg-slate-800/60 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">Disposal: {result.disposalMethod}</span>
                  </div>
                  {result.tips?.map((tip, i) => (
                    <p key={i} className="text-sm text-slate-400 ml-6">• {tip}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <Recycle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>Upload an image to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WasteClassification;
