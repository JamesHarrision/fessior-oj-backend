import dotenv from 'dotenv';

dotenv.config();

process.env.MONGO_URI =
  process.env.MONGO_URI || 'mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
