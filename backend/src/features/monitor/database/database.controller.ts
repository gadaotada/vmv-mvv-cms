import { Router } from "express";
import { permissionCheck } from "../../../global/auth";
import { DatabaseService } from "./database.service";

const monitoringDatabaseRoute = Router();

monitoringDatabaseRoute.get("/", permissionCheck("monitoring:read:any", async (req, res) => {
    const service = new DatabaseService();
    const stats = await service.getDatabaseStats();
    res.status(200).json(stats);
}));    

export default monitoringDatabaseRoute;
