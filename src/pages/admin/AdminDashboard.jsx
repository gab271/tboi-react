import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBoxOpen, FaSkull, FaChild, FaTools, FaMagic } from 'react-icons/fa';
import AdminDataSeeder from './AdminDataSeeder';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching admin stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: 'Users', value: stats?.totalUsers ?? '-', icon: FaUsers, color: 'text-blue-400', action: () => navigate('/admin/users') },
        { title: 'Items', value: stats?.totalItems ?? '-', icon: FaBoxOpen, color: 'text-gold', action: () => navigate('/admin/items') },
        { title: 'Bosses', value: stats?.totalBosses ?? '-', icon: FaSkull, color: 'text-red-500', action: () => navigate('/admin/bosses') },
        { title: 'Characters', value: stats?.totalCharacters ?? '-', icon: FaChild, color: 'text-purple-400', action: () => navigate('/admin/characters') },
        { title: 'Builds', value: stats?.totalBuilds ?? '-', icon: FaTools, color: 'text-green-400' },
    ];

    return (
        <div className="container mx-auto p-6 pt-24 space-y-8 animate-in fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif font-bold text-gold">Admin Dashboard</h1>
                <span className="text-xs font-mono bg-bg-1 border border-white/10 px-2 py-1 rounded text-muted">
                    v1.0.0 Codex Admin
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <Card key={card.title} className="bg-bg-1/50 border-white/10 hover:border-gold/30 transition-all cursor-pointer" onClick={card.action}>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm font-medium text-muted uppercase tracking-widest">{card.title}</p>
                                <div className="text-3xl font-bold mt-2">{loading ? '...' : card.value}</div>
                            </div>
                            <div className={`p-3 rounded-full bg-white/5 ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Placeholder */}
                <Card className="col-span-2 bg-bg-1/30 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-normal text-muted">Recent Codex Updates</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="text-sm text-muted-foreground p-4 text-center italic">
                           Audit Logs module not yet connected.
                       </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-bg-1/30 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-lg font-normal text-muted">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start gap-2 bg-white/5 hover:bg-gold/20 hover:text-gold text-muted transition-all" variant="ghost" onClick={() => navigate('/admin/items/new')}>
                            <FaMagic /> Add New Item
                        </Button>
                        <Button className="w-full justify-start gap-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-muted transition-all" variant="ghost" onClick={() => navigate('/admin/bosses/new')}>
                            <FaSkull /> Add New Boss
                        </Button>
                        <Button className="w-full justify-start gap-2 bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 text-muted transition-all" variant="ghost" onClick={() => navigate('/admin/characters/new')}>
                            <FaChild /> Add New Character
                        </Button>
                    </CardContent>
                </Card>

                {/* Database Seeder (Visible if counts are low) */}
                {(stats?.totalItems === 0 || stats?.totalBosses === 0) && (
                     <div className="col-span-2 lg:col-span-1">
                        <AdminDataSeeder onComplete={() => window.location.reload()} />
                     </div>
                )}
            </div>
        </div>
    );
}
