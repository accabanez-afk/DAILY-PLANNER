import React, { useState } from 'react';
import { X, Mail, Lock, User, MapPin, GraduationCap, School, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GenderOption, GradeLevel, StrandOption } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
}) => {
  const { signUpWithEmail, signInWithEmail, signInWithGoogle, createGuestProfile } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<GenderOption>('Male');
  const [address, setAddress] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Grade 7');
  const [strand, setStrand] = useState<StrandOption>('N/A');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGradeChange = (newGrade: GradeLevel) => {
    setGrade(newGrade);
    // If Grade 7 to 10 (Junior High), default strand to N/A
    if (['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].includes(newGrade)) {
      setStrand('N/A');
    } else if (strand === 'N/A') {
      setStrand('STEM');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!address.trim()) throw new Error('Please enter your home address.');
        if (!email.trim() || !password) throw new Error('Please provide email and password.');

        await signUpWithEmail({
          name: name.trim(),
          email: email.trim(),
          password,
          gender,
          address: address.trim(),
          grade,
          strand,
        });
        onClose();
      } else {
        if (!email.trim() || !password) throw new Error('Please enter your email and password.');
        await signInWithEmail(email.trim(), password);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was interrupted.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantStudentProfile = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your Name before creating your student profile.');
      return;
    }
    setLoading(true);
    try {
      await createGuestProfile({
        name: name.trim(),
        email: email.trim() || 'student@dailyplanner.local',
        gender,
        address: address.trim() || 'General Campus Address',
        grade,
        strand,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'signup' ? 'Create Student Profile' : 'Sign In to Daily Planner'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signup'
                ? 'Register your profile to organize tasks and alarms'
                : 'Welcome back! Access your schedule and completed tasks'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
              mode === 'signup'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up & Create Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
              mode === 'login'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {mode === 'signup' && (
                <button
                  type="button"
                  onClick={handleInstantStudentProfile}
                  className="mt-2 block font-semibold underline text-indigo-700 hover:text-indigo-900"
                >
                  Click here to save profile directly & start planning →
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' ? (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Gender & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as GenderOption)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Grade (7 - 12) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => handleGradeChange(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>

              {/* Strand */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Senior High Strand (or N/A) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={strand}
                  onChange={(e) => setStrand(e.target.value as StrandOption)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="N/A">N/A (Junior High / Not Applicable)</option>
                  <option value="STEM">STEM (Science, Tech, Engineering & Math)</option>
                  <option value="ABM">ABM (Accountancy, Business & Management)</option>
                  <option value="HUMSS">HUMSS (Humanities & Social Sciences)</option>
                  <option value="GAS">GAS (General Academic Strand)</option>
                  <option value="TVL-ICT">TVL-ICT (Information & Communications Tech)</option>
                  <option value="TVL-HE">TVL-HE (Home Economics)</option>
                  <option value="TVL-IA">TVL-IA (Industrial Arts)</option>
                  <option value="Arts and Design">Arts and Design</option>
                  <option value="Sports">Sports</option>
                  <option value="General Academic">General Academic</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Grades 7 to 10 select N/A. Grades 11-12 can choose their specialized Senior High track.
                </p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 124 Sampaguita St, Barangay San Jose, Quezon City"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Login mode */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : mode === 'signup' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Register Student Profile</span>
              </>
            ) : (
              <span>Sign In to Daily Planner</span>
            )}
          </button>

          {/* Google Sign In option */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 font-medium text-sm text-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2.5 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Account</span>
          </button>
        </form>
      </div>
    </div>
  );
};
