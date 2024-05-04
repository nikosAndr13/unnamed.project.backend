import { pool } from "./db.services"
import { User } from "../Types/userType";
import {DiscordUserData, UserAuthData} from "../Types/authType";
import {HttpException} from "../Types/error";

// service for getting data for user from db
export const getAllUsers = async (): Promise<User[]> => {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM Users');
    const users = result.rows;
    client.release();
    return users;
}


/*
    This method is responsible for checking if user already exists with
    given discord id in our database. It is returning undefined if it doesn't and
    uid of the user if it does.
 */
export const checkIfUserExistsByDiscordId = async( discordID: string):Promise<string | undefined> => {
    const client = await pool.connect();
    const query = "SELECT discordid, uid FROM users WHERE discordid = $1";
    const values = [discordID];

    const dbResponse = await client.query<User>(query, values);
    if(dbResponse.rows.length === 0){
        return undefined;
    }

    return dbResponse.rows[0].uid;

}

export const registerUser = async (userData: UserAuthData):Promise<string> => {

    const client = await pool.connect();

    const query = "INSERT INTO users(username, discordID, avatarID, auth_token) VALUES ($1, $2, $3, $4) RETURNING uid";
    const values = [userData.username, userData.id, userData.avatar, userData.refresh_token];

    const dbres = await client.query<User>(query, values);

    if(!dbres){
        throw new HttpException(500, "Failed to insert new user to db");
    } else{
        return dbres.rows[0].uid;
    }

};