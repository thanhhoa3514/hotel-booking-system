import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";

export default function RegisterPage() {
    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to create your account
                </p>
            </div>

            <div className="grid gap-6">
                <form>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                autoCorrect="off"
                            />
                        </div>
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
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoCapitalize="none"
                                autoComplete="new-password"
                            />
                        </div>
                        <Button className="w-full cursor-pointer">
                            Sign Up via Email
                        </Button>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-50 px-2 text-muted-foreground dark:bg-slate-950">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="cursor-pointer">
                        <Icons.google className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                    <Button variant="outline" className="cursor-pointer">
                        <Icons.github className="mr-2 h-4 w-4" />
                        GitHub
                    </Button>
                </div>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/auth/login"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Already have an account? Sign In
                </Link>
            </p>
        </div>
    );
}
