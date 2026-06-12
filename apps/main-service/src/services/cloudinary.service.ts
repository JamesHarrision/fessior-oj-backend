import cloudinary from '../config/cloudinary';

export const uploadAvatar = async (fileBuffer: Buffer, userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `avatars/${userId}`,
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteAvatar = async (avatarUrl: string) => {
  if (!avatarUrl) return;
  const publicId = avatarUrl.split('/').slice(-2).join('/').split('.')[0];
  await cloudinary.uploader.destroy(publicId);
};