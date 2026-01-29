"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Download } from 'lucide-react';

// Set worker to CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Download className="h-6 w-6 text-primary" /> Ders Notu Dosyası
            </h3>

            <div className="bg-white/5 rounded-xl border border-white/10 p-4 md:p-8 flex flex-col items-center min-h-[500px]">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="max-w-full"
                    loading={<div className="text-center p-8">PDF Yükleniyor...</div>}
                    error={<div className="text-red-400 p-8">PDF yüklenemedi. Linkten indirmeyi deneyin.</div>}
                >
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                        <div key={`page_${index + 1}`} className="mb-4 shadow-lg">
                            <Page
                                pageNumber={index + 1}
                                width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 64 : 800)}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </div>
                    ))}
                </Document>
            </div>

            <div className="mt-6 text-center">
                <a
                    href={url}
                    download
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-transform hover:scale-105"
                >
                    <Download className="h-5 w-5" /> PDF İndir
                </a>
            </div>
        </div>
    );
}
