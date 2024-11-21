import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Event } from '../types';
import { pushToDataLayer } from '../utils/gtm';

interface EventListProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({ events, selectedEvent, onEventSelect }) => {
  const handleEventSelect = (event: Event) => {
    pushToDataLayer({
      event: 'event_selected',
      eventName: event.eventName,
      eventDate: event.dateTime,
      eventLocation: event.location,
      isArchived: event.isArchived
    });
    onEventSelect(event);
  };

  if (events.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Brak wydarzeń do wyświetlenia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="space-y-2 p-4">
          {events.map(event => (
            <div
              key={event.id}
              className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedEvent?.id === event.id 
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => handleEventSelect(event)}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                  {event.eventName}
                </h3>
                {event.isArchived && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                    Archiwalne
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{event.dateTime}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventList;