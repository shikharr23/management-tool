import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function NavbarLanding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xs border-b border-gray-200 py-3 shadow-xs"
          : "bg-white border-b border-gray-100 py-4"
      }`}
    >
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-gray-900 no-underline group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-md py-1 px-1.5"
          aria-label="Project Manager Home"
        >
          <div className="w-8 h-8 rounded-md bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-gray-800 transition-colors">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          </div>
          <span className="text-[19px] font-bold text-gray-900 tracking-tight">
            Project Manager
          </span>
        </Link>

        {/* Desktop Product Navigation */}
        <nav
          className="hidden md:flex items-center gap-7"
          aria-label="Main Navigation"
        >
          <a
            href="#features"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-sm py-1 px-1.5"
          >
            Features
          </a>
          <a
            href="#workflow"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-sm py-1 px-1.5"
          >
            Workflow
          </a>
          <a
            href="#collaboration"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-sm py-1 px-1.5"
          >
            Collaboration
          </a>
        </nav>

        {/* Auth / Action CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="py-2 px-4 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Go to Dashboard →
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 py-2 px-3 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="py-2 px-4 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-700 hover:text-gray-900 py-2 px-2 rounded-md hover:bg-gray-50"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-700 hover:text-gray-900 py-2 px-2 rounded-md hover:bg-gray-50"
            >
              Workflow
            </a>
            <a
              href="#collaboration"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-gray-700 hover:text-gray-900 py-2 px-2 rounded-md hover:bg-gray-50"
            >
              Collaboration
            </a>
          </nav>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full py-2.5 px-4 text-center bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800"
              >
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-3 text-center border border-gray-300 text-gray-800 text-sm font-semibold rounded-md hover:bg-gray-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 text-center bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
