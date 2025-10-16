# Delhi Road Safety Intelligence Platform

## Recent Changes

### Migration to Replit Environment (January 2025)
- Created PostgreSQL database and imported 1700 accident records
- Installed all Node.js dependencies
- Added WebGL fallback error handling for map component
- Configured server to run on port 5000 with proper host binding (0.0.0.0)
- Verified API endpoints are functioning correctly
- Note: Map visualization requires WebGL which may not be available in headless browsers; Statistics view remains fully functional

## Overview

This is a data-driven road safety analytics platform for Delhi that provides interactive visualizations, real-time accident data exploration, and safety insights for government authorities and commuters. The platform transforms raw accident data into actionable intelligence through an interactive map-based interface, statistical dashboards, and area-specific safety analysis.

**Core Purpose**: Enable data-informed decision-making for road safety improvements by visualizing accident patterns, identifying high-risk zones, and providing detailed analytics on accident causation, severity, and response times.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**UI Component System**: 
- Shadcn/ui components built on Radix UI primitives
- Material Design 3 principles with safety-focused color adaptations
- Custom design system defined in `design_guidelines.md` emphasizing data clarity over decoration
- Responsive mobile-first design with breakpoint at 768px

**Styling Approach**:
- Tailwind CSS for utility-first styling
- Custom CSS variables for theming (light/dark mode support)
- Safety-specific color palette:
  - Safe zones: Forest Green (hsl 142 76% 36%)
  - Moderate zones: Amber Warning (hsl 45 93% 47%)
  - High-risk zones: Alert Red (hsl 0 84% 60%)
  - Trust Blue primary (hsl 210 90% 48%)

**State Management**:
- TanStack Query (React Query) for server state and caching
- React hooks for local component state
- Context API for theme management

**Routing**: Wouter for lightweight client-side routing

**Key Design Decisions**:
- **Problem**: Need to display dense accident data without overwhelming users
- **Solution**: Interactive map as primary interface with supplementary statistical dashboard
- **Rationale**: Maps provide immediate spatial context; statistics offer deeper analytical insights
- **Trade-offs**: More complex UX but better information density

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Database**: PostgreSQL via Neon serverless with connection pooling

**ORM**: Drizzle ORM for type-safe database operations
- Schema-first approach with TypeScript types generated from database schema
- Located in `shared/schema.ts` for type sharing between client and server

**API Design**: RESTful endpoints under `/api` namespace
- `GET /api/accidents` - Retrieve all accidents
- `GET /api/accidents/:id` - Get specific accident
- `GET /api/accidents/area/:area` - Filter by area
- `GET /api/accidents/date-range` - Filter by date range
- Analytics endpoints for aggregated statistics

**Development Setup**:
- Vite middleware integration for HMR in development
- Production builds serve static files from Express
- TypeScript compilation using `tsx` for server code

**Key Design Decisions**:
- **Problem**: Need to handle large datasets efficiently
- **Solution**: Database-level aggregations and indexed queries
- **Rationale**: Reduces client-side processing and network overhead
- **Trade-offs**: More complex server logic but faster user experience

### Data Architecture

**Database Schema** (`shared/schema.ts`):
- Single `accidents` table with comprehensive accident attributes
- 30+ fields including location (lat/lng), temporal data, severity, causes, weather, response times
- UUID primary keys with unique `accidentId` constraint
- Nullable fields for incomplete data handling

**Data Import Strategy**:
- CSV import script (`scripts/import-accidents.ts`) for bulk data loading
- Data cleaning and normalization performed during import
- Coordinate validation against Delhi bounding box
- Missing value handling with KNN and median imputation

**Key Design Decisions**:
- **Problem**: Raw CSV data has inconsistent formats and missing values
- **Solution**: Import-time data cleaning with documented actions in `data/cleaning_actions.txt`
- **Rationale**: Clean data once at import rather than runtime processing
- **Trade-offs**: Initial setup complexity but consistent data quality

### Map Integration

**Mapping Library**: Mapbox GL JS v3.0.1
- Interactive vector-based maps
- Custom marker rendering for accident locations
- Color-coded by safety level
- Navigation controls and geolocation support

**Geographic Constraints**:
- Bounded to Delhi region with min/max zoom levels
- Coordinates validated within defined bounding box
- Default center: Delhi geographic center

**Environment Compatibility**:
- Map requires WebGL support which may not be available in headless browser environments
- Graceful fallback displays error message when WebGL initialization fails
- Statistics dashboard remains fully functional regardless of WebGL support
- Users can access all data and analytics through the Statistics view

**Key Design Decisions**:
- **Problem**: Need real-time map interaction with 1700+ accident points
- **Solution**: Client-side marker clustering and safety level aggregation by area
- **Rationale**: Reduces visual clutter while maintaining data accessibility
- **Trade-offs**: Requires more client-side computation but provides better UX

### Analytics Features

**Safety Level Calculation**:
- Algorithmic determination based on accident count, fatality count, and severity distribution
- Three levels: Safe, Moderate, High-Risk
- Area-level aggregation with memoization for performance

**Visualization Components**:
- Recharts library for statistical charts (bar, pie, line)
- Hourly distribution analysis
- Top causes ranking
- Severity breakdowns
- Vehicle type analysis

**Key Design Decisions**:
- **Problem**: Need to communicate safety risk at a glance
- **Solution**: Color-coded safety levels with consistent visual language
- **Rationale**: Instant visual recognition reduces cognitive load
- **Trade-offs**: Simplified three-tier system may lose nuance but improves usability

## External Dependencies

### Core Dependencies

**Database & ORM**:
- `@neondatabase/serverless` - Serverless PostgreSQL client
- `drizzle-orm` - TypeScript ORM for type-safe queries
- `drizzle-zod` - Zod schema generation from Drizzle schemas
- `connect-pg-simple` - PostgreSQL session store

**Frontend Framework**:
- `react` & `react-dom` - UI library
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing

**UI Components**:
- `@radix-ui/*` - Accessible UI primitives (20+ components)
- `class-variance-authority` - Component variant management
- `tailwindcss` - Utility-first CSS

**Data Visualization**:
- `recharts` - React chart library
- `mapbox-gl` - Interactive maps
- Google Fonts (Inter, JetBrains Mono)
- Material Icons Outlined

**Development Tools**:
- `vite` - Build tool and dev server
- `typescript` - Type safety
- `tsx` - TypeScript execution for Node.js
- `@replit/*` - Replit-specific development plugins

**Data Processing**:
- `csv-parse` - CSV file parsing for data import
- `date-fns` - Date manipulation utilities

**Form Handling**:
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolvers
- `zod` - Schema validation

### External Services

**Mapbox**: Vector tile maps and geocoding services
- Currently using demo token (needs production replacement)
- Provides base map styles and geographic data

**Google Fonts API**: Typography assets
- Inter font family for UI text
- JetBrains Mono for code/data display
- Material Icons for iconography

### Build & Deployment

**Build Process**:
- Vite bundles client code to `dist/public`
- esbuild bundles server code to `dist`
- Production server serves static assets via Express

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `NODE_ENV` - Environment mode (development/production)

**Key Design Decisions**:
- **Problem**: Need unified build process for full-stack TypeScript app
- **Solution**: Separate Vite (client) and esbuild (server) builds with shared types
- **Rationale**: Leverages specialized tools for each environment
- **Trade-offs**: More complex build config but optimal bundle sizes