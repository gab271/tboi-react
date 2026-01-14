import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FaEnvelope, FaLock, FaUser, FaArrowLeft } from 'react-icons/fa';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    if (password.length < 6) {
        return setError('La contraseña debe tener al menos 6 caracteres');
    }

    try {
      setError('');
      setLoading(true);
      const { data, error } = await signUp(email, password, { username });
      
      if (error) throw error;
      
      // Navigate to home after successful registration
      if (data?.user) {
        navigate('/');
      }
    } catch (error) {
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-bg-0 z-0" />
      <div className="absolute inset-0 bg-gradient-radial from-bg-1/50 to-bg-0 z-0 pointer-events-none" />
      
      {/* Back Button */}
      <Button 
          variant="ghost" 
          className="absolute top-8 left-8 z-10 text-muted hover:text-gold gap-2"
          onClick={() => navigate('/')}
      >
          <FaArrowLeft /> Volver al Codex
      </Button>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-bg-1 to-black border border-white/10 text-gold shadow-2xl shadow-black mb-4">
                <span className="text-4xl">🗝️</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-gold tracking-wide">Únete al Descenso</h1>
            <p className="text-muted mt-2">Crea tu cuenta para guardar tus builds y progreso</p>
        </div>

        <Card className="bg-bg-1/50 backdrop-blur-md border-white/10 shadow-2xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg text-fg-muted font-normal uppercase tracking-widest">Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-200 text-sm p-3 rounded-md text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Usuario</label>
                        <Input 
                            type="text" 
                            placeholder="Judas123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            icon={FaUser}
                            className="bg-black/20 border-white/10 focus:border-gold/50 h-11"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Email</label>
                        <Input 
                            type="email" 
                            placeholder="isaac@basement.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={FaEnvelope}
                            className="bg-black/20 border-white/10 focus:border-gold/50 h-11"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Contraseña</label>
                            <Input 
                                type="password" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-black/20 border-white/10 focus:border-gold/50 h-11"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Confirmar</label>
                            <Input 
                                type="password" 
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-black/20 border-white/10 focus:border-gold/50 h-11"
                                required
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-12 text-base font-serif font-bold bg-gold hover:bg-gold/90 text-black mt-4 shadow-lg shadow-gold/10"
                    >
                        {loading ? 'Creando cuenta...' : 'Comenzar Aventura'}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-bg-1 px-2 text-muted">O</span>
                    </div>
                </div>

                <div className="text-center text-sm">
                    <span className="text-muted">¿Ya tienes cuenta? </span>
                    <Link to="/login" className="text-gold font-bold hover:underline">
                        Inicia Sesión
                    </Link>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
