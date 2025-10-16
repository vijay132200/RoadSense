import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Accident, SafetyLevel } from '@shared/schema';
import { formatSafetyLevel, getSafetyColorClass } from '@/lib/safety-utils';

type AreaSearchProps = {
  accidents: Accident[];
  areaAnalytics: Map<string, { count: number; safetyLevel: SafetyLevel }>;
  onSelectArea: (areaAccidents: Accident[]) => void;
};

export function AreaSearch({ accidents, areaAnalytics, onSelectArea }: AreaSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const areas = useMemo(() => {
    const uniqueAreas = Array.from(new Set(accidents.map(a => a.area)))
      .map(area => {
        const areaData = areaAnalytics.get(area);
        return {
          name: area,
          count: areaData?.count || 0,
          safetyLevel: areaData?.safetyLevel || 'safe' as SafetyLevel,
        };
      })
      .sort((a, b) => b.count - a.count);
    
    return uniqueAreas;
  }, [accidents, areaAnalytics]);

  const filteredAreas = useMemo(() => {
    if (!searchQuery.trim()) return areas.slice(0, 8);
    
    return areas
      .filter(area => 
        area.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 8);
  }, [areas, searchQuery]);

  const handleSelectArea = (areaName: string) => {
    const areaAccidents = accidents.filter(a => a.area === areaName);
    if (areaAccidents.length > 0) {
      onSelectArea(areaAccidents);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search areas in Delhi..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9"
          data-testid="input-area-search"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && filteredAreas.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredAreas.map((area) => (
            <button
              key={area.name}
              onClick={() => handleSelectArea(area.name)}
              className="w-full px-4 py-3 flex items-center justify-between hover-elevate active-elevate-2 border-b border-border last:border-0"
              data-testid={`area-option-${area.name}`}
            >
              <div className="flex-1 text-left">
                <p className="font-medium">{area.name}</p>
                <p className="text-xs text-muted-foreground">{area.count} accidents</p>
              </div>
              <Badge className={`${getSafetyColorClass(area.safetyLevel)} ml-2`}>
                {formatSafetyLevel(area.safetyLevel)}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
