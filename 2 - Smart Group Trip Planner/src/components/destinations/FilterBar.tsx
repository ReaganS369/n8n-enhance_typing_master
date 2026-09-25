import React from 'react';
import { Search, ArrowUpDown, Filter, Eye, EyeOff, Scale, X } from 'lucide-react';

export type SortOption = 'compatibility' | 'newness' | 'travelTime' | 'temp' | 'budget';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  hideExcluded: boolean;
  setHideExcluded: (hide: boolean) => void;
  onOpenCompare: () => void;
  compareCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  selectedTag,
  setSelectedTag,
  hideExcluded,
  setHideExcluded,
  onOpenCompare,
  compareCount,
}) => {
  const tags = [
    'All',
    'Desert Safari',
    'Lakes & Palaces',
    'Living Fort',
    'Wildlife Safari',
    'Heritage Forts',
    'Adventure',
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
      {/* Search & Sort Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by city, state, or attraction..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Filter Options */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 w-full sm:w-auto justify-between sm:justify-start">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="compatibility">Compatibility Score</option>
              <option value="newness">Group Newness %</option>
              <option value="travelTime">Fastest Travel Time</option>
              <option value="temp">Weather / Temperature</option>
              <option value="budget">Daily Budget (Lowest)</option>
            </select>
          </div>

          {/* Toggle Excluded */}
          <button
            onClick={() => setHideExcluded(!hideExcluded)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              hideExcluded
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {hideExcluded ? <EyeOff className="w-3.5 h-3.5 text-teal-600" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>{hideExcluded ? 'Hiding Excluded' : 'Showing All'}</span>
          </button>

          {/* Compare Button */}
          {compareCount > 0 && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all whitespace-nowrap"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({compareCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {tags.map(tag => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
