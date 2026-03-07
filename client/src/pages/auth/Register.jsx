import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { cn } from '../../utils/cn';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const passStrength = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password),
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await axios.post('/auth/register', data);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white text-2xl font-bold mb-4">D</div>
          <h2 className="text-2xl font-bold tracking-tight">Join DevFlow</h2>
          <p className="text-muted text-sm mt-1">Start managing your projects like a pro</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                {...register('name')}
                type="text" 
                placeholder="John Doe" 
                className={cn("form-input pl-10", errors.name && "border-red-500")}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                {...register('email')}
                type="email" 
                placeholder="name@company.com" 
                className={cn("form-input pl-10", errors.email && "border-red-500")}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                {...register('password')}
                type="password" 
                placeholder="••••••••" 
                className={cn("form-input pl-10", errors.password && "border-red-500")}
              />
            </div>
            
            {/* Password strength indicator */}
            <div className="mt-2 space-y-1.5 px-1">
              <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Password Requirements</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <Requirement item="At least 8 characters" met={passStrength.length} />
                <Requirement item="Includes a number" met={passStrength.hasNumber} />
                <Requirement item="Special character (!@#$)" met={passStrength.hasSpecial} />
              </div>
            </div>
            
            {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full h-11 relative overflow-hidden group mt-4"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span className="relative z-10 flex items-center justify-center gap-2">
                Create Account
              </span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:text-brand-light font-medium transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function Requirement({ item, met }) {
  return (
    <div className={cn("flex items-center gap-1.5 transition-colors", met ? "text-emerald-400" : "text-muted")}>
      <CheckCircle2 size={12} />
      <span className="text-[11px]">{item}</span>
    </div>
  );
}
