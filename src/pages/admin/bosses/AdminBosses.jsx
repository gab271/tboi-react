import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FaPlus, FaTrash, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function AdminBosses() {
    const [bosses, setBosses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBosses();
    }, []);

    const fetchBosses = async () => {
        setLoading(true);
        const { data, error: _error } = await supabase
            .from('codex_bosses')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setBosses(data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this boss?')) return;
        
        const { error } = await supabase.from('codex_bosses').delete().eq('id', id);
        if (!error) {
            setBosses(bosses.filter(b => b.id !== id));
        } else {
            alert('Error deleting boss: ' + error.message);
        }
    };

    const filteredBosses = bosses.filter(boss => 
        boss.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 pt-24 space-y-6 animate-in fade-in">
             <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2 gap-2 pl-0 text-muted hover:text-fg">
                <FaArrowLeft /> Back to Dashboard
            </Button>
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-serif font-bold text-gold">Manage Bosses</h1>
                     <p className="text-muted text-sm">Create, edit and remove canon bosses</p>
                </div>
                <Button className="bg-gold text-black gap-2" onClick={() => navigate('/admin/bosses/new')}>
                    <FaPlus size={12} /> New Boss
                </Button>
            </div>

            <div className="flex items-center mb-6">
                 <Input 
                    placeholder="Search bosses..." 
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
                            <th className="p-4">Health</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                         {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-muted">Loading Codex...</td></tr>
                        ) : filteredBosses.length === 0 ? (
                             <tr><td colSpan={4} className="p-8 text-center text-muted">No bosses found.</td></tr>
                        ) : (
                            filteredBosses.map((boss) => (
                                <tr key={boss.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 pl-6 font-medium text-fg">{boss.name}</td>
                                    <td className="p-4 text-muted text-sm">{boss.health || 'N/A'}</td>
                                    <td className="p-4 text-muted text-sm font-mono opacity-70">{boss.slug}</td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* We will route to a generic editor or specific if created */}
                                             <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-red-400" onClick={() => handleDelete(boss.id)}>
                                                <FaTrash size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
