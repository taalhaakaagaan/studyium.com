"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
    useEffect(() => {
        // Fire and forget visit recording
        // We use navigator.sendBeacon if available for better reliability on unload, 
        // but fetch is fine for mount.
        fetch('/api/record_visit.php', { method: 'POST' }).catch(err => console.error("Visit tracking failed", err));
    }, []);

    return null; // This component renders nothing
}
