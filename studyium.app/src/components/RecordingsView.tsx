"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Video, FileVideo, Clock } from "lucide-react";

export function RecordingsView() {
    const [recordings, setRecordings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecordings();
    }, []);

    const loadRecordings = async () => {
        if ((window as any).electron) {
            const res = await (window as any).electron.invoke('app:list-recordings');
            if (res.success) {
                setRecordings(res.recordings);
            }
        }
        setLoading(false);
    };

    const handleOpenFolder = (path: string) => {
        if ((window as any).electron) {
            (window as any).electron.invoke('app:open-folder', path);
        }
    };

    const formatSize = (bytes: number) => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Downloaded Lessons</h1>
            <p className="text-muted-foreground">Local recordings extracted from your live sessions (saved in Downloads folder).</p>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : recordings.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
                            <Video className="w-12 h-12 mb-4 opacity-20" />
                            <p>No recordings found.</p>
                            <p className="text-sm">Recordings start with "Studyium-Lesson-" in your Downloads folder.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recordings.map((file) => (
                                <div key={file.path} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                            <FileVideo size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium truncate max-w-[300px]">{file.name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(file.created).toLocaleString()}
                                                </span>
                                                <span>•</span>
                                                <span>{formatSize(file.size)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleOpenFolder(file.path)}
                                        className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors flex items-center gap-2 text-sm"
                                        title="Show in Folder"
                                    >
                                        <FolderOpen size={16} />
                                        Show in Folder
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
