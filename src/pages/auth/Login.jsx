import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      if (data?.user) {
         // Force a hard reload to ensure AuthContext picks up the session correctly
         // and to avoid any state synchronization issues
         window.location.href = '/';
      }
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-floor relative overflow-hidden">
        {/* Floor Texture & Vignette */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-0" />

      {/* Back Button */}
      <Button 
          variant="ghost" 
          className="absolute top-8 left-8 z-20 text-text-ink/60 hover:text-accent-blood gap-2 font-handwriting text-lg"
          onClick={() => navigate('/')}
      >
          <FaArrowLeft /> Volver al Codex
      </Button>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Paper Card */}
        <div 
            className="bg-[#fdfbf7] text-text-ink p-8 md:p-10 shadow-2xl relative transform -rotate-1 transition-transform hover:rotate-0 duration-500 ease-out"
            style={{
                clipPath: 'polygon(2% 0%, 99% 1%, 100% 100%, 1% 99%)',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
             {/* Red Tack */}
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-700 shadow-md border border-red-900 z-20"></div>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 filter drop-shadow-md">
                   {/* Isaac Icon or similar */}
                   <span className="text-4xl">⚡</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-text-ink tracking-wide uppercase" style={{ fontFamily: 'Upheaval, sans-serif' }}>Bienvenido de nuevo</h1>
                <p className="text-text-ink/60 mt-2 font-handwriting text-lg">Ingresa a tu cuenta para gestionar tus builds</p>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="bg-accent-blood/10 border-2 border-accent-blood/50 text-accent-blood text-sm p-3 font-handwriting text-center transform rotate-1">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-ink uppercase tracking-wider ml-1" style={{ fontFamily: 'Upheaval, sans-serif' }}>Email</label>
                        <div className="relative">
                            <Input 
                                type="email" 
                                placeholder="isaac@basement.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-transparent border-0 border-b-2 border-text-ink/20 focus:border-accent-blood rounded-none px-0 pl-8 h-12 font-handwriting text-xl placeholder:text-text-ink/30 focus:ring-0 shadow-none transition-colors"
                                required
                            />
                            <FaEnvelope className="absolute left-0 top-1/2 -translate-y-1/2 text-text-ink/40" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                         <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-bold text-text-ink uppercase tracking-wider" style={{ fontFamily: 'Upheaval, sans-serif' }}>Contraseña</label>
                            <Link to="/forgot-password" className="text-sm font-handwriting text-accent-blood hover:underline opacity-80 hover:opacity-100 transition-opacity">
                                ¿Olvidaste tu contraseña?
                            </Link>
                         </div>
                         <div className="relative">
                            <Input 
                                type="password" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent border-0 border-b-2 border-text-ink/20 focus:border-accent-blood rounded-none px-0 pl-8 h-12 font-handwriting text-xl placeholder:text-text-ink/30 focus:ring-0 shadow-none transition-colors"
                                required
                            />
                             <FaLock className="absolute left-0 top-1/2 -translate-y-1/2 text-text-ink/40" />
                        </div>
                    </div>

                    <Button 
                        className="w-full bg-text-ink hover:bg-black text-[#fdfbf7] font-bold py-6 mt-6 uppercase tracking-widest text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1" 
                        type="submit" 
                        style={{ fontFamily: 'Upheaval, sans-serif' }}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Entrar al Sótano'}
                    </Button>
                </form>

                 <div className="mt-8 text-center pt-6 border-t-2 border-dashed border-text-ink/10">
                    <p className="text-text-ink/60 font-handwriting text-lg">
                        ¿No tienes cuenta? <Link to="/register" className="text-accent-blood font-bold hover:underline decoration-2 underline-offset-2">Únete al descenso</Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
