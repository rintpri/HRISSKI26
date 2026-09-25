import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import {
  Building2,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { company, login } = useHRIS();

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      const res = login(credential, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
          <Building2 className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          {company.name}
        </h2>
        <p className="text-xs text-indigo-300 font-medium">
          Portal Sistem Manajemen Karyawan, Presensi & Penggajian Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Masuk ke Akun Anda</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan NIP, Nama Pengguna (Username), atau Email resmi perusahaan Anda.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-800 font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                NIP / Username / Email
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan NIP, Username, atau Email..."
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Hak akses menu disesuaikan otomatis dengan peran akun Anda.</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          PT Nusantara Sinergi Abadi • HRIS Enterprise
        </p>
      </div>
    </div>
  );
};
