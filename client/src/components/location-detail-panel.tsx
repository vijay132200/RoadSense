import { X, TrendingUp, AlertTriangle, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Accident, SafetyLevel } from '@shared/schema';
import { getSafetyColorClass, formatSafetyLevel, getSafetyColor, getHourlyDistribution, getTopCauses, getDominantCause, getCivilianSuggestions, getGovernmentSuggestions } from '@/lib/safety-utils';

type LocationDetailPanelProps = {
  accident: Accident;
  relatedAccidents: Accident[];
  safetyLevel: SafetyLevel;
  onClose: () => void;
};

export function LocationDetailPanel({ accident, relatedAccidents, safetyLevel, onClose }: LocationDetailPanelProps) {
  const hourlyData = getHourlyDistribution(relatedAccidents);
  const topCauses = getTopCauses(relatedAccidents);
  const peakHours = hourlyData
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .filter(h => h.count > 0);

  const totalFatalities = relatedAccidents.reduce((sum, acc) => sum + (acc.fatalities || 0), 0);
  const totalInjuries = relatedAccidents.reduce((sum, acc) => sum + (acc.injuries || 0), 0);
  const avgResponseTime = Math.round(
    relatedAccidents.reduce((sum, acc) => sum + (acc.ambulanceTimeMin || 0), 0) / relatedAccidents.length
  );

  // Get dominant cause for cause-specific suggestions
  const dominantCause = getDominantCause(relatedAccidents);
  const civilianSuggestions = getCivilianSuggestions(dominantCause);
  const governmentSuggestions = getGovernmentSuggestions(dominantCause);

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-background border-l border-border shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
        <h2 className="text-xl font-semibold" data-testid="text-location-title">
          {accident.area}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-panel" className="hover-elevate active-elevate-2">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Safety Level Badge */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Safety Level</p>
            <Badge className={`${getSafetyColorClass(safetyLevel)} text-lg px-4 py-2`} data-testid="badge-safety-level">
              {formatSafetyLevel(safetyLevel)}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Accidents</p>
            <p className="text-3xl font-mono font-semibold" data-testid="text-accident-count">{relatedAccidents.length}</p>
          </div>
        </div>

        <Separator />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">Fatalities</span>
              </div>
              <p className="text-2xl font-mono font-semibold" data-testid="text-fatalities">{totalFatalities}</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-map-moderate mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Injuries</span>
              </div>
              <p className="text-2xl font-mono font-semibold" data-testid="text-injuries">{totalInjuries}</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Avg Response</span>
              </div>
              <p className="text-2xl font-mono font-semibold" data-testid="text-response-time">{avgResponseTime}m</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-chart-5 mb-1">
                <Navigation className="h-4 w-4" />
                <span className="text-xs font-medium">Location Type</span>
              </div>
              <p className="text-sm font-medium truncate" data-testid="text-location-type">{accident.locationType}</p>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hourly Accident Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }} 
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count > 10 ? 'hsl(var(--map-high-risk))' : entry.count > 5 ? 'hsl(var(--map-moderate))' : 'hsl(var(--map-safe))'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        {peakHours.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Peak Risk Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {peakHours.map((peak) => (
                <div key={peak.hour} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm font-medium">{peak.hour}:00 - {peak.hour + 1}:00</span>
                  <Badge variant="secondary">{peak.count} accidents</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Top Causes */}
        {topCauses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Accident Causes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topCauses.map((cause, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{cause.cause}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(cause.count / topCauses[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono w-8 text-right">{cause.count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Dominant Cause Alert */}
        <Card className="bg-destructive/10 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Primary Accident Cause: {dominantCause}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Cause-Specific Recommendations */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Safety Recommendations</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Based on dominant cause analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span className="bg-primary/20 px-2 py-0.5 rounded text-xs">For Government & Authorities</span>
              </p>
              <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                {governmentSuggestions.map((suggestion, index) => (
                  <li key={index} className="leading-relaxed">{suggestion}</li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span className="bg-chart-2/20 px-2 py-0.5 rounded text-xs">For Civilians & Commuters</span>
              </p>
              <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                {civilianSuggestions.map((suggestion, index) => (
                  <li key={index} className="leading-relaxed">{suggestion}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
