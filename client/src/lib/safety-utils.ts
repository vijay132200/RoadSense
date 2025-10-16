import type { SafetyLevel, Accident } from "@shared/schema";

export function calculateSafetyLevel(accidentCount: number, severity: string[]): SafetyLevel {
  const fatalCount = severity.filter(s => s?.toLowerCase() === 'fatal').length;
  const severeCount = severity.filter(s => s?.toLowerCase() === 'severe').length;
  
  if (fatalCount > 2 || severeCount > 5 || accidentCount > 50) {
    return 'high-risk';
  } else if (fatalCount > 0 || severeCount > 2 || accidentCount > 20) {
    return 'moderate';
  }
  return 'safe';
}

export function getSafetyColor(level: SafetyLevel): string {
  switch (level) {
    case 'safe':
      return 'hsl(var(--map-safe))';
    case 'moderate':
      return 'hsl(var(--map-moderate))';
    case 'high-risk':
      return 'hsl(var(--map-high-risk))';
    default:
      return 'hsl(var(--muted))';
  }
}

export function getSafetyColorClass(level: SafetyLevel): string {
  switch (level) {
    case 'safe':
      return 'bg-map-safe text-white';
    case 'moderate':
      return 'bg-map-moderate text-white';
    case 'high-risk':
      return 'bg-map-high-risk text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function getSafetyScore(level: SafetyLevel): number {
  switch (level) {
    case 'safe':
      return 85;
    case 'moderate':
      return 55;
    case 'high-risk':
      return 25;
    default:
      return 50;
  }
}

export function formatSafetyLevel(level: SafetyLevel): string {
  switch (level) {
    case 'safe':
      return 'Safe';
    case 'moderate':
      return 'Moderate Risk';
    case 'high-risk':
      return 'High Risk';
    default:
      return 'Unknown';
  }
}

export function getTopCauses(accidents: Accident[]): { cause: string; count: number }[] {
  const causeCounts = accidents.reduce((acc, accident) => {
    const cause = accident.causePrimary || 'Unknown';
    acc[cause] = (acc[cause] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(causeCounts)
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function getHourlyDistribution(accidents: Accident[]): { hour: number; count: number }[] {
  const hourCounts = new Array(24).fill(0);
  
  accidents.forEach(accident => {
    const time = accident.time;
    let hour = 0;
    
    if (time.includes(':')) {
      const parts = time.split(':');
      hour = parseInt(parts[0]);
      
      if (time.toLowerCase().includes('pm') && hour !== 12) {
        hour += 12;
      } else if (time.toLowerCase().includes('am') && hour === 12) {
        hour = 0;
      }
    }
    
    if (hour >= 0 && hour < 24) {
      hourCounts[hour]++;
    }
  });

  return hourCounts.map((count, hour) => ({ hour, count }));
}

export function predictSafetyForHour(hour: number, historicalData: Accident[]): SafetyLevel {
  const hourAccidents = historicalData.filter(acc => {
    const time = acc.time;
    let accHour = 0;
    
    if (time.includes(':')) {
      const parts = time.split(':');
      accHour = parseInt(parts[0]);
      
      if (time.toLowerCase().includes('pm') && accHour !== 12) {
        accHour += 12;
      } else if (time.toLowerCase().includes('am') && accHour === 12) {
        accHour = 0;
      }
    }
    
    return accHour === hour;
  });

  const severity = hourAccidents.map(acc => acc.severity || '');
  return calculateSafetyLevel(hourAccidents.length, severity);
}

export const DELHI_BOUNDS = {
  center: { lat: 28.6139, lng: 77.2090 } as const,
  zoom: 11,
  minLat: 28.4,
  maxLat: 28.88,
  minLng: 76.84,
  maxLng: 77.35,
};

export function isWithinDelhiBounds(lat: number, lng: number): boolean {
  return lat >= DELHI_BOUNDS.minLat && 
         lat <= DELHI_BOUNDS.maxLat && 
         lng >= DELHI_BOUNDS.minLng && 
         lng <= DELHI_BOUNDS.maxLng;
}
