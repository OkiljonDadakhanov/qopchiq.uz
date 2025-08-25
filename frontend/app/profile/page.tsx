"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    User,
    Settings,
    Award,
    Edit,
    Save,
    X,
} from "lucide-react";

import { Navigation } from "@/components/navigation";

export default function ProfilePage() {
    const { user, isAuthenticated, loading } = useAuth();

    // State for data
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<any>(null);

    // Load data on mount and when user changes
    useEffect(() => {
        if (isAuthenticated && user) {
            setEditedUser({ ...user });
            setIsLoading(false);
        } else if (isAuthenticated && !loading) {
            setIsLoading(false);
        }
    }, [isAuthenticated, user, loading]);

    // Handle save changes
    const handleSaveChanges = async () => {
        if (!user?._id) return;

        try {
            // Here you would typically call an API to update the user profile
            // For now, we'll just close the editing mode
            setIsEditing(false);
            // You could add a toast notification here for success
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    // Handle cancel editing
    const handleCancelEditing = () => {
        setEditedUser({ ...user });
        setIsEditing(false);
    };

    // Loading state
    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Not Authenticated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You need to be logged in to access your profile.</p>
                        <Button
                            onClick={() => window.location.href = "/"}
                            className="w-full mt-4"
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const language = user.language || "uz";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
            {/* Sidebar Navigation */}
            <Navigation language={language} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                                <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
                            </div>
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            onClick={handleSaveChanges}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </Button>
                                        <Button
                                            onClick={handleCancelEditing}
                                            variant="outline"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedUser?.firstName || ""}
                                            onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        />
                                    ) : (
                                        <p className="text-lg">{user.firstName} {user.lastName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-lg">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Username</label>
                                    <p className="text-lg">{user.username || "Not set"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Language</label>
                                    {isEditing ? (
                                        <select
                                            value={editedUser?.language || "uz"}
                                            onChange={(e) => setEditedUser({ ...editedUser, language: e.target.value })}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="uz">O'zbekcha</option>
                                            <option value="en">English</option>
                                        </select>
                                    ) : (
                                        <p className="text-lg capitalize">{user.language}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preferences */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Currency</label>
                                    <p className="text-lg">{user.preferences?.currency || "UZS"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Theme</label>
                                    <p className="text-lg capitalize">{user.preferences?.theme || "light"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Notifications</label>
                                    <p className="text-lg">{user.preferences?.notifications ? "Enabled" : "Disabled"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Daily Reminders</label>
                                    <p className="text-lg">{user.preferences?.dailyReminder ? "Enabled" : "Disabled"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Financial Information */}
                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-sm text-green-600 font-medium">Current Balance</div>
                                        <div className="text-2xl font-bold text-green-700">
                                            {user.currentBalance?.toLocaleString() || "0"} UZS
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-blue-600 font-medium">Monthly Limit</div>
                                        <div className="text-2xl font-bold text-blue-700">
                                            {user.monthlyLimit?.toLocaleString() || "0"} UZS
                                        </div>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <div className="text-sm text-purple-600 font-medium">Account Level</div>
                                        <div className="text-2xl font-bold text-purple-700">
                                            {user.level || 1}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Achievements */}
                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Achievements & Badges
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.badges && user.badges.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {user.badges.map((badge, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm">
                                                {badge}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        <div className="text-4xl mb-2">🏆</div>
                                        <p className="text-lg font-medium text-gray-900 mb-2">No badges earned yet</p>
                                        <p className="text-gray-600">Keep using the app to earn achievements!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Account Statistics */}
                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{user.coins || 0}</div>
                                        <div className="text-sm text-gray-600">Coins Earned</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{user.streak || 0}</div>
                                        <div className="text-sm text-gray-600">Day Streak</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                        </div>
                                        <div className="text-sm text-gray-600">Member Since</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "N/A"}
                                        </div>
                                        <div className="text-sm text-gray-600">Last Login</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
