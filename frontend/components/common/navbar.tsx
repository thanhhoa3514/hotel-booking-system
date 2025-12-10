"use client";

import Link from "next/link";
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
import { Calendar, LogOut, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
    // Mock user state - in real app this would come from AuthContext
    // const user = {
    //     name: "John Doe",
    //     email: "john@example.com",
    //     avatar: "https://github.com/shadcn.png",
    // };
    const user = null; // Mocking logged out state for now to show Login button as requested

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">H</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:inline-block">
                            HotelPro
                        </span>
                    </Link>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                                    <Avatar className="h-9 w-9 border border-slate-200">
                                        <AvatarImage src={user} alt={user} />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>My Bookings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login">
                                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
