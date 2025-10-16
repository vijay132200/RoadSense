import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Accident records table
export const accidents = pgTable("accidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accidentId: text("accident_id").notNull().unique(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  dayOfWeek: text("day_of_week"),
  timeOfDay: text("time_of_day"),
  state: text("state"),
  city: text("city"),
  area: text("area").notNull(),
  locationType: text("location_type"),
  roadType: text("road_type"),
  lanes: integer("lanes"),
  trafficVolume: text("traffic_volume"),
  roadCondition: text("road_condition"),
  vehicleType: text("vehicle_type"),
  driverAge: integer("driver_age"),
  driverGender: text("driver_gender"),
  personsInvolved: integer("persons_involved"),
  injuries: integer("injuries"),
  fatalities: integer("fatalities"),
  severity: text("severity"),
  causePrimary: text("cause_primary"),
  alcoholInvolved: text("alcohol_involved"),
  seatbeltHelmetUsed: text("seatbelt_helmet_used"),
  speedLimit: integer("speed_limit"),
  reportedSpeed: real("reported_speed"),
  speedUnit: text("speed_unit"),
  weatherMain: text("weather_main"),
  temperature: real("temperature"),
  tempUnit: text("temp_unit"),
  precipitationMm: real("precipitation_mm"),
  visibilityKm: real("visibility_km"),
  lightConditions: text("light_conditions"),
  policeResponseTimeMin: integer("police_response_time_min"),
  ambulanceTimeMin: integer("ambulance_time_min"),
  finesIssuedInr: integer("fines_issued_inr"),
  nearestHospital: text("nearest_hospital"),
  hospitalDistanceKm: real("hospital_distance_km"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccidentSchema = createInsertSchema(accidents).omit({
  id: true,
  createdAt: true,
});

export type InsertAccident = z.infer<typeof insertAccidentSchema>;
export type Accident = typeof accidents.$inferSelect;

// Types for frontend use
export type SafetyLevel = 'safe' | 'moderate' | 'high-risk';

export type AreaStatistics = {
  area: string;
  totalAccidents: number;
  safetyLevel: SafetyLevel;
  fatalAccidents: number;
  severeAccidents: number;
  topCauses: { cause: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  averageResponseTime: number;
};

export type LocationAnalytics = {
  location: { lat: number; lng: number };
  area: string;
  safetyLevel: SafetyLevel;
  currentRiskScore: number;
  predictedRiskScore?: number;
  accidentCount: number;
  recentAccidents: Accident[];
  peakHours: { hour: number; count: number }[];
  topCauses: { cause: string; count: number }[];
  recommendations: {
    forAuthorities: string[];
    forCivilians: string[];
  };
};

export type RouteComparison = {
  route1: {
    name: string;
    safetyScore: number;
    safetyLevel: SafetyLevel;
    accidentCount: number;
    averageResponseTime: number;
    recommendations: string[];
  };
  route2: {
    name: string;
    safetyScore: number;
    safetyLevel: SafetyLevel;
    accidentCount: number;
    averageResponseTime: number;
    recommendations: string[];
  };
};

export type HourlyPrediction = {
  hour: number;
  predictedRiskScore: number;
  safetyLevel: SafetyLevel;
  confidence: number;
};
