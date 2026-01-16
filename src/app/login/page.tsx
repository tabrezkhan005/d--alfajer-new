"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/src/lib/auth-context";
import { useI18n } from "@/src/components/providers/i18n-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, isLoading } = useAuth();
  const { t } = useI18n();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.push("/account");
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup(formData.name, formData.email, formData.password);
      router.push("/account");
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#009744] transition-colors">
              {t("common.home")}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {isSignup ? "Sign Up" : "Login"}
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {isSignup ? t('auth.createAccount') : t('auth.welcomeBack')}
            </h1>
            <p className="text-sm text-gray-600">
              {isSignup
                ? t('auth.joinUs')
                : t('auth.signInToAccount')}
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg"
          >
            {error && (
              <motion.div
                variants={itemVariants}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form
              onSubmit={isSignup ? handleSignup : handleLogin}
              className="space-y-4"
            >
              {/* Name Field - Signup Only */}
              {isSignup && (
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    {t('common.name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition text-gray-900"
                      placeholder={t('auth.namePlaceholder')}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {t('common.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition text-gray-900"
                    placeholder={t('auth.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition text-gray-900"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password Field - Signup Only */}
              {isSignup && (
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009744] focus:border-transparent outline-none transition text-gray-900"
                      placeholder={t('auth.passwordPlaceholder')}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </motion.div>
              )}

              {/* Remember Me / Forgot Password - Login Only */}
              {!isSignup && (
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#009744]"
                    />
                    <span className="text-sm text-gray-700">{t('auth.rememberMe')}</span>
                  </label>
                  <Link
                    href="#"
                    className="text-sm text-[#009744] hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#009744] hover:bg-[#007A37] text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? t('common.loading') : isSignup ? t('auth.createAccount') : t('auth.signIn')}
                </Button>
              </motion.div>
            </form>

            {/* Toggle Between Login and Signup */}
            <motion.div
              variants={itemVariants}
              className="mt-4 text-center text-xs text-gray-600"
            >
              {isSignup ? (
                <>
                  {t('auth.alreadyHaveAccount')}{" "}
                  <button
                    onClick={() => {
                      setIsSignup(false);
                      setError("");
                      setFormData({
                        name: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                      });
                    }}
                    className="text-[#009744] hover:underline font-medium"
                  >
                    {t('auth.signIn')}
                  </button>
                </>
              ) : (
                <>
                  {t('auth.dontHaveAccount')}{" "}
                  <button
                    onClick={() => {
                      setIsSignup(true);
                      setError("");
                      setFormData({
                        name: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                      });
                    }}
                    className="text-[#009744] hover:underline font-medium"
                  >
                    {t('auth.signUp')}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Continue as Guest */}
          <motion.div variants={itemVariants} className="mt-4 text-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 text-xs font-medium transition"
            >
              {t('auth.continueGuest')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
