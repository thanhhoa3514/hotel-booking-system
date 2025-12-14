"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
import { Calendar, LogOut, User, Settings, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { href: "/", label: "Trang chủ" },
    { href: "/rooms", label: "Phòng" },
    { href: "/services", label: "Dịch vụ" },
    { href: "/contact", label: "Liên hệ" },
];

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
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
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hidden sm:inline-block">
                            Stayzy
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-orange-600",
                                isActive(link.href)
                                    ? "text-orange-600"
                                    : "text-slate-600 dark:text-slate-300"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Book Now CTA - Desktop */}
                    <Link href="/rooms" className="hidden md:block">
                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 cursor-pointer">
                            Đặt phòng ngay
                        </Button>
                    </Link>

                    <ThemeToggle />

                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                                    <Avatar className="h-9 w-9 border border-slate-200">
                                        <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
                                        <AvatarFallback className="bg-orange-600 text-white">
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
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/auth/login">
                                <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer">
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer">
                                    Đăng ký
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-in slide-in-from-top-2">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "block py-2 text-sm font-medium transition-colors",
                                    isActive(link.href)
                                        ? "text-orange-600"
                                        : "text-slate-600 dark:text-slate-300"
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                            {!isAuthenticated && (
                                <>
                                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full border-orange-500 text-orange-600">
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                                            Đăng ký
                                        </Button>
                                    </Link>
                                </>
                            )}
                            <Link href="/rooms" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                    Đặt phòng ngay
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

