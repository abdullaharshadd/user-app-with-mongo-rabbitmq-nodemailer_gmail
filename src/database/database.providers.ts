import * as mongoose from 'mongoose';
import { config } from 'dotenv';
config();

const mongodb_url = process.env.MONGODB_URL;
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      await mongoose.connect(mongodb_url ? mongodb_url : 'mongodb://localhost/test'),
  },
];
