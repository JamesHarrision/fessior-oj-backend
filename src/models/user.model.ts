import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser {
  name: string,
  email: string,
  passwordHash: string,
  role: 'admin' | 'user',
  isActive: boolean
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date,
  updatedAt: Date
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Tên là bắt buộc'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false // Mặc định không trả về field này khi query
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
    versionKey: false // Tắt trường __v mặc định của Mongoose
  }
);

const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;


