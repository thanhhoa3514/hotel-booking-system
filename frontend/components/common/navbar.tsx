"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, LogOut, User, Settings } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

export function Navbar() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();

    // Get user initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        toast.success("Đăng xuất thành công!");
        router.push("/");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt="Stayzy Logo"
                            className="h-10 w-10 object-contain"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-coral-500 to-teal-500 bg-clip-text text-transparent hidden sm:inline-block">
                            Stayzy
                        </span>
                    </Link>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                                    <Avatar className="h-9 w-9 border border-slate-200">
                                        <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
                                        <AvatarFallback className="bg-blue-600 text-white">
                                            {getInitials(user.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Hồ sơ</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/bookings")}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Đặt phòng của tôi</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Cài đặt</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login">
                                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                                    Đăng ký
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

