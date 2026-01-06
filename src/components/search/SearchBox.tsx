"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

interface Suggestion {
  text: string;
  type: 'product' | 'category' | 'synonym';
  icon: string;
}

export function SearchBox({ className, placeholder = "Search products...", onSearch }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      const data = await response.json();

      if (data.suggestions) {
        const formattedSuggestions: Suggestion[] = data.suggestions.map(
          (text: string, idx: number) => ({
            text,
            type: idx < 3 ? 'product' : idx < 6 ? 'category' : 'synonym',
            icon: idx < 3 ? '🛍️' : idx < 6 ? '📦' : '🔍',
          })
        );
        setSuggestions(formattedSuggestions);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex].text);
        } else if (query) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onSearch?.(query);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    onSearch?.(suggestion);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
        />

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={18} />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, idx) => (
            <button
              key={`${suggestion.text}-${idx}`}
              onClick={() => handleSelectSuggestion(suggestion.text)}
              className={cn(
                "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors",
                selectedIndex === idx && "bg-amber-50"
              )}
            >
              <span className="text-lg">{suggestion.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-sm">{suggestion.text}</p>
                <p className="text-xs text-gray-500">
                  {suggestion.type === 'product'
                    ? 'Product'
                    : suggestion.type === 'category'
                    ? 'Category'
                    : 'Suggestion'}
                </p>
              </div>
            </button>
          ))}

          {query && (
            <button
              onClick={handleSearch}
              className="w-full px-4 py-3 text-left border-t border-gray-200 font-medium text-amber-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Search size={16} />
              Search for "{query}"
            </button>
          )}
        </div>
      )}

      {query && isOpen && isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-600">
          Loading suggestions...
        </div>
      )}
    </div>
  );
}
