import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { Card, CardContent } from '../../../components/ui/Card';

export default function AdminItemEditor({ mode = 'create' }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(mode === 'edit');
    
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        item_type: 'passive', // passive, active, trinket, etc.
        tags: '', // comma separated for UI
        sprite_url: ''
    });

    useEffect(() => {
        if (mode === 'edit' && id) {
            fetchItem(id);
        }
    }, [mode, id]);

    const fetchItem = async (itemId) => {
        const { data, _error } = await supabase
            .from('codex_items')
            .select('*')
            .eq('id', itemId)
            .single();
        
        if (data) {
            setFormData({
                ...data,
                tags: data.tags ? data.tags.join(', ') : ''
            });
        }
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
            item_type: formData.item_type,
            sprite_url: formData.sprite_url,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        let error;
        if (mode === 'create') {
            const { error: insertError } = await supabase.from('codex_items').insert([payload]);
            error = insertError;
        } else {
            const { error: updateError } = await supabase
                .from('codex_items')
                .update(payload)
                .eq('id', id);
            error = updateError;
        }

        setLoading(false);

        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            navigate('/admin/items');
        }
    };

    if (fetching) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container mx-auto p-6 pt-24 max-w-2xl animate-in fade-in">
             <Button variant="ghost" onClick={() => navigate('/admin/items')} className="mb-4 gap-2 pl-0 text-muted hover:text-fg">
                <FaArrowLeft /> Back to Items
            </Button>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-serif font-bold text-gold">
                    {mode === 'create' ? 'New Item' : 'Edit Item'}
                </h1>
            </div>

            <Card className="bg-bg-1/50 border-white/10">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase">Name</label>
                            <Input 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. The D6"
                                required
                                className="bg-bg-0 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold text-muted uppercase">Slug (URL)</label>
                            <Input 
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="auto-generated if empty"
                                className="bg-bg-0 border-white/10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase">Type</label>
                                <select 
                                    name="item_type"
                                    value={formData.item_type}
                                    onChange={handleChange}
                                    className="w-full bg-bg-0 border border-white/10 rounded-md h-10 px-3 text-fg focus:border-gold/50 outline-none"
                                >
                                    <option value="passive">Passive</option>
                                    <option value="active">Active</option>
                                    <option value="trinket">Trinket</option>
                                    <option value="card">Card</option>
                                    <option value="pill">Pill</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase">Tags (comma separated)</label>
                                <Input 
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="offensive, dice, special"
                                    className="bg-bg-0 border-white/10"
                                />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase">Sprite URL</label>
                            <Input 
                                name="sprite_url"
                                value={formData.sprite_url}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="bg-bg-0 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase">Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className="w-full bg-bg-0 border border-white/10 rounded-md p-3 text-fg placeholder-muted/50 focus:border-gold/50 outline-none resize-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                             <Button type="button" variant="ghost" onClick={() => navigate('/admin/items')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-gold text-black font-bold gap-2">
                                <FaSave /> {loading ? 'Saving...' : 'Save Item'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
