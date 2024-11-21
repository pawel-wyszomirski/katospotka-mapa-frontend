export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const parsePolishDate = (dateStr: string): Date | null => {
  // Format: DD.MM.YYYY HH:mm
  const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2})/);
  if (match) {
    const [, day, month, year, hours, minutes] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
  }
  return null;
};

const parseEnglishDate = (dateStr: string): Date | null => {
  // Format: Month DD, YYYY at HH:mm AM/PM
  // or: Sunday, November 3, 2024 at 7:00 PM
  try {
    return new Date(dateStr.replace(' at ', ' '));
  } catch {
    return null;
  }
};

const parseRangeDate = (dateStr: string): Date | null => {
  // Format: Od DD MMMM YYYY r. do DD MMMM YYYY r.
  const months: { [key: string]: number } = {
    'stycznia': 0, 'lutego': 1, 'marca': 2, 'kwietnia': 3, 'maja': 4, 'czerwca': 5,
    'lipca': 6, 'sierpnia': 7, 'września': 8, 'października': 9, 'listopada': 10, 'grudnia': 11
  };

  const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/g);
  if (match && match.length > 0) {
    // Use the last date in the range
    const lastDate = match[match.length - 1];
    const [day, month, year] = lastDate.split(' ');
    if (months[month.toLowerCase()] !== undefined) {
      return new Date(parseInt(year), months[month.toLowerCase()], parseInt(day));
    }
  }
  return null;
};

const parseDescriptiveDate = (dateStr: string): Date | null => {
  // Handle descriptive dates like "Środa, godziny 9:00 - 15:00"
  const today = new Date();
  const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hours),
      parseInt(minutes)
    );
  }
  return null;
};

export const parseDate = (dateTimeStr: string): Date => {
  // Try all parsing strategies
  const strategies = [
    parsePolishDate,
    parseEnglishDate,
    parseRangeDate,
    parseDescriptiveDate
  ];

  for (const strategy of strategies) {
    const result = strategy(dateTimeStr);
    if (result && !isNaN(result.getTime())) {
      return result;
    }
  }

  // If no strategy works, use current date as fallback
  console.warn('Could not parse date:', dateTimeStr);
  return new Date();
};

export const formatDate = (dateString: string): string => {
  try {
    // Split into start and end dates if range exists
    const dates = dateString.split(' - ');
    
    // If it's a date range, use the end date
    if (dates.length > 1) {
      const endDate = parseDate(dates[1]);
      return endDate.toISOString();
    }
    
    // If it's a single date
    const date = parseDate(dates[0]);
    return date.toISOString();
  } catch (e) {
    console.error('Error in formatDate:', dateString, e);
    return dateString;
  }
};

export const isEventArchived = (dateString: string): boolean => {
  try {
    // For descriptive dates (like "Środa, godziny 9:00 - 15:00"), consider them as non-archived
    if (dateString.includes('godziny')) {
      return false;
    }

    // Split into start and end dates if range exists
    const dates = dateString.split(' - ');
    
    // If it's a date range, use the end date for comparison
    const dateToCompare = dates.length > 1 ? dates[1] : dates[0];
    
    const eventDate = parseDate(dateToCompare);
    const now = new Date();
    
    return eventDate < now;
  } catch (e) {
    console.error('Error in isEventArchived:', dateString, e);
    return false;
  }
};