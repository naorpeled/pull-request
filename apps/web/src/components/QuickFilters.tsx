'use client';

interface QuickFiltersProps {
  onFilterClick: (query: string) => void;
}

const filters = [
  { label: '🟨 JavaScript', query: 'I want to make my first JavaScript PR', color: 'from-yellow-400 to-orange-400' },
  { label: '🐍 Python', query: 'Help me find easy Python issues', color: 'from-blue-400 to-cyan-400' },
  { label: '⚛️ React', query: 'I want to contribute to React', color: 'from-cyan-400 to-blue-500' },
  { label: '🦀 Rust', query: 'Show me beginner Rust issues', color: 'from-orange-500 to-red-500' },
  { label: '🔥 Popular', query: 'Show popular unassigned issues', color: 'from-pink-500 to-rose-500' },
  { label: '✨ Easy', query: 'Find the easiest issues for beginners', color: 'from-green-400 to-emerald-500' },
];

export function QuickFilters({ onFilterClick }: QuickFiltersProps) {
  return (
    <div className="backdrop-blur-xl bg-white/70 border-t border-white/20 px-4 py-3">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
          🎯 Quick Start
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => onFilterClick(filter.query)}
            className={`
              group relative px-4 py-2 bg-gradient-to-r ${filter.color} 
              text-white text-sm font-bold rounded-lg
              hover:shadow-lg hover:shadow-${filter.color}/50 hover:-translate-y-0.5 
              active:translate-y-0 transition-all duration-200
              whitespace-nowrap flex-shrink-0
              before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-t 
              before:from-black/20 before:to-transparent before:opacity-0 
              hover:before:opacity-100 before:transition-opacity
            `}
          >
            <span className="relative z-10">{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

