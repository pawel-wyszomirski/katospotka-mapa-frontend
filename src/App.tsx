import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import EventMap from './components/EventMap';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import Header from './components/Header';
import { Event } from './types';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRmp1P1Nn9S9s2n2kVPBw4_E4HJ80XdNKnhRO62o4OcxUCCw69-pJSQ8IMEChC4LTky5vE2oxso__XX/pub?gid=1403610803&single=true&output=csv';
        
        const response = await fetch(SHEET_URL, {
          headers: {
            'Accept': 'text/csv',
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        if (!csvText.trim()) {
          throw new Error('Otrzymano pustą odpowiedź z Google Sheets');
        }

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }

            const processedEvents = results.data
              .filter((row: any) => {
                const hasRequiredFields = 
                  row['Nazwa wydarzenia']?.trim() && 
                  row['Data i czas']?.trim() && 
                  row['Szerokość geograficzna'] && 
                  row['Długość geograficzna'] &&
                  row['Status'] !== '❌ Błąd daty' &&
                  row['Status'] !== '❓ Brak daty';

                const hasValidCoordinates = 
                  !isNaN(parseFloat(row['Szerokość geograficzna'])) && 
                  !isNaN(parseFloat(row['Długość geograficzna']));

                return hasRequiredFields && hasValidCoordinates;
              })
              .map((row: any) => ({
                id: `${row['Nazwa wydarzenia']}-${row['Data i czas']}`,
                eventName: row['Nazwa wydarzenia'].trim(),
                dateTime: row['Data i czas'].trim(),
                description: row['Opis']?.trim() || 'Brak opisu',
                registration: row['Rejestracja']?.trim() || 'Brak informacji o rejestracji',
                organizer: row['Organizator']?.trim() || 'Brak informacji o organizatorze',
                eventLink: row['Link do wydarzenia']?.trim() || '',
                location: row['Adres']?.trim() || 'Brak informacji o lokalizacji',
                coordinates: [
                  parseFloat(row['Szerokość geograficzna']), 
                  parseFloat(row['Długość geograficzna'])
                ] as [number, number],
                isArchived: row['Status']?.includes('📁 Archiwalne') || false
              }));
            
            if (processedEvents.length === 0) {
              setError('Nie znaleziono żadnych wydarzeń spełniających kryteria');
              setLoading(false);
              return;
            }

            setEvents(processedEvents);
            setError(null);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Błąd podczas przetwarzania danych. Spróbuj ponownie później.');
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Nie udało się pobrać wydarzeń. Sprawdź połączenie z internetem i spróbuj ponownie.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    showArchived ? event.isArchived : !event.isArchived
  );

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Ładowanie wydarzeń...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Odśwież
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <Header 
        showArchived={showArchived} 
        onToggleArchived={setShowArchived}
        totalEvents={events.length}
        archivedEvents={events.filter(e => e.isArchived).length}
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 min-h-0">
        <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 min-h-[300px] md:min-h-0">
          <EventList
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
          />
        </div>

        <div className="md:col-span-2 relative min-h-[300px] md:min-h-0">
          <EventMap 
            events={filteredEvents} 
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
          />
          {selectedEvent && (
            <EventDetails 
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;