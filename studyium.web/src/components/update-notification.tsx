"use client";

import { useEffect, useState } from 'react';
import { RefreshCw } from "lucide-react";

export function UpdateNotification() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    useEffect(() => {
        // Only run in Electron environment
        if (window.require) {
            const { ipcRenderer } = window.require('electron');

            ipcRenderer.on('update_available', () => {
                setUpdateAvailable(true);
            });

            ipcRenderer.on('update_downloaded', () => {
                setDownloaded(true);
            });

            return () => {
                ipcRenderer.removeAllListeners('update_available');
                ipcRenderer.removeAllListeners('update_downloaded');
            };
        }
    }, []);

    const restartApp = () => {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('app:restart-app');
        }
    };

    if (!updateAvailable && !downloaded) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-card border border-border shadow-2xl p-4 rounded-xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
            <div className={`p-2 rounded-full ${downloaded ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                <RefreshCw className={`h-6 w-6 ${!downloaded ? 'animate-spin' : ''}`} />
            </div>
            <div>
                <h4 className="font-bold text-sm">Update {downloaded ? 'Ready' : 'Available'}</h4>
                <p className="text-xs text-muted-foreground">
                    {downloaded ? 'Restart to apply new version.' : 'Downloading new version...'}
                </p>
            </div>
            {downloaded && (
                <button
                    onClick={restartApp}
                    className="ml-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                    Restart
                </button>
            )}
        </div>
    );
}
