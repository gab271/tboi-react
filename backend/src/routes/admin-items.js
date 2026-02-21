const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const supabaseAdmin = require('../lib/supabaseAdmin');
const { requireAuth } = require('../middleware/authMiddleware'); // Check if this exports requireAuth

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

// Memory storage for Multer - we process buffer directly
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
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
        res.status(500).json({ error: 'Failed to process image upload', details: err.message });
    }
});

module.exports = router;
