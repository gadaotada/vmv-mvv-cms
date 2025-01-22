import { DTO, pool } from "../../../global/database";

export async function getUsers(query: string, values: any) {
    const connection = await pool.getConnection();
    try {
        const result = await new DTO({query, values, connection}).query();
        return result;
    } finally {
        connection.release();
    }
}