import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  getAllVipCodes, 
  createVipCode, 
  updateVipCodeStatus, 
  deleteVipCode, 
  verifyAndUseCode,
  getOrCreateUser
} from "./src/db/helpers.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Fetch all VIP codes
  app.get("/api/vip-codes", async (req, res) => {
    try {
      const codes = await getAllVipCodes();
      res.json(codes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new VIP code
  app.post("/api/vip-codes", async (req, res) => {
    try {
      const { code, type, durationDays, expiresAt, maxUses } = req.body;
      if (!code || !type) {
        return res.status(400).json({ error: "Code and type are required" });
      }
      const newCode = await createVipCode({
        code,
        type,
        durationDays: durationDays || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses || 1
      });
      res.json(newCode);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update status (toggle active/disabled)
  app.put("/api/vip-codes/:code/status", async (req, res) => {
    try {
      const { code } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const updated = await updateVipCodeStatus(code, status);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a code
  app.delete("/api/vip-codes/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const deleted = await deleteVipCode(code);
      res.json(deleted);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify and use code
  app.post("/api/vip-codes/verify", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Code is required" });
      }
      const trimmed = code.trim().toUpperCase();
      const result = await verifyAndUseCode(trimmed);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { uid, email } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: "uid and email are required" });
      }
      const user = await getOrCreateUser(uid, email);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
