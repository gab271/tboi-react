const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const supabaseAdmin = require('../lib/supabaseAdmin');
const { requireAuth } = require('../middleware/authMiddleware');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function validateMagicBytes(buffer, mimetype) {
    if (buffer.length < 12) return false;
    if (mimetype === 'image/jpeg')
        return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    if (mimetype === 'image/png')
        return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E &&
               buffer[3] === 0x47 && buffer[4] === 0x0D && buffer[5] === 0x0A &&
               buffer[6] === 0x1A && buffer[7] === 0x0A;
    if (mimetype === 'image/gif')
        return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
    if (mimetype === 'image/webp')
        return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
               buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return false;
}

// Wrapper to check admin role
const requireAdmin = async (req, res, next) => {
    // req.user is populated by requireAuth
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user has admin role - adjust based on your actual data model
    // Example 1: Check metadata
    // if (req.user.app_metadata?.role !== 'admin') { ... }
    
    // Example 2: Check profiles table
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();
        
    if (error || !profile || profile.role !== 'admin') {
         // Allow service role overrides if needed, but for now strict admin
         console.warn(`User ${req.user.id} attempted admin action without permission.`);
         return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
        }
    }
});

/**
 * POST /:externalId/image
 * Uploads, optimizes (WebP), and stores item images.
 */
router.post('/:externalId/image', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
    const { externalId } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    if (!/^\d+$/.test(externalId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
    }

    if (!validateMagicBytes(file.buffer, file.mimetype)) {
        return res.status(400).json({ error: 'File content does not match declared type' });
    }

    try {
        const timestamp = Date.now();
        const bucketName = 'item-images';
        
        // 1. Process Thumb (128x128 fit contain)
        const thumbBuffer = await sharp(file.buffer)
            .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 75 })
            .toBuffer();

        // 2. Process Full (512x512 fit contain or cover based on preference)
        const fullBuffer = await sharp(file.buffer)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 85 })
            .toBuffer();

        // 3. Define paths
        const thumbPath = `items/${externalId}/thumb-${timestamp}.webp`;
        const fullPath = `items/${externalId}/full-${timestamp}.webp`;

        // 4. Upload to Supabase Storage
        // Upload Thumb
        const { error: thumbUploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(thumbPath, thumbBuffer, {
                contentType: 'image/webp',
                cacheControl: '31536000',
                upsert: true
            });

        if (thumbUploadError) throw thumbUploadError;

        // Upload Full
        const { error: fullUploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fullPath, fullBuffer, {
                contentType: 'image/webp',
                cacheControl: '31536000',
                upsert: true
            });

        if (fullUploadError) throw fullUploadError;

        // 5. Update Database Record
        const { data, error: dbError } = await supabaseAdmin
            .from('codex_items')
            .update({
                image_thumb_path: thumbPath,
                image_full_path: fullPath,
                updated_at: new Date().toISOString()
            })
            .eq('external_id', externalId)
            .select()
            .single();

        if (dbError) throw dbError;

        res.json({
            message: 'Image uploaded and processed successfully',
            item: data,
            paths: {
                thumb: thumbPath,
                full: fullPath
            }
        });

    } catch (err) {
        console.error('Image upload error:', err);
        res.status(500).json({ error: 'Failed to process image upload' });
    }
});

module.exports = router;
