import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Menu, X, BarChart3, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SafetyMap } from '@/components/safety-map';
import { LocationDetailPanel } from '@/components/location-detail-panel';
import { StatisticsDashboard } from '@/components/statistics-dashboard';
import { AreaSearch } from '@/components/area-search';
import type { Accident, SafetyLevel } from '@shared/schema';
import { calculateSafetyLevelFromAccidents } from '@/lib/safety-utils';

type ViewMode = 'map' | 'stats';

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('stats');
  const [selectedAccident, setSelectedAccident] = useState<Accident | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: accidents = [], isLoading } = useQuery<Accident[]>({
    queryKey: ['/api/accidents'],
  });

  const areaAnalytics = useMemo(() => {
    const analytics = new Map<string, { count: number; safetyLevel: SafetyLevel }>();
    
    const areaGroups = accidents.reduce((acc, accident) => {
      if (!acc[accident.area]) {
        acc[accident.area] = [];
      }
      acc[accident.area].push(accident);
      return acc;
    }, {} as Record<string, Accident[]>);

    Object.entries(areaGroups).forEach(([area, areaAccidents]) => {
      const safetyLevel = calculateSafetyLevelFromAccidents(areaAccidents);
      analytics.set(area, {
        count: areaAccidents.length,
        safetyLevel,
      });
    });

    return analytics;
  }, [accidents]);

  const relatedAccidents = useMemo(() => {
    if (!selectedAccident) return [];
    return accidents.filter(a => a.area === selectedAccident.area);
  }, [accidents, selectedAccident]);

  const selectedSafetyLevel = useMemo(() => {
    if (!selectedAccident) return 'safe' as SafetyLevel;
    const areaData = areaAnalytics.get(selectedAccident.area);
    return areaData?.safetyLevel || 'safe';
  }, [selectedAccident, areaAnalytics]);

  const handleAreaSelect = (areaAccidents: Accident[]) => {
    if (areaAccidents.length > 0) {
      setSelectedAccident(areaAccidents[0]);
      setViewMode('map');
    }
  };

  useEffect(() => {
    if (viewMode === 'stats') {
      setSelectedAccident(null);
    }
  }, [viewMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading safety data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border h-16 flex items-center px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <MapIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold" data-testid="text-app-title">Delhi Road Safety</h1>
              <p className="text-xs text-muted-foreground">Intelligence Platform</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            onClick={() => setViewMode('map')}
            data-testid="button-view-map"
            className="hover-elevate active-elevate-2"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Map View
          </Button>
          <Button
            variant={viewMode === 'stats' ? 'default' : 'ghost'}
            onClick={() => setViewMode('stats')}
            data-testid="button-view-stats"
            className="hover-elevate active-elevate-2"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </Button>
        </div>

        {/* Search and Theme Toggle */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="hidden md:block w-80">
            <AreaSearch
              accidents={accidents}
              areaAnalytics={areaAnalytics}
              onSelectArea={handleAreaSelect}
            />
          </div>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden hover-elevate active-elevate-2"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-4">
          <AreaSearch
            accidents={accidents}
            areaAnalytics={areaAnalytics}
            onSelectArea={(areaAccidents) => {
              handleAreaSelect(areaAccidents);
              setMobileMenuOpen(false);
            }}
          />
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => {
                setViewMode('map');
                setMobileMenuOpen(false);
              }}
              className="flex-1 hover-elevate active-elevate-2"
              data-testid="button-mobile-view-map"
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </Button>
            <Button
              variant={viewMode === 'stats' ? 'default' : 'outline'}
              onClick={() => {
                setViewMode('stats');
                setMobileMenuOpen(false);
              }}
              className="flex-1 hover-elevate active-elevate-2"
              data-testid="button-mobile-view-stats"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'map' ? (
          <>
            <SafetyMap
              accidents={accidents}
              selectedAccident={selectedAccident}
              onSelectAccident={setSelectedAccident}
              areaAnalytics={areaAnalytics}
            />
            {selectedAccident && (
              <LocationDetailPanel
                accident={selectedAccident}
                relatedAccidents={relatedAccidents}
                safetyLevel={selectedSafetyLevel}
                onClose={() => setSelectedAccident(null)}
              />
            )}
          </>
        ) : (
          <div className="h-full overflow-y-auto">
            <StatisticsDashboard accidents={accidents} />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden sticky bottom-0 bg-card border-t border-border p-2 flex gap-2">
        <Button
          variant={viewMode === 'map' ? 'default' : 'ghost'}
          onClick={() => setViewMode('map')}
          className="flex-1 hover-elevate active-elevate-2"
          data-testid="button-bottom-map"
        >
          <MapIcon className="h-4 w-4 mr-2" />
          Map
        </Button>
        <Button
          variant={viewMode === 'stats' ? 'default' : 'ghost'}
          onClick={() => setViewMode('stats')}
          className="flex-1 hover-elevate active-elevate-2"
          data-testid="button-bottom-stats"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Statistics
        </Button>
      </div>
    </div>
  );
}
