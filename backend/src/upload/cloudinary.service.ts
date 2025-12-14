import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    /**
     * Verify that a URL belongs to our Cloudinary account
     */
    isValidCloudinaryUrl(url: string): boolean {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        if (!cloudName) return false;

        return url.includes(`res.cloudinary.com/${cloudName}`);
    }

    /**
     * Extract public_id from Cloudinary URL
     * Example: https://res.cloudinary.com/demo/image/upload/v1234/folder/image.jpg
     * Returns: folder/image
     */
    extractPublicId(url: string): string | null {
        try {
            const regex = /\/v\d+\/(.+)\.\w+$/;
            const match = url.match(regex);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }

    /**
     * Delete an image from Cloudinary
     */
    async deleteImage(publicId: string): Promise<boolean> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            this.logger.log(`Deleted image ${publicId}: ${result.result}`);
            return result.result === 'ok';
        } catch (error) {
            this.logger.error(`Failed to delete image ${publicId}:`, error);
            return false;
        }
    }

    /**
     * Delete multiple images from Cloudinary
     */
    async deleteImages(publicIds: string[]): Promise<void> {
        if (publicIds.length === 0) return;

        try {
            await cloudinary.api.delete_resources(publicIds);
            this.logger.log(`Deleted ${publicIds.length} images`);
        } catch (error) {
            this.logger.error('Failed to delete images:', error);
        }
    }

    /**
     * Get Cloudinary instance for advanced operations
     */
    getCloudinary() {
        return cloudinary;
    }
}
