import { UploadApiResponse, UploadApiOptions } from "cloudinary";
import streamifier from "streamifier";
import cloudinary from "./cloudinary";

interface UploadBufferOptions {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  resourceType?: "image" | "video" | "raw" | "auto";
  transformation?: UploadApiOptions["transformation"];
}

export const uploadBuffer = (
  buffer: Buffer,
  options: UploadBufferOptions
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        overwrite: options.overwrite ?? true,
        resource_type: options.resourceType ?? "image",
        transformation: options.transformation,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary upload failed."));
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};