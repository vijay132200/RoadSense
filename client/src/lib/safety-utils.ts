import type { SafetyLevel, Accident } from "@shared/schema";

/**
 * Calculate Severity Score using the exact formula:
 * Severity Score = (Total Fatalities * 10) + (Severe/Fatal accidents * 5) + (Moderate accidents * 2)
 */
export function calculateSeverityScore(accidents: Accident[]): number {
  let score = 0;
  
  accidents.forEach(accident => {
    const fatalities = accident.fatalities || 0;
    const severity = (accident.severity || '').toLowerCase();
    
    // Add fatalities (10 points each)
    score += fatalities * 10;
    
    // Add points for severe/fatal severity classification (5 points each)
    if (severity === 'severe' || severity === 'fatal') {
      score += 5;
    }
    
    // Add points for moderate severity classification (2 points each)
    if (severity === 'moderate') {
      score += 2;
    }
  });
  
  return score;
}

/**
 * Calculate percentiles from an array of scores
 */
function calculatePercentile(scores: number[], percentile: number): number {
  if (scores.length === 0) return 0;
  
  const sorted = [...scores].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sorted[lower];
  }
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate safety level using percentile-based thresholds:
 * - High Risk (Red): Top 25% of scores
 * - Medium Risk (Yellow): 25th-75th percentile
 * - Low Risk (Green): Bottom 25%
 */
export function calculateSafetyLevelFromAccidents(
  accidents: Accident[],
  allScores?: number[]
): SafetyLevel {
  if (accidents.length === 0) return 'safe';
  
  const score = calculateSeverityScore(accidents);
  
  // If allScores not provided, use simple thresholds
  if (!allScores || allScores.length === 0) {
    if (score >= 50) return 'high-risk';
    if (score >= 20) return 'moderate';
    return 'safe';
  }
  
  const percentile75 = calculatePercentile(allScores, 75);
  const percentile25 = calculatePercentile(allScores, 25);
  
  if (score >= percentile75) return 'high-risk';
  if (score >= percentile25) return 'moderate';
  return 'safe';
}

/**
 * Calculate severity scores for all areas to enable percentile-based classification
 */
