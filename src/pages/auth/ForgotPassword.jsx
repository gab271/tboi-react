import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      const { error } = await resetPasswordForEmail(email);
      if (error) throw error;
      setMessage('Check your inbox for password reset instructions');
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-floor relative overflow-hidden">
        {/* Environment */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-multiply z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-0" />

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate('/login')} className="pl-0 gap-2 text-text-ink/60 hover:text-accent-blood font-handwriting text-lg">
                    <FaArrowLeft /> Volver al login
                </Button>
            </div>
            
             {/* Paper Card */}
            <div 
                className="bg-[#fdfbf7] text-text-ink p-8 md:p-10 shadow-2xl relative transform -rotate-1 transition-transform hover:rotate-0 duration-500 ease-out"
                style={{
                    clipPath: 'polygon(3% 0%, 97% 2%, 100% 98%, 0% 100%)',
                    boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                 {/* Tape Sticking it */}
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#e0d8b0] opacity-80 rotate-1 shadow-sm transform z-20"></div>

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-display font-bold text-text-ink tracking-wide uppercase" style={{ fontFamily: 'Upheaval, sans-serif' }}>Recuperar</h1>
                    <p className="text-text-ink/60 mt-2 font-handwriting text-lg">
                        Ingresa tu email para recibir instrucciones
                    </p>
                </div>

                <div className="space-y-6">
                     {error && (
                        <div className="mb-4 p-3 bg-accent-blood/10 border-2 border-accent-blood/50 rounded text-accent-blood text-sm flex flex-col items-center animate-in slide-in-from-top-2 font-handwriting">
                            {error}
                        </div>
                     )}
                     {message && (
                        <div className="mb-4 p-3 bg-green-900/10 border-2 border-green-700/50 rounded text-green-900 text-sm flex flex-col items-center animate-in slide-in-from-top-2 font-handwriting">
                            {message}
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

                        <Button 
                            className="w-full bg-text-ink hover:bg-black text-[#fdfbf7] font-bold py-6 mt-4 uppercase tracking-widest text-lg shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-black" 
                            type="submit" 
                            style={{ fontFamily: 'Upheaval, sans-serif' }}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </Button>
                    </form>

                     <div className="mt-8 text-center pt-4 border-t-2 border-dashed border-text-ink/10">
                        <p className="text-text-ink/60 font-handwriting text-lg">
                            ¿Te acordaste? <Link to="/login" className="text-accent-blood font-bold hover:underline decoration-2 underline-offset-2">Entra aquí</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ForgotPassword;
