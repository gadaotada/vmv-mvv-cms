import { Router } from "express";
import type { AppLogger } from "../../global/logging";
import { permissionCheck, type SessionManager } from "../../global/auth";
import { getUserById } from "../sign/core/dal";

const auth = Router();

auth.get('/me', (req, res) => {
    const user = req.user;

    res.status(200).json({message: "User authenticated", user: user});
});

export default auth;