import { CustomError } from "../../global/errors";
import { AppUser } from "../sign/core/types";
import { getUsers } from "./core/dal";

//move to helper in core
//create a custom type
function outputWhereQuery(queryParams: Express.ParsedQs) {
    let whereStr = "WHERE";
    let values: (string | number | boolean)[] = [];

    if (queryParams.searchTerm) {
        console.log(queryParams);
        whereStr += ` u.name LIKE ? OR u.email LIKE ?`;
        const likeTerm = `%${queryParams.searchTerm}%`; // Wrap the value with %
        values.push(likeTerm, likeTerm);
    }

    if (queryParams.active) {
        if (whereStr.length > 5) {
            whereStr += " AND ";
        }
        whereStr += ` u.active = ?`;
        values.push(Boolean(queryParams.active));
    }

    return {
        whereStr: whereStr.length === 5 ? "" : whereStr, // Return an empty string if no conditions are added
        values,
    };
}

export class UsersServices {
    async getAllusers(queryParams: Express.ParsedQs): Promise<AppTypes.Result<boolean, CustomError>> {
        const limit = `LIMIT ${queryParams.pageSize}`;
        const offset = `OFFSET ${Number(queryParams.pageNo) - 1 }`

        let whereQuery = outputWhereQuery(queryParams);
        let baseQuery = `
            SELECT
                u.id,
                u.name,
                u.email,
                u.active,
                u.updated_at,
                r.id as roleId, 
                r.name as roleName,
                (SELECT COUNT(id) FROM users) AS totalCount
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id 
            LEFT JOIN roles r ON ur.role_id = r.id
            ${whereQuery.whereStr}
            ORDER BY u.updated_at ${queryParams.updatedAt ?? "DESC"}
            ${limit} ${offset};
        `
        // handle Errors
        const result = await getUsers(baseQuery, whereQuery.values);
        //@ts-ignore
        return [true, null];
    }
}