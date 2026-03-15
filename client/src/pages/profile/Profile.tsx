import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User as UserIcon, Lock, ShieldCheck, Mail, Camera } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional(), // email is usually read-only
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    }
  });

  const onUpdateProfile = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      // Mocking update for now as backend might need specific endpoint
      // await userApi.updateProfile(data);
      updateUser({ ...user!, name: data.name });
      toast.success('Profile updated successfully');
    } catch (error) {
       toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white selection:bg-violet-500/30">Profile Settings</h2>
        <p className="text-zinc-500 text-sm mt-2">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-3xl flex flex-col items-center text-center shadow-xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             
             <div className="relative mb-6">
                <Avatar name={user?.name} size="xl" className="ring-4 ring-zinc-900 shadow-2xl" />
                <button className="absolute bottom-0 right-0 p-2 bg-violet-600 rounded-full text-white border-4 border-zinc-950 hover:bg-violet-500 transition-all shadow-lg">
                  <Camera size={16} />
                </button>
             </div>

             <h3 className="font-bold text-xl text-white mb-1">{user?.name}</h3>
             <p className="text-sm text-zinc-500 mb-6">{user?.email}</p>
             
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
               <ShieldCheck size={14} /> Verified Member
             </div>

             <div className="w-full pt-8 mt-8 border-t border-zinc-900 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Role</p>
                  <p className="text-sm font-semibold text-zinc-300">Engineer</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Joined</p>
                  <p className="text-sm font-semibold text-zinc-300">Mar 2024</p>
                </div>
             </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* General Info */}
          <section className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-300 flex items-center gap-2.5 uppercase tracking-widest">
                <UserIcon size={18} className="text-violet-500" /> Personal Information
              </h4>
            </div>
            <form onSubmit={handleSubmit(onUpdateProfile)} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Full Name"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="Your Name"
                />
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-zinc-500 transition-colors" size={18} />
                    <input 
                      readOnly
                      disabled
                      value={user?.email}
                      className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-zinc-500 cursor-not-allowed font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-700 font-medium ml-1">Email cannot be changed after registration.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={isUpdating} className="px-10 h-11">
                  Save Changes
                </Button>
              </div>
            </form>
          </section>

          {/* Password Section */}
          <section className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-sm">
             <div className="px-8 py-5 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-300 flex items-center gap-2.5 uppercase tracking-widest">
                <Lock size={18} className="text-violet-500" /> Security & Password
              </h4>
            </div>
            <div className="p-8">
               <p className="text-sm text-zinc-500 mb-8 leading-relaxed max-w-lg">
                 Updating your password will improve your account security. You will remain logged in on this device.
               </p>
               <Button variant="outline" className="border-zinc-800 hover:bg-zinc-900 h-11 px-8">
                 Change Password
               </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
