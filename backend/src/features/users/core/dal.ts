import { DTO, pool } from "../../../global/database";

export async function getAllUsers(email: string) {
    const connection = await pool.getConnection();
    try {
        const query = 'SELECT id, name, active, email FROM users';
        const values = [email];
        const result = await new DTO({query, values, connection}).query();
        return result;
    } finally {
        connection.release();
    }
}