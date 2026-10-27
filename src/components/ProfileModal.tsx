import React, { useState, useEffect } from 'react';
import { X, User, MapPin, GraduationCap, Check, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GenderOption, GradeLevel, StrandOption } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, currentUser, saveProfile, createGuestProfile } = useAuth();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<GenderOption>('Male');
  const [address, setAddress] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Grade 7');
  const [strand, setStrand] = useState<StrandOption>('N/A');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setGender(profile.gender || 'Male');
      setAddress(profile.address || '');
      setGrade(profile.grade || 'Grade 7');
      setStrand(profile.strand || 'N/A');
    } else if (currentUser?.displayName) {
      setName(currentUser.displayName);
    }
  }, [profile, currentUser]);

  if (!isOpen) return null;

  const handleGradeChange = (newGrade: GradeLevel) => {
    setGrade(newGrade);
    if (['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].includes(newGrade)) {
      setStrand('N/A');
    } else if (strand === 'N/A') {
      setStrand('STEM');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Address is required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      if (profile) {
        await saveProfile({
          name: name.trim(),
          gender,
          address: address.trim(),
          grade,
          strand,
        });
      } else {
        await createGuestProfile({
          name: name.trim(),
          email: currentUser?.email || 'student@dailyplanner.local',
          gender,
          address: address.trim(),
          grade,
          strand,
        });
      }

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {profile ? 'Edit Student Profile' : 'Complete Profile Setup'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your student academic information and location details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-4">
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
                placeholder="Student full name"
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
                Grade Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => handleGradeChange(e.target.value as GradeLevel)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="Grade 7">Grade 7 (Junior High)</option>
                <option value="Grade 8">Grade 8 (Junior High)</option>
                <option value="Grade 9">Grade 9 (Junior High)</option>
                <option value="Grade 10">Grade 10 (Junior High)</option>
                <option value="Grade 11">Grade 11 (Senior High)</option>
                <option value="Grade 12">Grade 12 (Senior High)</option>
              </select>
            </div>
          </div>

          {/* Strand */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Strand (with N/A option) <span className="text-rose-500">*</span>
            </label>
            <select
              value={strand}
              onChange={(e) => setStrand(e.target.value as StrandOption)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              <option value="N/A">N/A (Junior High or Not Applicable)</option>
              <option value="STEM">STEM - Science, Technology, Engineering & Mathematics</option>
              <option value="ABM">ABM - Accountancy, Business & Management</option>
              <option value="HUMSS">HUMSS - Humanities and Social Sciences</option>
              <option value="GAS">GAS - General Academic Strand</option>
              <option value="TVL-ICT">TVL-ICT - Information & Communications Technology</option>
              <option value="TVL-HE">TVL-HE - Home Economics</option>
              <option value="TVL-IA">TVL-IA - Industrial Arts</option>
              <option value="Arts and Design">Arts and Design Track</option>
              <option value="Sports">Sports Track</option>
              <option value="General Academic">General Academic</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              For Junior High (Grades 7-10), select "N/A". For Senior High (Grades 11-12), select your specialization track.
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, Barangay, City / Municipality, Province"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {saving ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
