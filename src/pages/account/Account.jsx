import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import AvatarUploader from '../../components/account/AvatarUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Account() {
    const { user: _user, session, updatePassword, signOut } = useAuth();
    const navigate = useNavigate();
    
    // Profile State
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [profileMessage, setProfileMessage] = useState(null);

    // Password State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityMessage, setSecurityMessage] = useState(null);

    // Initial Fetch
    useEffect(() => {
        let ignore = false;
        async function getProfile() {
            setLoading(true);
            const { user } = session || {};
            if (!user) return;

            const { data, error: _error } = await supabase
                .from('profiles')
                .select(`username, avatar_url`)
                .eq('id', user.id)
                .single();

            if (!ignore) {
                if (data) {
                    setUsername(data.username || '');
                    setAvatarUrl(data.avatar_url);
                }
                setLoading(false);
            }
        }

        getProfile();
        return () => { ignore = true; };
    }, [session]);

    // Handle Profile Update
    async function updateProfile(event) {
        event.preventDefault();

        setLoading(true);
        const { user } = session;

        const updates = {
            id: user.id,
            username,
            avatar_url: avatarUrl,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) {
            setProfileMessage({ type: 'error', text: error.message });
        } else {
            setProfileMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        }
        setLoading(false);
    }

    // Handle Password Update
    async function handlePasswordUpdate(e) {
        e.preventDefault();
        setSecurityMessage(null);

        if (password !== confirmPassword) {
            setSecurityMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        const { error } = await updatePassword(password);
        if (error) {
            setSecurityMessage({ type: 'error', text: error.message });
        } else {
            setSecurityMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPassword('');
            setConfirmPassword('');
        }
    }

    // Handle Account Deletion
    async function handleDeleteAccount() {
        if (!window.confirm('¿Estás SEGURO? Esta acción es irreversible y borrará todos tus datos.')) {
            return;
        }

        const { error } = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/delete-account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            }
        }).then(res => res.json());

        if (error) {
            alert('Error al borrar cuenta: ' + error);
        } else {
            await signOut();
            navigate('/');
        }
    }

    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-fg">Cuenta</h1>
                <p className="text-fg-muted mt-2">Gestiona tu perfil y seguridad</p>
            </header>

            <Tabs activeTab={activeTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile" active={activeTab === 'profile'} onClick={setActiveTab}>
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="security" active={activeTab === 'security'} onClick={setActiveTab}>
                        Seguridad
                    </TabsTrigger>
                    <TabsTrigger value="danger" active={activeTab === 'danger'} onClick={setActiveTab}>
                        Zona de Peligro
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" activeTab={activeTab}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Pública</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <AvatarUploader
                                    url={avatarUrl}
                                    size={150}
                                    onUpload={(url) => {
                                        setAvatarUrl(url);
                                        // Auto update profile when avatar changes (optional, but good UX)
                                    }}
                                />
                                <form onSubmit={updateProfile} className="flex-1 space-y-4 w-full">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-fg-muted">Email</label>
                                        <Input disabled value={session?.user.email} className="bg-bg-2" />
                                        <p className="text-xs text-fg-muted">El email no se puede cambiar.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium" htmlFor="username">Nombre de Usuario</label>
                                        <Input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                    
                                    {profileMessage && (
                                        <div className={`text-sm p-3 rounded ${profileMessage.type === 'error' ? 'bg-red-900/20 text-red-200' : 'bg-green-900/20 text-green-200'}`}>
                                            {profileMessage.text}
                                        </div>
                                    )}

                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" activeTab={activeTab}>
                     <Card>
                        <CardHeader>
                            <CardTitle>Contraseña</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handlePasswordUpdate} className="grid w-full max-w-sm gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="password">Nueva Contraseña</label>
                                    <Input 
                                        type="password" 
                                        id="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                    <Input 
                                        type="password" 
                                        id="confirmPassword" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>

                                {securityMessage && (
                                    <div className={`text-sm p-3 rounded ${securityMessage.type === 'error' ? 'bg-red-900/20 text-red-200' : 'bg-green-900/20 text-green-200'}`}>
                                        {securityMessage.text}
                                    </div>
                                )}

                                <Button type="submit" disabled={loading}>
                                    Actualizar Contraseña
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Danger Zone Tab */}
                <TabsContent value="danger" activeTab={activeTab}>
                    <Card className="border-red-900/50 bg-red-900/10">
                         <CardHeader>
                            <CardTitle className="text-red-400">Eliminar Cuenta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-fg-muted">
                                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten en cuenta seguro.
                                Esto eliminará tu perfil, todos tus favoritos y cualquier dato asociado.
                            </p>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteAccount}
                                className="bg-red-600 hover:bg-red-700 text-white border-none" 
                            >
                                Eliminar mi cuenta permanentemente
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
