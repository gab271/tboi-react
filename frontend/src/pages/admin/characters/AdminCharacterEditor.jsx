import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { Card, CardContent } from '../../../components/ui/Card';

export default function AdminCharacterEditor({ mode = 'create' }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(mode === 'edit');
    
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        items_started: '',
        sprite_url: ''
    });

    useEffect(() => {
        if (mode === 'edit' && id) fetchChar(id);
    }, [mode, id]);

    const fetchChar = async (cid) => {
        const { data } = await supabase.from('codex_characters').select('*').eq('id', cid).single();
        if (data) setFormData(data);
        setFetching(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name: formData.name,
            slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            description: formData.description,
            items_started: formData.items_started,
            sprite_url: formData.sprite_url
        };

        let error;
        if (mode === 'create') {
            const { error: insertError } = await supabase.from('codex_characters').insert([payload]);
            error = insertError;
        } else {
            const { error: updateError } = await supabase.from('codex_characters').update(payload).eq('id', id);
            error = updateError;
        }

        setLoading(false);
        if (error) alert(`Error: ${error.message}`);
        else navigate('/admin/characters');
    };

    if (fetching) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container mx-auto p-6 pt-24 max-w-2xl animate-in fade-in">
             <Button variant="ghost" onClick={() => navigate('/admin/characters')} className="mb-4 gap-2 pl-0 text-muted hover:text-fg">
                <FaArrowLeft /> Back to Characters
            </Button>
            
            <h1 className="text-3xl font-serif font-bold text-gold mb-6">
                {mode === 'create' ? 'New Character' : 'Edit Character'}
            </h1>

            <Card className="bg-bg-1/50 border-white/10">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase">Name</label>
                            <Input name="name" value={formData.name} onChange={handleChange} required className="bg-bg-0 border-white/10" />
                        </div>
                        
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-muted uppercase">Image URL</label>
                            <Input name="sprite_url" value={formData.sprite_url} onChange={handleChange} className="bg-bg-0 border-white/10" />
                        </div>

                         <div className="space-y-2">
                             <label className="text-xs font-bold text-muted uppercase">Starting Items</label>
                            <Input name="items_started" value={formData.items_started} onChange={handleChange} className="bg-bg-0 border-white/10" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-bg-0 border border-white/10 rounded-md p-3 text-fg focus:border-gold/50 outline-none" />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="submit" disabled={loading} className="bg-gold text-black font-bold gap-2">
                                <FaSave /> {loading ? 'Saving...' : 'Save Character'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
