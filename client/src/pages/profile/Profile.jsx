import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Lock, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional(), // email is usually read-only
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    }
  });

  const onUpdateProfile = async (data) => {
    setIsUpdating(true);
    try {
      // Mocking update for now as backend might need specific endpoint
      // await userApi.updateProfile(data);
      updateUser({ name: data.name });
      toast.success('Profile updated successfully');
    } catch (error) {
       toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted text-sm">Manage your account information and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
           <div className="glass-card p-8 flex flex-col items-center text-center">
             <div className="w-24 h-24 rounded-full bg-brand flex items-center justify-center text-4xl font-bold text-white mb-4 ring-4 ring-background-tertiary">
               {user?.name?.[0] || 'U'}
             </div>
             <h3 className="font-bold text-lg">{user?.name}</h3>
             <p className="text-sm text-muted">{user?.email}</p>
             <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase border border-emerald-400/20">
               <ShieldCheck size={12} /> Verified Account
             </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* General Info */}
          <section className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-background-secondary/50">
              <h4 className="font-semibold flex items-center gap-2">
                <User size={18} className="text-brand" /> Personal Information
              </h4>
            </div>
            <form onSubmit={handleSubmit(onUpdateProfile)} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Full Name</label>
                <input 
                  {...register('name')}
                  className={cn("form-input", errors.name && "border-red-500")}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted opacity-50">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/30" size={18} />
                  <input 
                    readonly
                    disabled
                    value={user?.email}
                    className="form-input pl-10 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <button disabled={isUpdating} className="btn-primary">
                {isUpdating ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* Password Section */}
          <section className="glass-card overflow-hidden">
             <div className="px-6 py-4 border-b border-border bg-background-secondary/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Lock size={18} className="text-brand" /> Security & Password
              </h4>
            </div>
            <div className="p-6">
               <p className="text-sm text-muted mb-6">Updating your password will log you out from other devices.</p>
               <div className="space-y-4">
                  <button className="btn-secondary w-full md:w-auto">Change Password</button>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
