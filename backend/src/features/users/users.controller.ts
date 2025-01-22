import { Router } from "express";
import type { AppLogger } from "../../global/logging";
import { UsersServices } from "./users.service";

const users = Router();

// TODO: ADD sessionAuthMiddleware.
// TODO: ADD perm.
users.get("/", async(req, res) => {
    const logger = req.app.get('logger') as AppLogger;
    try {
        "/users"
        const params = req.query
        const [users, error] = new UsersServices().getAllusers();
    } catch(err) {

    }
})
