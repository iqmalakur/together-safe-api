import { config } from 'dotenv';

config();

export const PORT: number = parseInt(process.env.PORT || '3000');
