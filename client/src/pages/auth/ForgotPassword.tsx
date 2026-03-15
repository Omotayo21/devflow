import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Reset link sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505]">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-8 shadow-2xl transition-all duration-300">
        <Link 
          to="/login" 
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 mb-8 group transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Reset password</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {isSubmitted 
              ? "If that email exists, a reset link has been sent"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
              className="bg-zinc-900/50"
            />

            <Button type="submit" className="w-full py-6 mt-2" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <Button variant="outline" className="w-full py-6 mt-2" onClick={() => setIsSubmitted(false)}>
              Retry with another email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
