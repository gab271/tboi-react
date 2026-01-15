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
    <div className="min-h-screen flex items-center justify-center bg-bg-0 p-4 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-bg-1 via-bg-0 to-black z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate('/login')} className="pl-0 gap-2 text-muted hover:text-fg">
                    <FaArrowLeft /> Back to Login
                </Button>
            </div>
            
            <Card className="border-gold/20 bg-bg-1/80 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-serif font-bold text-gold drop-shadow-sm">
                        Reset Password
                    </CardTitle>
                    <p className="text-muted text-sm mt-2">
                        Enter your email to receive recovery instructions
                    </p>
                </CardHeader>
                <CardContent>
                     {error && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-200 text-sm flex flex-col items-center animate-in slide-in-from-top-2">
                            {error}
                        </div>
                     )}
                     {message && (
                        <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded text-green-200 text-sm flex flex-col items-center animate-in slide-in-from-top-2">
                            {message}
                        </div>
                     )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Email Address</label>
                            <Input
                                type="email"
                                placeholder="isaac@basement.com"
                                icon={FaEnvelope}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-bg-0 border-white/10"
                                required
                            />
                        </div>

                        <Button 
                            className="w-full bg-gold hover:bg-gold/80 text-black font-bold py-6 mt-4 shadow-lg shadow-gold/10" 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? 'Sending Instructions...' : 'Send Reset Link'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8 text-center">
                 <p className="text-muted text-xs">
                    Remember your password? <Link to="/login" className="text-gold hover:underline">Log in here</Link>
                </p>
            </div>
        </div>
    </div>
  );
};

export default ForgotPassword;
