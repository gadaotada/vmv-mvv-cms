import { Router } from "express";

import monitoringDatabaseRoute from "./database/database.controller";
import monitoringSystemRoute from "./system/system.controller";

const monitoringRoute = Router();

monitoringRoute.use("/database", monitoringDatabaseRoute);
monitoringRoute.use("/system", monitoringSystemRoute);


export default monitoringRoute;