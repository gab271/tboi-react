import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { LoginLayout } from '../../components/LoginLayout/LoginLayout';
import { CharacterCarousel } from '../../components/LoginLayout/CharacterCarousel';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const lastSubmitTime = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Anti-spam / Debounce
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;

    if (isSubmitting) return;

    try {
      setError('');
      setIsSubmitting(true);
      
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      if (data?.user) {
         navigate('/');
      }
    } catch (error) {
      console.error(error);
      if (error.message && error.message.includes('Invalid login credentials')) {
         setError('Incorrect email or password.');
      } else {
         setError('Failed to log in. Please check connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout>
      {/* Header Section */}
      <div className="mb-6 text-center z-20 relative">
        <CharacterCarousel />
        <h2 className="font-heading text-4xl text-text-heading mb-1 mt-6 tracking-widest drop-shadow-md">BASEMENT AWAITS</h2>
        <p className="text-text-dim/80 font-handwriting text-lg animate-pulse-slow">Resume your run...</p>
      </div>

      {error && (
        <div className="bg-red-900/10 border-l-4 border-red-800 text-red-900 p-4 mb-6 font-handwriting text-base" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
            <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#f0e6d2] border-2 border-black/20 focus:border-black font-handwriting text-xl h-12 pl-10 placeholder:text-black/30 transition-all"
                  icon={null} // customizing icon manually
                />
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" />
            </div>

            <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#f0e6d2] border-2 border-black/20 focus:border-black font-handwriting text-xl h-12 pl-10 placeholder:text-black/30 transition-all"
                  icon={null}
                />
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" />
            </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full font-pixel text-xl py-6 mt-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-black text-white hover:text-red-500"
          variant="primary"
        >
          {isSubmitting ? 'DESCENDING...' : 'DESCEND'}
        </Button>
      </form>
      
      <div className="mt-10 text-center space-y-3">
        <div className="text-md text-black/60 font-handwriting">
          No seed?{' '}
          <Link to="/register" className="font-bold text-red-800 hover:text-red-600 hover:underline decoration-wavy decoration-2">
            START NEW RUN
          </Link>
        </div>
        <div className="text-xs">
          <Link to="/forgot-password" className="text-black/40 hover:text-black font-mono">
           [FORGOT PASSWORD]
          </Link>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
         <Link to="/" className="flex items-center gap-2 text-black/50 hover:text-black text-sm font-bold group transition-colors uppercase tracking-widest font-pixel">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
            Escape
         </Link>
      </div>

    </LoginLayout>
  );
};

export default Login;
