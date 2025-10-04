'use client';

interface QuickFiltersProps {
  onFilterClick: (query: string) => void;
}

const filters = [
  { label: '🟨 JavaScript', query: 'I want to make my first JavaScript PR' },
  { label: '🐍 Python', query: 'Help me find easy Python issues' },
  { label: '⚛️ React', query: 'I want to contribute to React' },
  { label: '🦀 Rust', query: 'Show me beginner Rust issues' },
  { label: '🔥 Popular', query: 'Show popular unassigned issues' },
  { label: '✨ Easy', query: 'Find the easiest issues for beginners' },
];

export function QuickFilters({ onFilterClick }: QuickFiltersProps) {
  return (
    <div className="p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-white/40 backdrop-blur-sm">
      <p className="text-xs text-gray-700 mb-3 font-bold tracking-wide uppercase">🎯 Ready for your first PR? Try these:</p>
      <div className="flex flex-wrap gap-2.5">
        {filters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => onFilterClick(filter.query)}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 text-sm font-semibold rounded-full border border-white/60 hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

