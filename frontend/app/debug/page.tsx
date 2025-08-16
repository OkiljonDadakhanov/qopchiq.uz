"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function DebugPage() {
    const { user, loading, isAuthenticated, login, logout } = useAuth();
    const [localStorageData, setLocalStorageData] = useState<any>({});

    useEffect(() => {
        // Get localStorage data
        const authToken = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('qopchiq_user');

        setLocalStorageData({
            authToken,
            userData: userData ? JSON.parse(userData) : null,
        });
    }, []);

    const clearAllData = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('qopchiq_user');
        window.location.reload();
    };

    const testDemoLogin = async () => {
        try {
            await login('demo@qopchiq.uz', 'demo123');
        } catch (error) {
            console.error('Demo login failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Debug Page</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Auth State */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
                        <div className="space-y-2">
                            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                            <p><strong>User:</strong> {user ? user.email : 'None'}</p>
                        </div>

                        <div className="mt-4 space-y-2">
                            <Button onClick={testDemoLogin} className="w-full">
                                Test Demo Login
                            </Button>
                            <Button onClick={logout} variant="outline" className="w-full">
                                Logout
                            </Button>
                            <Button onClick={clearAllData} variant="destructive" className="w-full">
                                Clear All Data
                            </Button>
                        </div>
                    </div>

                    {/* LocalStorage Data */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">LocalStorage Data</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            {JSON.stringify(localStorageData, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-8">
                    <Button onClick={() => window.location.href = '/'} className="mr-4">
                        Go to Home
                    </Button>
                    <Button onClick={() => window.location.href = '/auth'} variant="outline">
                        Go to Auth
                    </Button>
                </div>
            </div>
        </div>
    );
}
