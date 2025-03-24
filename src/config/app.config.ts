import { config } from 'dotenv';

config();

const destination: string = (
  process.env.UPLOAD_DESTINATION || 'local'
).toLowerCase();
const validDestination: string[] = ['local', 'cloud'];

export const PORT = parseInt(process.env.PORT || '3000');
export const SECRET_KEY = process.env.SECRET_KEY || 'rahasia';
export const APP_URL: string = process.env.APP_URL || 'http://localhost:3000';
export const UPLOAD_DESTINATION: string = validDestination.includes(destination)
  ? destination
  : 'local';
export const GOOGLE_API_KEY_FILE = process.env.GOOGLE_API_KEY_FILE || '';
export const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
