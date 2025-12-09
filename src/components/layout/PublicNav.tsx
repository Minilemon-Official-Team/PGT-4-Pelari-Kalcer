import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  return (
    <nav className="w-full border-b border-slate-200 bg-(--surface)/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-(--text-primary)">
          RunCam
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link to="/login">
            <Button variant="ghost" className="text-(--text-primary)">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-(--accent) text-(--surface) hover:bg-(--accent-strong)">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
