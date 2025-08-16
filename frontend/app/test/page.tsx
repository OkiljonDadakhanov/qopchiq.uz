"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
    const { user, isAuthenticated, loading } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Test Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
                        <p><strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}</p>
                        <p><strong>User:</strong> {user ? user.email : "None"}</p>
                    </div>

                    <Button
                        onClick={() => window.location.href = "/dashboard"}
                        className="w-full"
                    >
                        Go to Dashboard
                    </Button>

                    <Button
                        onClick={() => window.location.href = "/"}
                        variant="outline"
                        className="w-full"
                    >
                        Go to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
