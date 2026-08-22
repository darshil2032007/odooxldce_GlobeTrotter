import { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">GlobeTrotter</span>
          </Link>
        </div>

        {sent ? (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900">Check your email</h2>
            <p className="text-sm text-surface-500">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-surface-700">{email}</span>.
              Please check your inbox and spam folder.
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-surface-900">Forgot your password?</h2>
              <p className="mt-2 text-sm text-surface-500">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <p className="text-center text-sm text-surface-500">
              Remember your password?{" "}
              <Link to="/login" className="font-medium text-primary-500 hover:text-primary-600">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
