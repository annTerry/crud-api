import * as dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 4000;
const DEFAULT_URL = '/api/users';

type UserType = { id?: string, username: string, age: number, hobbies: string[] };
type USERS_TYPE = { [id: string]: UserType };
const USERS: USERS_TYPE = {};

const STATUS = {'OK':200, 'SAVED':201, 'DELETED':204, 'WRONG':400, 'NOT_FOUND':404, 'FAIL':500};

export {PORT, DEFAULT_URL, USERS, USERS_TYPE, UserType, STATUS}