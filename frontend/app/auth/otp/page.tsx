import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OTPPage() {
    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Verify Your Email
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to your email
                </p>
            </div>

            <div className="grid gap-6">
                <form>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                placeholder="123456"
                                type="text"
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                            />
                        </div>
                        <Button className="w-full cursor-pointer">
                            Verify
                        </Button>
                    </div>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Didn&apos;t receive the code?{" "}
                    <button className="underline underline-offset-4 hover:text-primary cursor-pointer">
                        Resend
                    </button>
                </p>
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
