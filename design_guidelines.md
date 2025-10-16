# Road Safety Intelligence Platform - Design Guidelines

## Design Approach

**Selected Framework**: Material Design 3 with Custom Safety-Focused Adaptations

**Rationale**: This is a utility-focused, information-dense government platform requiring professional credibility, excellent data visualization, and responsive performance. Material Design 3 provides robust patterns for maps, dashboards, and data displays while maintaining accessibility and mobile optimization.

**Core Principles**:
- Data clarity over decoration
- Instant visual safety communication through color
- Professional government-grade interface
- Mobile-first responsive design
- Accessibility for all user groups

---

## Color System

### Light Mode
**Primary Colors**: 
- Primary: 210 90% 48% (Trust Blue - for UI elements, buttons, navigation)
- Map Safe Zone: 142 76% 36% (Forest Green)
- Map Moderate Zone: 45 93% 47% (Amber Warning)
- Map High Risk Zone: 0 84% 60% (Alert Red)

**Neutral Colors**:
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text Primary: 220 13% 18%
- Text Secondary: 220 9% 46%
- Border: 220 13% 91%

### Dark Mode
**Primary Colors**:
- Primary: 210 100% 64% (Lighter Trust Blue)
- Map Safe Zone: 142 60% 42%
- Map Moderate Zone: 45 90% 55%
- Map High Risk Zone: 0 72% 65%

**Neutral Colors**:
- Background: 220 13% 12%
- Surface: 220 13% 16%
- Text Primary: 0 0% 95%
- Text Secondary: 220 8% 65%
- Border: 220 13% 24%

**Accent Colors** (Sparingly):
- Info: 200 95% 55% (for statistics, insights)
- Success: 142 71% 45% (for positive metrics)

---

## Typography

**Font Family**: 
- Primary: "Inter" (Google Fonts) for UI, body text
- Data/Numbers: "JetBrains Mono" (Google Fonts) for statistics, metrics

**Hierarchy**:
- H1 (Page Title): 2.5rem, 700 weight
- H2 (Section Headers): 1.875rem, 600 weight
- H3 (Card Titles): 1.25rem, 600 weight
- Body Large: 1.125rem, 400 weight
- Body: 1rem, 400 weight
- Caption/Labels: 0.875rem, 500 weight
- Data Metrics: 1.5-2rem, 600 weight (JetBrains Mono)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16 (e.g., p-4, m-8, gap-6)

**Grid Structure**:
- Map Container: Full viewport (100vh minus header)
- Side Panel (Desktop): 400px fixed width, slide-in on mobile
- Statistics Cards: Grid cols-1 md:cols-2 lg:cols-3
- Max Content Width: max-w-7xl for data sections

**Responsive Breakpoints**:
- Mobile: Base (single column, bottom sheet for details)
- Tablet: md: (two-column grids, side drawer)
- Desktop: lg: (three-column grids, persistent side panel)

---

## Component Library

### Navigation
- **Top Bar**: Fixed header (h-16) with logo, search, user profile
- **Map Controls**: Floating action buttons (bottom-right) for zoom, location, layers
- **Mobile Navigation**: Bottom navigation bar with map/stats/alerts tabs

### Map Interface
- **Primary View**: Full-screen Mapbox/Leaflet integration
- **Location Markers**: Circular pins with safety color coding (12px base, 16px hover)
- **Selected Area Highlight**: Pulsing glow effect in safety color
- **Zoom Controls**: Material design FAB buttons with icons
- **Legend**: Floating card (top-right) with color-coded safety levels

### Data Panels
- **Location Detail Card**: Elevated surface (shadow-lg) with:
  - Safety level badge (large, prominent, colored)
  - Current statistics grid (2x2)
  - Hourly timeline chart
  - Predictive safety gauge
  - Action buttons

- **Statistics Dashboard**: 
  - KPI Cards: Elevated, with icon, metric, trend indicator
  - Charts: Recharts library (bar, line, donut) with safety color palette
  - Responsive grid layout

### Interactive Elements
- **Buttons**: 
  - Primary: Filled with primary color
  - Secondary: Outlined with subtle hover lift
  - Floating Action: Circle with icon, shadow-xl
  
- **Input Fields**: Material outlined style with floating labels
- **Search Bar**: Elevated with autocomplete dropdown
- **Time Selector**: Segmented button group for time ranges

### Data Visualization
- **Safety Timeline**: Horizontal bar chart showing hourly risk levels
- **Route Comparison**: Side-by-side cards with safety scores and metrics
- **Area Statistics**: Combination of donut charts (severity), bar charts (causes), line graphs (trends)
- **Heatmap Overlay**: Gradient overlay on map for density visualization

### Feedback Elements
- **Loading States**: Material circular progress with pulsing map markers
- **Alerts/Notifications**: Snackbar at bottom (mobile) or top-right (desktop)
- **Empty States**: Illustration + message for no data scenarios
- **Tooltips**: Dark background, white text, arrow pointer

---

## Animation & Interactions

**Use Sparingly**:
- Map marker pulse: 1.5s infinite for active/selected locations
- Panel slide-in: 300ms ease-out for mobile drawers
- Hover lift: 100ms transform scale(1.02) on cards
- Chart animations: 500ms stagger for bar/line reveals

**No animations** on data updates, route calculations, or predictive displays (instant updates for clarity).

---

## Images & Icons

**Icons**: Material Icons via CDN (outline style for clarity)
- Navigation: map, analytics, route, alert icons
- Data: trending_up, warning, check_circle, schedule
- Actions: search, filter, download, share

**Images**: 
- Hero/Background: None (map is the hero)
- Empty States: Simple line illustrations for "no data" scenarios
- Authority Logos: Small header placement (24px height)

**Map Tiles**: Mapbox Streets or OpenStreetMap with custom safety overlay

---

## Accessibility

- WCAG AA compliant color contrast (4.5:1 minimum)
- Keyboard navigation for all interactive elements
- Screen reader labels for map markers and data points
- Focus indicators with 2px offset ring in primary color
- Touch targets minimum 44px for mobile
- Consistent dark mode across all components

---

## Platform-Specific Considerations

### Desktop (lg+)
- Persistent side panel for location details
- Multi-column statistics dashboard
- Hover states for enhanced map interactions

### Mobile (base, md)
- Bottom sheet for location details (swipe up)
- Single column statistics
- Bottom navigation bar
- Large touch targets for map markers (min 44px)

### Government Authority View
- Priority alerts section (elevated, red accent)
- Enforcement recommendation cards
- Exportable data tables

### Civilian View  
- Simplified safety indicators
- Best travel time suggestions
- Route safety comparison prominently displayed