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
    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
      <p className="text-xs text-gray-600 mb-2 font-medium">🎯 Ready for your first PR? Try these:</p>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => onFilterClick(filter.query)}
            className="px-3 py-1.5 bg-white text-gray-700 text-sm rounded-full border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all hover:shadow-sm"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

