"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    LayoutDashboard,
    Calendar,
    BedDouble,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Bell,
    Search,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/common/theme-toggle";

const navItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Đặt phòng",
        href: "/admin/bookings",
        icon: Calendar,
    },
    {
        title: "Quản lý phòng",
        href: "/admin/rooms",
        icon: BedDouble,
    },
    {
        title: "Khách hàng",
        href: "/admin/customers",
        icon: Users,
    },
    {
        title: "Cài đặt",
        href: "/admin/settings",
        icon: Settings,
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuthStore();

    // Check auth and role
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        const allowedRoles = ["ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING"];
        if (user?.role?.name && !allowedRoles.includes(user.role.name)) {
            toast.error("Bạn không có quyền truy cập trang này");
            router.push("/");
        }
    }, [isAuthenticated, user, router]);

    const handleLogout = () => {
        logout();
        toast.success("Đăng xuất thành công!");
        router.push("/auth/login");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex h-16 items-center justify-between px-6">
                    {/* Logo */}
                    <Link href="/admin" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Stayzy" className="h-10 w-10" />
                        <div className="flex flex-col">
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Stayzy Admin
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Quản lý khách sạn
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border-0 focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="relative rounded-xl">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                3
                            </span>
                        </Button>
                        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                            <Avatar className="h-9 w-9 border-2 border-blue-500/20">
                                <AvatarImage src={user.avatarUrl || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm">
                                    {getInitials(user.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium">{user.fullName}</p>
                                <p className="text-xs text-muted-foreground">{user.role?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Floating Navigation Block */}
                <aside className="fixed left-4 top-24 z-30">
                    <div className="w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-4">
                        {/* Nav Items */}
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== "/admin" && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                            isActive
                                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "h-5 w-5 transition-transform group-hover:scale-110",
                                            isActive && "text-white"
                                        )} />
                                        <span className="font-medium">{item.title}</span>
                                        {isActive && (
                                            <ChevronRight className="h-4 w-4 ml-auto" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Divider */}
                        <div className="my-4 border-t border-slate-200/50 dark:border-slate-700/50" />

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 group"
                        >
                            <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium">Đăng xuất</span>
                        </button>

                        {/* Stats Card */}
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-100 dark:border-blue-900/50">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Hôm nay
                            </p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                                12 đặt phòng
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                +3 so với hôm qua
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-72 p-6">
                    <div className="max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
