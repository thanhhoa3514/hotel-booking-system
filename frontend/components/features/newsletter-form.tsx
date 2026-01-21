"use client";

import * as React from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewsletterFormProps {
    className?: string;
}

export function NewsletterForm({ className }: NewsletterFormProps) {
    const [email, setEmail] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSubscribed, setIsSubscribed] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes("@")) {
            toast.error("Vui lòng nhập email hợp lệ");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);
        setIsSubscribed(true);
        setEmail("");
        toast.success("Đăng ký thành công! Cảm ơn bạn đã theo dõi Stayzy.");

        // Reset after 3 seconds
        setTimeout(() => setIsSubscribed(false), 3000);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto",
                className
            )}
        >
            <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isSubscribed}
                    className={cn(
                        "pl-10 h-12 bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700",
                        "focus:border-orange-500 focus:ring-orange-500/20",
                        "placeholder:text-slate-400"
                    )}
                />
            </div>
            <Button
                type="submit"
                disabled={isLoading || isSubscribed}
                className={cn(
                    "h-12 px-6 cursor-pointer",
                    "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
                    "shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40",
                    "transition-all duration-300",
                    isSubscribed && "bg-green-500 hover:bg-green-500 from-green-500 to-green-500"
                )}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSubscribed ? (
                    <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Đã đăng ký
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5 mr-2" />
                        Đăng ký
                    </>
                )}
            </Button>
        </form>
    );
}
