"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Download, BookOpen, Info, Laptop, Monitor } from 'lucide-react';

// Set worker to CDN
// Set worker to local path
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js?v=5.4.296';

interface PDFViewerProps {
    url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [scale, setScale] = useState(1.0);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    function onDocumentLoadError(error: Error) {
        console.error("PDF Load Error:", error);
        setErrorMsg(error.message);
    }

    return (
        <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" /> Ders Notu İçeriği
                </h3>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-background rounded-md transition-colors">-</button>
                    <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-2 hover:bg-background rounded-md transition-colors">+</button>
                </div>
            </div>

            <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-2 md:p-6 flex flex-col items-center overflow-auto max-h-[800px] custom-scrollbar shadow-inner group">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="max-w-full"
                    loading={<div className="flex flex-col items-center gap-4 p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div><span>PDF Yükleniyor...</span></div>}
                    error={
                        <div className="text-red-400 p-10 text-center bg-red-500/5 rounded-xl border border-red-500/10 flex flex-col gap-2">
                            <h4 className="font-semibold">PDF içeriği görüntülenemedi.</h4>
                            <p className="text-xs font-mono opacity-70 bg-black/20 p-2 rounded">{errorMsg || "Detaylı hata bilgisi bekleniyor..."}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">URL: {url}</p>
                        </div>
                    }
                >
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                        <div key={`page_${index + 1}`} className="mb-6 shadow-2xl relative">
                            <Page
                                pageNumber={index + 1}
                                scale={scale}
                                width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 80 : 800)}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="rounded-lg overflow-hidden"
                            />
                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                Sayfa {index + 1} / {numPages}
                            </div>
                        </div>
                    ))}
                </Document>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3 text-sm text-primary/80">
                <Info className="w-5 h-5 shrink-0" />
                <p>Güvenlik nedeniyle dökümanları sadece tarayıcı üzerinden inceleyebilirsiniz. İndirme işlemi kısıtlanmıştır.</p>
            </div>
        </div>
    );
}
