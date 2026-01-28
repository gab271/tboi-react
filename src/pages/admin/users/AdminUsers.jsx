import { useEffect, useState } from 'react';
import { adminService } from '../../../services/admin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FaTrash, FaSearch, FaUserShield, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getUsers();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            await adminService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            alert('Error deleting user: ' + error.message);
        }
    };

    const handlePromote = async (id) => {
        if (!window.confirm('Promote this user to Admin?')) return;
        try {
            await adminService.promoteUser(id);
            alert('User promoted! Note: They may need to relogin.');
            fetchUsers(); // Refresh to see updated metadata if possible
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.id || '').includes(search)
    );

    return (
        <div className="container mx-auto p-6 pt-24 space-y-6 animate-in fade-in">
             <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2 gap-2 pl-0 text-muted hover:text-fg">
                <FaArrowLeft /> Back to Dashboard
            </Button>
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-serif font-bold text-blue-400">User Management</h1>
                     <p className="text-muted text-sm">View and manage registered users</p>
                </div>
                <div className="text-right">
                    <span className="text-xl font-bold">{users.length}</span> <span className="text-muted text-sm">Total Users</span>
                </div>
            </div>

            <div className="flex items-center mb-6">
                 <Input 
                    placeholder="Search by email or ID..." 
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
                            <th className="p-4 pl-6">User / Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4">Last Sign In</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted">Loading Users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                             <tr><td colSpan={5} className="p-8 text-center text-muted">No users found.</td></tr>
                        ) : (
                            filteredUsers.map((user) => {
                                const isAdmin = user.app_metadata?.role === 'admin';
                                return (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-fg flex items-center gap-2">
                                                {isAdmin && <FaUserShield className="text-gold" />}
                                                {user.email}
                                            </span>
                                            <span className="text-[10px] font-mono text-muted opacity-50">{user.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${isAdmin ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-muted'}`}>
                                            {user.app_metadata?.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted text-sm">
                                        {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}
                                    </td>
                                    <td className="p-4 text-muted text-sm">
                                        {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'MMM d, HH:mm') : 'Never'}
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             {!isAdmin && (
                                                <Button size="xs" variant="ghost" className="h-8 text-muted hover:text-gold" onClick={() => handlePromote(user.id)} title="Promote to Admin">
                                                    <FaUserShield />
                                                </Button>
                                             )}
                                             <Button size="icon" variant="ghost" className="h-8 w-8 text-muted hover:text-red-400" onClick={() => handleDelete(user.id)} title="Delete User">
                                                <FaTrash size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
