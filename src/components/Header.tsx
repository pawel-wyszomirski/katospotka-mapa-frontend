import React from 'react';
import { Calendar, Archive } from 'lucide-react';

interface HeaderProps {
  showArchived: boolean;
  onToggleArchived: (show: boolean) => void;
  totalEvents: number;
  archivedEvents: number;
}

const Header: React.FC<HeaderProps> = ({
  showArchived,
  onToggleArchived,
  totalEvents,
  archivedEvents
}) => {
  return (
    <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Wydarzenia w Katowicach
        </h1>
        <span className="text-sm text-gray-500">
          {showArchived
            ? `Archiwalne (${archivedEvents})`
            : `Aktywne (${totalEvents - archivedEvents})`}
        </span>
      </div>

      <button
        onClick={() => onToggleArchived(!showArchived)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${
          showArchived
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
      >
        <Archive className="w-4 h-4" />
        <span>{showArchived ? 'Pokaż aktualne' : 'Pokaż archiwalne'}</span>
      </button>
    </div>
  );
};

export default Header;