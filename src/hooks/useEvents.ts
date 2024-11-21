import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Event } from '../types';
import { pushToDataLayer } from '../utils/gtm';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRmp1P1Nn9S9s2n2kVPBw4_E4HJ80XdNKnhRO62o4OcxUCCw69-pJSQ8IMEChC4LTky5vE2oxso__XX/pub?gid=1403610803&single=true&output=csv';

export default function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEvents = async () => {
      try {
        const response = await fetch(SHEET_URL, {
          signal: controller.signal,
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
              return;
            }

            pushToDataLayer({
              event: 'events_loaded',
              eventCount: processedEvents.length
            });

            setEvents(processedEvents);
            setError(null);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Błąd podczas przetwarzania danych');
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Wystąpił nieznany błąd');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    events,
    showArchived,
    selectedEvent,
    loading,
    error,
    setShowArchived,
    setSelectedEvent
  };
}