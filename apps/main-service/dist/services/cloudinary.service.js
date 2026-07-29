"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAvatar = exports.uploadAvatar = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadAvatar = async (fileBuffer, userId) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder: `avatars/${userId}`,
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadAvatar = uploadAvatar;
const deleteAvatar = async (avatarUrl) => {
    if (!avatarUrl)
        return;
    const urlParts = avatarUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1 || uploadIndex + 1 >= urlParts.length) {
        console.error('Invalid Cloudinary URL format:', avatarUrl);
        return;
    }
    const publicIdWithVersion = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithVersion.split('.').slice(0, -1).join('.');
    console.log('Deleting avatar with public_id:', publicId);
    const result = await cloudinary_1.default.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    if (result.result !== 'ok') {
        console.error('Failed to delete from Cloudinary:', result);
    }
};
exports.deleteAvatar = deleteAvatar;
