import { Suspense } from "react";
import { UserDetailClient } from "./client";

export default function UserDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserDetailClient />
        </Suspense>
    );
}
