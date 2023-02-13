import cloudinaryModule from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import env from './env.config.js';

const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'AVATAR',
  },
});

const coverPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'USER_COVER',
  },
});

const cardCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'CARD_COVER',
  },
});

export { avatarStorage, cardCoverStorage, coverPhotoStorage };
