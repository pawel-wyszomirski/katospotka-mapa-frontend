export interface Event {
  id: string;
  eventName: string;
  dateTime: string;
  description: string;
  registration: string;
  organizer: string;
  eventLink: string;
  location: string;
  coordinates: [number, number];
  isArchived: boolean;
}