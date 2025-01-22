import { Router } from "express";

import { AppError } from "../../global/errors";
import { UsersServices } from "./users.service";
import { handleControllerError, validateSchema } from "../../global/libs/global-helpers";
import { queryUserSchema } from "./core/validation";
import type { AppLogger } from "../../global/logging";

const usersRoute = Router();

// TODO: ADD sessionAuthMiddleware.
// TODO: ADD perm.
usersRoute.get("/", async(req, res) => {
    const logger = req.app.get('logger') as AppLogger;
    try {
        const { pageNo, pageSize, active, updatedAt, searchTerm } = req.query;
        if (!validateSchema(queryUserSchema, req.query)) {
            throw AppError.createValidationError('Invalid request params', 'INVALID_QUERY_PARAMS');
        }
        new UsersServices().getAllusers(req.query);

        res.status(200).json({ message: 'pedal' });
    } catch(err) {
        handleControllerError(err, res, logger);
    }
});

export default usersRoute;
