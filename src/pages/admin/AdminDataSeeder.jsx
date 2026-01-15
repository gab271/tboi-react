import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabaseClient';
import { itemsData } from '../../features/items/data/mockItems';
import { bossesData } from '../../features/bosses/data/bossesData';
import { charactersData } from '../../features/characters/data/charactersData';
import { FaDatabase, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminDataSeeder({ onComplete }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const seedData = async () => {
        if (!window.confirm('This will import local JSON data into the Supabase database. Duplicates might be created if not careful. Continue?')) return;
        
        setLoading(true);
        setStatus('Starting import...');

        try {
            // 1. Seed Items
            setStatus('Importing Items...');
            const itemsPayload = itemsData.map(i => ({
                name: i.name,
                slug: i.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                description: i.description,
                item_type: i.type,
                sprite_url: i.sprite || '', // check if sprite property matches
                tags: i.tags || [],
                source: 'seed'
            }));

            // Upsert items based on slug to avoid duplicates
            // Note: upsert works if there is a unique constraint on slug, which we added in SQL
            const { error: itemsError } = await supabase.from('codex_items').upsert(itemsPayload, { onConflict: 'slug', ignoreDuplicates: true });
            if (itemsError) throw itemsError;

            // 2. Seed Bosses
            setStatus('Importing Bosses...');
            const bossesPayload = bossesData.map(b => ({
                name: b.name,
                slug: b.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                health: 'N/A', // Data file might not have health
                sprite_url: b.sprite_url,
                source: 'seed'
            }));
             const { error: bossesError } = await supabase.from('codex_bosses').upsert(bossesPayload, { onConflict: 'slug', ignoreDuplicates: true });
            if (bossesError) throw bossesError;

            // 3. Seed Characters
            setStatus('Importing Characters...');
            const charsPayload = charactersData.map(c => ({
                name: c.name,
                slug: c.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                sprite_url: c.sprite_url,
                source: 'seed'
            }));
            const { error: charError } = await supabase.from('codex_characters').upsert(charsPayload, { onConflict: 'slug', ignoreDuplicates: true });
            if (charError) throw charError;

            setStatus('Import Complete!');
            setTimeout(() => setStatus(''), 3000);
            if (onComplete) onComplete();

        } catch (error) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-bg-1/30 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div>
                 <h3 className="font-serif font-bold text-gold flex items-center gap-2">
                    <FaDatabase /> Database Seeder
                 </h3>
                 <p className="text-muted text-sm">
                    {status || "Your database seems empty. Import local data?"}
                 </p>
            </div>
            <Button onClick={seedData} disabled={loading} className="bg-white/10 hover:bg-gold/20 text-gold border border-gold/20">
                {loading ? 'Importing...' : 'Import Data'}
            </Button>
        </div>
    );
}
