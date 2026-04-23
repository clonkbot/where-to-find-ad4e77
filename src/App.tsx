import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import "./styles.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-full border-2 border-terracotta/30 border-t-terracotta animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {isAuthenticated ? <Dashboard /> : <AuthScreen />}
      <footer className="py-4 text-center">
        <p className="text-xs text-stone-400 tracking-wide">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
