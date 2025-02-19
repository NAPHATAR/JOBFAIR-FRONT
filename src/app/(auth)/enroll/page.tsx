"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Moon, Sun, ArrowRight, Home } from "lucide-react"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import Footer from '@/components/footer/footer';

const enrollSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  tel: z.string().regex(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EnrollFormData = z.infer<typeof enrollSchema>;

export default function EnrollPage() {
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<EnrollFormData>({
    resolver: zodResolver(enrollSchema)
  });

  const password = watch("password");
  const showConfirmPassword = Boolean(password && password.length > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const gradientStyle = useMemo(() => {
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 30) % 360;
    const hue3 = (hue1 + 60) % 360;
    return {
      light: `linear-gradient(to bottom right, hsl(${hue1}, 60%, 94%), hsl(${hue2}, 55%, 96%), hsl(${hue3}, 50%, 95%))`,
      dark: `linear-gradient(to bottom right, hsl(${hue1}, 50%, 30%), hsl(${hue2}, 45%, 35%), hsl(${hue3}, 40%, 40%))`,
    };
  }, []);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const onSubmit = async (data: EnrollFormData) => {
    setError('');
    try {
      const submitData = { 
        ...data,
        role: 'admin',
        createdAt: new Date().toISOString().split("T")[0] 
      };

      const response = await api.post('/auth/register', submitData);
      const userData = response.data;

      localStorage.setItem('token', userData.token);
      router.push('/');
    } catch (error) {
      console.error('Enrollment failed:', error);
      setError('Enrollment failed. Please try again.');
    }
  };

  if (!mounted) return null;

  const backgroundStyle = theme 
    ? { backgroundImage: theme === 'dark' ? gradientStyle.dark : gradientStyle.light }
    : { backgroundColor: 'white' };

  return (
    <div 
      className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300"
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 py-16 flex flex-col justify-between min-h-screen">
        <header className="text-center mb-16 relative">
          <div className="relative flex justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
              className="z-10"
            >
              <Home className='h-[1.2rem] w-[1.2rem]'/>
              <span className='sr-only'>Home</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="z-10"
            >
              {theme === "light" ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-4"
          >
            Jobfair Admin
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 dark:text-gray-200"
          >
            Join as Admin Maintenance Team
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-md mx-auto w-full"
        >
          <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {['name', 'email', 'tel', 'password'].map((field) => (
                  <div key={field}>
                    <Input
                      type={field === 'password' ? 'password' : 'text'}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      {...register(field as keyof EnrollFormData)}
                      className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                    />
                    {errors[field as keyof EnrollFormData] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field as keyof EnrollFormData]?.message}</p>
                    )}
                  </div>
                ))}
                <AnimatePresence>
                  {showConfirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...register('confirmPassword')}
                        className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full bg-zinc-600 hover:bg-zinc-700 text-white dark:bg-zinc-200 dark:hover:bg-zinc-400 dark:text-zinc-800 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enrolling...' : 'Join as Admin'}
                  <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </form>
              <p className="text-center mt-4 text-gray-600 dark:text-gray-200">
                Already enrolled?{' '}
                <Link href="/login" className="text-zinc-600 dark:text-zinc-200 hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <Footer />
      </div>
    </div>
  );
}