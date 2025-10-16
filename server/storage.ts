// Reference: blueprint:javascript_database
import { accidents, type Accident, type InsertAccident } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Accident operations
  getAllAccidents(): Promise<Accident[]>;
  getAccidentById(id: string): Promise<Accident | undefined>;
  getAccidentsByArea(area: string): Promise<Accident[]>;
  getAccidentsByDateRange(startDate: string, endDate: string): Promise<Accident[]>;
  createAccident(accident: InsertAccident): Promise<Accident>;
  bulkCreateAccidents(accidents: InsertAccident[]): Promise<Accident[]>;
  
  // Analytics operations
  getAreaStatistics(): Promise<{ area: string; count: number; }[]>;
  getAccidentsBySeverity(severity: string): Promise<Accident[]>;
}

export class DatabaseStorage implements IStorage {
  async getAllAccidents(): Promise<Accident[]> {
    return await db.select().from(accidents).orderBy(desc(accidents.createdAt));
  }

  async getAccidentById(id: string): Promise<Accident | undefined> {
    const [accident] = await db.select().from(accidents).where(eq(accidents.id, id));
    return accident || undefined;
  }

  async getAccidentsByArea(area: string): Promise<Accident[]> {
    return await db.select().from(accidents).where(eq(accidents.area, area));
  }

  async getAccidentsByDateRange(startDate: string, endDate: string): Promise<Accident[]> {
    return await db.select().from(accidents)
      .where(
        and(
          gte(accidents.date, startDate),
          lte(accidents.date, endDate)
        )
      );
  }

  async createAccident(insertAccident: InsertAccident): Promise<Accident> {
    const [accident] = await db
      .insert(accidents)
      .values(insertAccident)
      .returning();
    return accident;
  }

  async bulkCreateAccidents(accidentsList: InsertAccident[]): Promise<Accident[]> {
    if (accidentsList.length === 0) return [];
    
    // Insert in batches of 100 to avoid memory issues
    const batchSize = 100;
    const results: Accident[] = [];
    
    for (let i = 0; i < accidentsList.length; i += batchSize) {
      const batch = accidentsList.slice(i, i + batchSize);
      const batchResults = await db
        .insert(accidents)
        .values(batch)
        .returning();
      results.push(...batchResults);
    }
    
    return results;
  }

  async getAreaStatistics(): Promise<{ area: string; count: number; }[]> {
    const stats = await db
      .select({
        area: accidents.area,
        count: sql<number>`count(*)::int`,
      })
      .from(accidents)
      .groupBy(accidents.area)
      .orderBy(desc(sql`count(*)`));
    
    return stats;
  }

  async getAccidentsBySeverity(severity: string): Promise<Accident[]> {
    return await db.select().from(accidents)
      .where(eq(accidents.severity, severity));
  }
}

export const storage = new DatabaseStorage();
