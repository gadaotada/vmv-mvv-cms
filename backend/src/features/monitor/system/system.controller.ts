import { Router } from "express";
import { permissionCheck } from "../../../global/auth";
import { SystemService } from "./system.service";

const monitoringSystemRoute = Router();

monitoringSystemRoute.get("/", permissionCheck("monitoring:read:any", async (req, res) => {
    const service = SystemService.getInstance();
    const stats = await service.getSystemStats();
    res.status(200).json(stats);
}));

export default monitoringSystemRoute;