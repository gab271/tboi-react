/**
 * Dataset Loader V2 - Carga datasets versionados para el parser
 * Permite mantener diferentes offsets/totales por versión del juego
 */
const fs = require('fs');
const path = require('path');

class DatasetLoader {
    constructor() {
        this.cache = new Map();
        this.basePath = path.join(__dirname, 'versions');
    }

    /**
     * Carga un dataset específico para una versión
     * @param {string} version - Versión del juego (repentance_plus, repentance, afterbirth_plus)
     * @param {string} type - Tipo de dataset (offsets, characters, endings, items, secrets, achievements)
     * @returns {Object} Dataset parseado
     */
    getDataset(version, type) {
        const cacheKey = `${version}:${type}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const filePath = path.join(this.basePath, version, `${type}.json`);

        if (!fs.existsSync(filePath)) {
            // Fallback a repentance_plus si no existe la versión
            const fallbackPath = path.join(this.basePath, 'repentance_plus', `${type}.json`);
            if (fs.existsSync(fallbackPath)) {
                console.warn(`[DatasetLoader] Fallback to repentance_plus for ${cacheKey}`);
                const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
                this.cache.set(cacheKey, data);
                return data;
            }
            throw new Error(`Dataset not found: ${cacheKey}`);
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.cache.set(cacheKey, data);

        return data;
    }

    /**
     * Obtiene los offsets para una versión
     */
    getOffsets(version) {
        return this.getDataset(version, 'offsets');
    }

    /**
     * Obtiene los datos de personajes para una versión
     */
    getCharacters(version) {
        return this.getDataset(version, 'characters');
    }

    /**
     * Obtiene los endings para una versión
     */
    getEndings(version) {
        try {
            return this.getDataset(version, 'endings');
        } catch {
            // Endings pueden no existir, retornar default
            return {
                total: 17,
                endings: []
            };
        }
    }

    /**
     * Obtiene los items para una versión
     */
    getItems(version) {
        try {
            return this.getDataset(version, 'items');
        } catch {
            return {
                total: 733,
                items: []
            };
        }
    }

    /**
     * Obtiene los achievements para una versión
     */
    getAchievements(version) {
        try {
            return this.getDataset(version, 'achievements');
        } catch {
            return {
                total: 637,
                achievements: []
            };
        }
    }

    /**
     * Obtiene los secretos/achievements para una versión (legacy alias)
     */
    getSecrets(version) {
        return this.getAchievements(version);
    }

    /**
     * Lista las versiones disponibles
     */
    getAvailableVersions() {
        try {
            return fs.readdirSync(this.basePath)
                .filter(f => fs.statSync(path.join(this.basePath, f)).isDirectory());
        } catch {
            return ['repentance_plus'];
        }
    }

    /**
     * Limpia la cache
     */
    clearCache() {
        this.cache.clear();
    }
}

module.exports = new DatasetLoader();
