import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import {
  Building2,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { company, employees, login, loginAsDemo } = useHRIS();

  const [credential, setCredential] = useState('ratna');
  const [password, setPassword] = useState('password123');
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

  const handleQuickDemoLogin = (empId: string) => {
    loginAsDemo(empId);
  };

  // Group demo accounts by role
  const hrdAccounts = employees.filter((e) => e.role === 'hrd').slice(0, 2);
  const managerAccounts = employees.filter((e) => e.role === 'manager').slice(0, 2);
  const employeeAccounts = employees.filter((e) => e.role === 'employee').slice(0, 3);

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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Masuk ke Akun Anda</h3>
            <p className="text-xs text-slate-500">
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
                  placeholder="Contoh: ratna atau NSA-2023-002"
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
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Kata sandi default akun demo: <strong className="text-indigo-600">password123</strong></span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Pilih Akun Demo untuk Pengujian Cepat:</span>
            </div>

            {/* Role 1: Admin / HRD */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider">
                1. Administrator & HRD (Akses Penuh Semua Modul)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hrdAccounts.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(emp.id)}
                    className="text-left rounded-xl border border-indigo-100 bg-indigo-50/60 p-2.5 hover:bg-indigo-100/80 transition"
                  >
                    <div className="font-bold text-indigo-950 text-xs truncate">{emp.name}</div>
                    <div className="text-[10px] text-indigo-700 font-mono mt-0.5">
                      User: {emp.username} • {emp.nip}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role 2: Atasan / Manager */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">
                2. Atasan / Manager (Bisa Setujui Cuti & Pantau Tim)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {managerAccounts.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(emp.id)}
                    className="text-left rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5 hover:bg-emerald-100/80 transition"
                  >
                    <div className="font-bold text-emerald-950 text-xs truncate">{emp.name}</div>
                    <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                      User: {emp.username} • {emp.nip}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role 3: Karyawan / Employee */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold uppercase text-amber-700 tracking-wider">
                3. Karyawan / Staff (Portal Mandiri, Absen GPS, Cuti, Slip)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {employeeAccounts.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(emp.id)}
                    className="text-left rounded-xl border border-amber-100 bg-amber-50/60 p-2.5 hover:bg-amber-100/80 transition"
                  >
                    <div className="font-bold text-amber-950 text-xs truncate">{emp.name}</div>
                    <div className="text-[10px] text-amber-700 font-mono mt-0.5 truncate">
                      {emp.username}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Hak akses otomatis disesuaikan secara dinamis dengan peran akun yang sedang aktif.
        </p>
      </div>
    </div>
  );
};