export function calculateAreaScores(accidents: Accident[]): { 
  areaScores: Map<string, number>;
  allScores: number[];
} {
  const areaGroups = accidents.reduce((acc, accident) => {
    if (!acc[accident.area]) {
      acc[accident.area] = [];
    }
    acc[accident.area].push(accident);
    return acc;
  }, {} as Record<string, Accident[]>);

  const areaScores = new Map<string, number>();
  const allScores: number[] = [];

  Object.entries(areaGroups).forEach(([area, areaAccidents]) => {
    const score = calculateSeverityScore(areaAccidents);
    areaScores.set(area, score);
    allScores.push(score);
  });

  return { areaScores, allScores };
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

/**
 * Get the dominant (most frequent) cause for an area
 */
export function getDominantCause(accidents: Accident[]): string {
  const causes = getTopCauses(accidents);
  return causes.length > 0 ? causes[0].cause : 'Unknown';
}

/**
 * Generate cause-specific suggestions for civilians
 */
export function getCivilianSuggestions(dominantCause: string): string[] {
  const cause = dominantCause.toLowerCase();
  
  if (cause.includes('weather') || cause.includes('rain') || cause.includes('fog')) {
    return [
      "Check tire tread and wiper blades before driving in rain",
      "Reduce speed by at least 30% and increase following distance",
      "Use fog lights in low visibility, not high beams",
      "Avoid sudden braking or sharp turns on wet roads"
    ];
  }
  
  if (cause.includes('speed') || cause.includes('overspeeding')) {
    return [
      "Be aware that this is a high-speed accident zone; adhere strictly to the posted speed limit",
      "Allow extra time for your journey to avoid the temptation to speed",
      "Be cautious of other vehicles making sudden maneuvers",
      "Maintain safe following distance to allow for sudden stops"
    ];
  }
  
  if (cause.includes('inattention') || cause.includes('distract') || cause.includes('red light') || cause.includes('signal')) {
    return [
      "Avoid all mobile phone use when approaching this area",
      "Be prepared for sudden stops and lane changes",
      "Before proceeding on a green light, quickly check for cross-traffic that may have run the red light",
      "Stay alert and avoid distractions like eating or adjusting radio"
    ];
  }
  
  if (cause.includes('alcohol') || cause.includes('drunk')) {
    return [
      "Never drive under the influence of alcohol or drugs",
      "Watch for erratic driving behavior from other vehicles",
      "Consider alternative transportation if you plan to consume alcohol",
      "Report suspected drunk drivers to authorities"
    ];
  }
  
  if (cause.includes('pedestrian') || cause.includes('jaywalking')) {
    return [
      "Be extra vigilant for pedestrians, especially near crosswalks",
      "Slow down in areas with high foot traffic",
      "Never assume pedestrians will wait for you to pass",
      "Be especially careful during evening hours when visibility is reduced"
    ];
  }
  
  if (cause.includes('overtaking') || cause.includes('reckless')) {
    return [
      "Be cautious when overtaking; ensure clear visibility and safe distance",
      "Watch for aggressive drivers attempting risky overtaking maneuvers",
      "Use defensive driving techniques and maintain your lane",
      "Never engage with aggressive or reckless drivers"
    ];
  }
  
  // Default suggestions
  return [
    "Drive defensively and stay alert at all times",
    "Maintain safe following distance from other vehicles",
    "Obey all traffic signals and road signs",
    "Be prepared for unexpected situations"
  ];
}

/**
 * Generate cause-specific suggestions for government/authorities
 */
export function getGovernmentSuggestions(dominantCause: string): string[] {
  const cause = dominantCause.toLowerCase();
  
  if (cause.includes('weather') || cause.includes('rain') || cause.includes('fog')) {
    return [
      "Improve road infrastructure by clearing drainage systems to prevent waterlogging",
      "Repair potholes that become hazardous in rain",
      "Install high-visibility, reflective road markings and signage that perform well in fog and rain",
      "Consider installing weather-responsive traffic management systems"
    ];
  }
  
  if (cause.includes('speed') || cause.includes('overspeeding')) {
    return [
      "Install automated speed-enforcement cameras on this stretch",
      "Implement traffic calming measures like speed bumps near intersections or pedestrian zones",
      "Increase the frequency of traffic police patrols with speed guns",
      "Improve signage warning drivers of speed limits and accident history"
    ];
  }
  
  if (cause.includes('inattention') || cause.includes('distract') || cause.includes('red light') || cause.includes('signal')) {
    return [
      "Improve traffic signal visibility and timing at this intersection",
      "Install rumble strips on the approach to the intersection to alert drivers",
      "Consider creating a 'no-right-on-red' policy here if not already in place",
      "Deploy red light cameras to enforce traffic signal compliance"
    ];
  }
  
  if (cause.includes('alcohol') || cause.includes('drunk')) {
    return [
      "Increase sobriety checkpoints and breathalyzer testing in this area",
      "Launch targeted awareness campaigns about drunk driving consequences",
      "Improve public transportation options during peak nightlife hours",
      "Implement stricter penalties for DUI offenses in high-risk zones"
    ];
  }
  
  if (cause.includes('pedestrian') || cause.includes('jaywalking')) {
    return [
      "Install or improve pedestrian crosswalks with clear markings",
      "Add pedestrian crossing signals with countdown timers",
      "Implement speed reduction zones near high pedestrian traffic areas",
      "Consider installing pedestrian barriers to prevent jaywalking"
    ];
  }
  
  if (cause.includes('overtaking') || cause.includes('reckless')) {
    return [
      "Install clear lane markings and no-overtaking zone signage",
      "Increase traffic police presence to deter reckless driving",
      "Consider median barriers to prevent dangerous overtaking",
      "Implement stricter penalties for reckless driving in this zone"
    ];
  }
  
  // Default suggestions
  return [
    "Conduct comprehensive traffic safety audit of this area",
    "Improve road lighting and visibility",
    "Increase traffic police presence during peak hours",
    "Install warning signs about accident-prone zone"
  ];
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

export function predictSafetyForHour(hour: number, historicalData: Accident[], allScores?: number[]): SafetyLevel {
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

  return calculateSafetyLevelFromAccidents(hourAccidents, allScores);
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
