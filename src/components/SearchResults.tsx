import { Id } from "../../convex/_generated/dataModel";

interface SearchResult {
  _id: Id<"items">;
  name: string;
  description?: string;
  quantity?: number;
  path: string;
  containerId: Id<"containers">;
  locationId: Id<"locations">;
}

interface SearchResultsProps {
  results: SearchResult[] | null | undefined;
  searchTerm: string;
  onSelectItem: (containerId: Id<"containers">, locationId: Id<"locations">) => void;
}

export function SearchResults({ results, searchTerm, onSelectItem }: SearchResultsProps) {
  if (results === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 md:mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
          Search results for "{searchTerm}"
        </h2>
        <p className="text-stone-500 mt-1 text-sm md:text-base">
          {results && results.length > 0
            ? `Found ${results.length} item${results.length === 1 ? "" : "s"}`
            : "No items found"
          }
        </p>
      </div>

      {results && results.length > 0 ? (
        <div className="bg-white rounded-xl card-depth overflow-hidden">
          <div className="divide-y divide-stone-100">
            {results.map((item, idx) => (
              <button
                key={item._id}
                onClick={() => onSelectItem(item.containerId, item.locationId)}
                className="w-full p-4 md:p-5 hover:bg-stone-50 transition-colors text-left animate-fadeIn"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-sage-light/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-charcoal">{item.name}</span>
                      {item.quantity && item.quantity > 1 && (
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-stone-500 text-sm mt-0.5 line-clamp-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="truncate">{item.path}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-stone-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 md:py-16">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="font-serif text-lg md:text-xl text-charcoal mb-2">No items found</h3>
          <p className="text-stone-500 max-w-md mx-auto text-sm md:text-base">
            Try searching with different keywords or add the item you're looking for
          </p>
        </div>
      )}
    </div>
  );
}
