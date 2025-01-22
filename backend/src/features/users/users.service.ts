import { CustomError } from "../../global/errors";
import { AppUser } from "../sign/core/types";
import { getAllUsers } from "./core/dal";

export class UsersServices {
    async getAllusers(): Promise<AppTypes.Result<AppUser[], CustomError>> {
        const users = await getAllUsers();
        return [null, error]
    }
}