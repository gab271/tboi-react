import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const lastSubmitTime = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Antispam protection
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;

    if (isSubmitting) return;

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    if (password.length < 6) {
        return setError('La contraseña debe tener al menos 6 caracteres');
    }

    try {
      setError('');
      setIsSubmitting(true);

      // Check if username exists
      const { count, error: checkError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);

      if (checkError) {
         console.error(checkError);
      } else if (count > 0) {
         setIsSubmitting(false);
         return setError('Este nombre de usuario ya está ocupado. Elige otro.');
      }

      const { data, error } = await signUp(email, password, { username });
      
      if (error) throw error;
      
      if (data?.user) {
        navigate('/');
      }
    } catch (error) {
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setIsSubmitting(false);
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
            className="bg-[#fdfbf7] text-text-ink p-8 md:p-10 shadow-2xl relative transform rotate-1 transition-transform hover:rotate-0 duration-500 ease-out"
            style={{
                clipPath: 'polygon(1% 1%, 99% 0%, 98% 99%, 2% 100%)',
                boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
             {/* Red Tack */}
             <div className="absolute -top-3 right-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-red-700 shadow-md border border-red-900 z-20"></div>

            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-2 filter drop-shadow-md">
                     <span className="text-4xl">🗝️</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-text-ink tracking-wide uppercase" style={{ fontFamily: 'Upheaval, sans-serif' }}>Únete al Descenso</h1>
                <p className="text-text-ink/60 mt-1 font-handwriting text-lg">Crea tu cuenta para guardar tus builds</p>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="bg-accent-blood/10 border-2 border-accent-blood/50 text-accent-blood text-sm p-3 font-handwriting text-center transform -rotate-1">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-text-ink uppercase tracking-wider ml-1" style={{ fontFamily: 'Upheaval, sans-serif' }}>Usuario</label>
                        <div className="relative">
                            <Input 
                                type="text" 
                                placeholder="Isaac"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-transparent border-0 border-b-2 border-text-ink/20 focus:border-accent-blood rounded-none px-0 pl-8 h-12 font-handwriting text-xl placeholder:text-text-ink/30 focus:ring-0 shadow-none transition-colors"
                                required
                            />
                            <FaUser className="absolute left-0 top-1/2 -translate-y-1/2 text-text-ink/40" />
                        </div>
                    </div>


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
                        <label className="text-sm font-bold text-text-ink uppercase tracking-wider ml-1" style={{ fontFamily: 'Upheaval, sans-serif' }}>Contraseña</label>
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

                     <div className="space-y-2">
                        <label className="text-sm font-bold text-text-ink uppercase tracking-wider ml-1" style={{ fontFamily: 'Upheaval, sans-serif' }}>Confirmar</label>
                        <div className="relative">
                            <Input 
                                type="password" 
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Invocando...' : 'Crear Cuenta'}
                    </Button>
                </form>

                 <div className="mt-8 text-center pt-6 border-t-2 border-dashed border-text-ink/10">
                    <p className="text-text-ink/60 font-handwriting text-lg">
                        ¿Ya tienes cuenta? <Link to="/login" className="text-accent-blood font-bold hover:underline decoration-2 underline-offset-2">Inicia Sesión</Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register;