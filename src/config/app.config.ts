import { config } from 'dotenv';

config();

export const PORT = parseInt(process.env.PORT || '3000');
export const SECRET_KEY = process.env.SECRET_KEY || 'rahasia';
export const GOOGLE_API_KEY_FILE = process.env.GOOGLE_API_KEY_FILE || '';
export const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
