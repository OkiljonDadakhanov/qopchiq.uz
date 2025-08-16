"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

export default function ProtectedRoute({
    children,
    requireAuth = true
}: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && requireAuth && !isAuthenticated) {
            router.push("/auth");
        }
    }, [isAuthenticated, loading, requireAuth, router]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If auth is required and user is not authenticated, don't render children
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    // If auth is not required or user is authenticated, render children
    return <>{children}</>;
}
