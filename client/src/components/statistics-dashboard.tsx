import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, Clock, Car } from 'lucide-react';
import type { Accident } from '@shared/schema';
import { getHourlyDistribution, getTopCauses } from '@/lib/safety-utils';

type StatisticsDashboardProps = {
  accidents: Accident[];
};

export function StatisticsDashboard({ accidents }: StatisticsDashboardProps) {
  const totalAccidents = accidents.length;
  const totalFatalities = accidents.reduce((sum, acc) => sum + (acc.fatalities || 0), 0);
  const totalInjuries = accidents.reduce((sum, acc) => sum + (acc.injuries || 0), 0);
  const avgResponseTime = Math.round(
    accidents.reduce((sum, acc) => sum + (acc.ambulanceTimeMin || 0), 0) / accidents.length
  );

  const severityData = [
    { name: 'Fatal', value: accidents.filter(a => a.severity?.toLowerCase() === 'fatal').length, color: 'hsl(var(--map-high-risk))' },
    { name: 'Severe', value: accidents.filter(a => a.severity?.toLowerCase() === 'severe').length, color: 'hsl(var(--chart-3))' },
    { name: 'Moderate', value: accidents.filter(a => a.severity?.toLowerCase() === 'moderate').length, color: 'hsl(var(--map-moderate))' },
    { name: 'Minor', value: accidents.filter(a => a.severity?.toLowerCase() === 'minor').length, color: 'hsl(var(--map-safe))' },
  ].filter(d => d.value > 0);

  const hourlyData = getHourlyDistribution(accidents);
  const topCauses = getTopCauses(accidents);
  
  const vehicleTypes = accidents.reduce((acc, accident) => {
    const type = accident.vehicleType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vehicleData = Object.entries(vehicleTypes)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 bg-background">
      <div>
        <h2 className="text-2xl font-semibold mb-2" data-testid="text-dashboard-title">Delhi Road Safety Statistics</h2>
        <p className="text-muted-foreground">Comprehensive accident analytics and safety insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Accidents</p>
                <p className="text-3xl font-mono font-semibold" data-testid="text-total-accidents">{totalAccidents}</p>
              </div>
              <Car className="h-10 w-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fatalities</p>
                <p className="text-3xl font-mono font-semibold text-destructive" data-testid="text-total-fatalities">{totalFatalities}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-destructive opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Injuries</p>
                <p className="text-3xl font-mono font-semibold text-map-moderate" data-testid="text-total-injuries">{totalInjuries}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-map-moderate opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
                <p className="text-3xl font-mono font-semibold" data-testid="text-avg-response">{avgResponseTime}m</p>
              </div>
              <Clock className="h-10 w-10 text-chart-5 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Causes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Accident Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCauses} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="cause" tick={{ fontSize: 10 }} width={120} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Accident Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourlyData}>
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
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Types */}
        <Card>
          <CardHeader>
            <CardTitle>Top Vehicle Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vehicleData}>
                <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
