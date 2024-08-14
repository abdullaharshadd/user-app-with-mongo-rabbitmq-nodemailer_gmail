import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: String,
  avatar: {
    hash: String,
    base64: String
  }
});
