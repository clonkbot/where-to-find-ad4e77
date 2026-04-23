import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { LocationsList } from "./LocationsList";
import { ContainerView } from "./ContainerView";
import { SearchResults } from "./SearchResults";

type View =
  | { type: "locations" }
  | { type: "location"; id: Id<"locations"> }
  | { type: "container"; id: Id<"containers">; locationId: Id<"locations"> };

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [view, setView] = useState<View>({ type: "locations" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchResults = useQuery(
    api.items.search,
    isSearching && searchTerm.length >= 2 ? { searchTerm } : "skip"
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(term.length >= 2);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <button
              onClick={() => { setView({ type: "locations" }); clearSearch(); }}
              className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <span className="font-serif text-lg md:text-xl text-charcoal hidden sm:block">where to find</span>
            </button>

            {/* Search - Desktop */}
            <div className="hidden md:block flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for items..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border-0 rounded-lg text-sm placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-terracotta/20 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile search toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

              <button
                onClick={() => signOut()}
                className="btn-ghost text-sm"
              >
                <span className="hidden sm:inline">Sign out</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pb-1 animate-fadeIn">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for items..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border-0 rounded-lg text-sm placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-terracotta/20 transition-all"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-6 md:py-8">
        {isSearching ? (
          <SearchResults
            results={searchResults}
            searchTerm={searchTerm}
            onSelectItem={(containerId, locationId) => {
              setView({ type: "container", id: containerId, locationId });
              clearSearch();
            }}
          />
        ) : view.type === "locations" ? (
          <LocationsList
            onSelectLocation={(id) => setView({ type: "location", id })}
          />
        ) : view.type === "location" ? (
          <ContainerView
            locationId={view.id}
            containerId={null}
            onBack={() => setView({ type: "locations" })}
            onSelectContainer={(id) => setView({ type: "container", id, locationId: view.id })}
          />
        ) : (
          <ContainerView
            locationId={view.locationId}
            containerId={view.id}
            onBack={() => setView({ type: "location", id: view.locationId })}
            onSelectContainer={(id) => setView({ type: "container", id, locationId: view.locationId })}
          />
        )}
      </main>
    </div>
  );
}
