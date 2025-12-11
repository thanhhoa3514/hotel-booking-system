import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Forgot Password
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email to receive a password reset link
                </p>
            </div>

            <div className="grid gap-6">
                <form>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                            />
                        </div>
                        <Button className="w-full cursor-pointer">
                            Send Reset Link
                        </Button>
                    </div>
                </form>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/auth/login"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Back to Login
                </Link>
            </p>
        </div>
    );
}
