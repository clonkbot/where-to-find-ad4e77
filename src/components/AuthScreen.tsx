import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn"
        ? "Invalid email or password"
        : "Could not create account. Email may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 grain-overlay">
      <div className="w-full max-w-md animate-scaleIn">
        {/* Logo/Brand */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl card-depth mb-4 md:mb-6">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">where to find</h1>
          <p className="text-stone-500 text-sm md:text-base">A calm space for organizing your things</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 card-depth">
          <h2 className="font-serif text-xl md:text-2xl text-charcoal mb-6">
            {flow === "signIn" ? "Welcome back" : "Create your space"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input-zen"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={flow === "signIn" ? "current-password" : "new-password"}
                className="input-zen"
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm animate-fadeIn">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                flow === "signIn" ? "Sign in" : "Create account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
              className="w-full text-center text-stone-500 hover:text-charcoal transition-colors text-sm"
            >
              {flow === "signIn"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Anonymous access */}
        <div className="mt-6 text-center">
          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="btn-ghost text-sm"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
