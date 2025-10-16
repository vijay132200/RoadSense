import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAccidentSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all accidents
  app.get("/api/accidents", async (req, res) => {
    try {
      const accidents = await storage.getAllAccidents();
      res.json(accidents);
    } catch (error) {
      console.error("Error fetching accidents:", error);
      res.status(500).json({ error: "Failed to fetch accidents" });
    }
  });

  // Get accident by ID
  app.get("/api/accidents/:id", async (req, res) => {
    try {
      const accident = await storage.getAccidentById(req.params.id);
      if (!accident) {
        return res.status(404).json({ error: "Accident not found" });
      }
      res.json(accident);
    } catch (error) {
      console.error("Error fetching accident:", error);
      res.status(500).json({ error: "Failed to fetch accident" });
    }
  });

  // Get accidents by area
  app.get("/api/accidents/area/:area", async (req, res) => {
    try {
      const accidents = await storage.getAccidentsByArea(req.params.area);
      res.json(accidents);
    } catch (error) {
      console.error("Error fetching accidents by area:", error);
      res.status(500).json({ error: "Failed to fetch accidents by area" });
    }
  });

  // Get accidents by date range
  app.get("/api/accidents/date-range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "startDate and endDate are required" });
      }

      const accidents = await storage.getAccidentsByDateRange(
        startDate as string,
        endDate as string
      );
      res.json(accidents);
    } catch (error) {
      console.error("Error fetching accidents by date range:", error);
      res.status(500).json({ error: "Failed to fetch accidents by date range" });
    }
  });

  // Get area statistics
  app.get("/api/statistics/areas", async (req, res) => {
    try {
      const stats = await storage.getAreaStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching area statistics:", error);
      res.status(500).json({ error: "Failed to fetch area statistics" });
    }
  });

  // Get accidents by severity
  app.get("/api/accidents/severity/:severity", async (req, res) => {
    try {
      const accidents = await storage.getAccidentsBySeverity(req.params.severity);
      res.json(accidents);
    } catch (error) {
      console.error("Error fetching accidents by severity:", error);
      res.status(500).json({ error: "Failed to fetch accidents by severity" });
    }
  });

  // Create single accident
  app.post("/api/accidents", async (req, res) => {
    try {
      const validationResult = insertAccidentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      const accident = await storage.createAccident(validationResult.data);
      res.status(201).json(accident);
    } catch (error) {
      console.error("Error creating accident:", error);
      res.status(500).json({ error: "Failed to create accident" });
    }
  });

  // Bulk import accidents
  app.post("/api/accidents/bulk", async (req, res) => {
    try {
      const { accidents: accidentsList } = req.body;

      if (!Array.isArray(accidentsList)) {
        return res.status(400).json({ error: "accidents must be an array" });
      }

      const validatedAccidents = [];
      const errors = [];

      for (let i = 0; i < accidentsList.length; i++) {
        const validationResult = insertAccidentSchema.safeParse(accidentsList[i]);
        if (validationResult.success) {
          validatedAccidents.push(validationResult.data);
        } else {
          errors.push({ index: i, error: fromError(validationResult.error).toString() });
        }
      }

      if (validatedAccidents.length === 0) {
        return res.status(400).json({ 
          error: "No valid accidents to import",
          errors 
        });
      }

      const imported = await storage.bulkCreateAccidents(validatedAccidents);
      
      res.status(201).json({ 
        imported: imported.length,
        total: accidentsList.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Error bulk importing accidents:", error);
      res.status(500).json({ error: "Failed to bulk import accidents" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
