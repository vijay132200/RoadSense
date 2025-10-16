import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { storage } from '../server/storage';
import type { InsertAccident } from '@shared/schema';

async function importAccidents() {
  const csvPath = path.join(process.cwd(), 'attached_assets', 'Road Safety Dataset - Sheet1_1760624134797.csv');
  
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  console.log('Parsing CSV data...');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${records.length} records`);

  const accidents: InsertAccident[] = records.map((record: any) => {
    // Parse numeric values
    const parseNumber = (val: string) => {
      if (!val || val === '') return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    const parseInt = (val: string) => {
      if (!val || val === '') return null;
      const num = Number.parseInt(val);
      return isNaN(num) ? null : num;
    };

    return {
      accidentId: record.accident_id,
      date: record.date,
      time: record.time,
      dayOfWeek: record.day_of_week || null,
      timeOfDay: record.time_of_day || null,
      state: record.state || null,
      city: record.city || null,
      area: record.area || 'Unknown',
      locationType: record.location_type || null,
      roadType: record.road_type || null,
      lanes: parseInt(record.lanes),
      trafficVolume: record.traffic_volume || null,
      roadCondition: record.road_condition || null,
      vehicleType: record.vehicle_type || null,
      driverAge: parseInt(record.driver_age),
      driverGender: record.driver_gender || null,
      personsInvolved: parseInt(record.persons_involved),
      injuries: parseInt(record.injuries),
      fatalities: parseInt(record.fatalities),
      severity: record.severity || null,
      causePrimary: record.cause_primary || null,
      alcoholInvolved: record.alcohol_involved || null,
      seatbeltHelmetUsed: record.seatbelt_helmet_used || null,
      speedLimit: parseInt(record.speed_limit),
      reportedSpeed: parseNumber(record.reported_speed),
      speedUnit: record.speed_unit || null,
      weatherMain: record.weather_main || null,
      temperature: parseNumber(record.temperature),
      tempUnit: record.temp_unit || null,
      precipitationMm: parseNumber(record.precipitation_mm),
      visibilityKm: parseNumber(record.visibility_km),
      lightConditions: record.light_conditions || null,
      policeResponseTimeMin: parseInt(record.police_response_time_min),
      ambulanceTimeMin: parseInt(record.ambulance_time_min),
      finesIssuedInr: parseInt(record.fines_issued_inr),
      nearestHospital: record.nearest_hospital || null,
      hospitalDistanceKm: parseNumber(record.hospital_distance_km),
      latitude: parseNumber(record.latitude) || 0,
      longitude: parseNumber(record.longitude) || 0,
    };
  }).filter(acc => acc.latitude !== 0 && acc.longitude !== 0); // Filter out invalid coordinates

  console.log(`Importing ${accidents.length} valid accidents...`);

  try {
    const imported = await storage.bulkCreateAccidents(accidents);
    console.log(`✓ Successfully imported ${imported.length} accidents`);
  } catch (error) {
    console.error('Error importing accidents:', error);
    throw error;
  }
}

importAccidents()
  .then(() => {
    console.log('Import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
