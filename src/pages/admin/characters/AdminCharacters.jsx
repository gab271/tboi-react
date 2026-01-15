import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FaPlus, FaTrash, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function AdminCharacters() {
    const [chars, setChars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchChars();
    }, []);

    const fetchChars = async () => {
        setLoading(true);
        const { data } = await supabase.from('codex_characters').select('*').order('created_at', { ascending: false });
        if (data) setChars(data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete character?')) return;
        const { error } = await supabase.from('codex_characters').delete().eq('id', id);
        if (!error) setChars(chars.filter(c => c.id !== id));
    };

    const filtered = chars.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="container mx-auto p-6 pt-24 space-y-6 animate-in fade-in">
             <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2 gap-2 pl-0 text-muted hover:text-fg">
                <FaArrowLeft /> Back to Dashboard
            </Button>
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-serif font-bold text-gold">Manage Characters</h1>
                     <p className="text-muted text-sm">Playable characters roster</p>
                </div>
                <Button className="bg-gold text-black gap-2" onClick={() => navigate('/admin/characters/new')}>
                    <FaPlus size={12} /> New Character
                </Button>
            </div>

            <div className="flex items-center mb-6">
                 <Input 
                    placeholder="Search characters..." 
                    icon={FaSearch} 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm bg-bg-1 border-white/10"
                 />
            </div>

            <div className="bg-bg-1/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5 text-xs uppercase text-muted font-medium">
                        <tr>
                            <th className="p-4 pl-6">Name</th>
                            <th className="p-4">Starts With</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? <tr><td colSpan={3} className="p-8 text-center text-muted">Loading...</td></tr> : 
                        filtered.map((char) => (
                            <tr key={char.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 pl-6 font-medium text-fg">{char.name}</td>
                                <td className="p-4 text-muted text-sm">{char.items_started || '-'}</td>
                                <td className="p-4 text-right pr-6">
                                     <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-red-400" onClick={() => handleDelete(char.id)}>
                                        <FaTrash size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
