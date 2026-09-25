import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { Role } from '../../types/hris';
import {
  Users,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const {
    employees,
    departments,
    toggleEmployeeActive,
    resetEmployeePassword,
    updateEmployeeRole,
    loginLogs,
  } = useHRIS();

  const [activeTab, setActiveTab] = useState<'accounts' | 'logs'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Reset Password Modal
  const [resetModalEmp, setResetModalEmp] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('password123');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    if (roleFilter !== 'ALL' && emp.role !== roleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(term);
      const matchNip = emp.nip.toLowerCase().includes(term);
      const matchUser = emp.username?.toLowerCase().includes(term);
      if (!matchName && !matchNip && !matchUser) return false;
    }
    return true;
  });

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalEmp) return;

    resetEmployeePassword(resetModalEmp.id, newPassword);
    setFeedback(`Kata sandi untuk ${resetModalEmp.name} berhasil diubah ke: "${newPassword}"`);
    setTimeout(() => {
      setFeedback(null);
      setResetModalEmp(null);
      setNewPassword('password123');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pengguna & Hak Akses (User Management)
          </h1>
          <p className="text-sm text-slate-500">
            Kelola akun login, reset kata sandi, aktif/nonaktif akun, dan audit riwayat login karyawan.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'accounts'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Akun Login ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'logs'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Login ({loginLogs.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: AKUN LOGIN KARYAWAN                                     */}
      {/* ============================================================== */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari akun berdasarkan nama / NIP / username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 font-medium"
              >
                <option value="ALL">Semua Peran Hak Akses</option>
                <option value="hrd">HRD / Admin</option>
                <option value="manager">Atasan / Manager</option>
                <option value="employee">Karyawan</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Karyawan</th>
                    <th className="px-4 py-3">Username Login</th>
                    <th className="px-4 py-3">Hak Akses (Role)</th>
                    <th className="px-4 py-3">Status Akun</th>
                    <th className="px-4 py-3">Login Terakhir</th>
                    <th className="px-4 py-3 text-right">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => {
                    const dept = departments.find((d) => d.id === emp.departmentId);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {emp.nip} • {dept?.name || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-slate-800">
                          {emp.username || emp.nip.toLowerCase()}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={emp.role}
                            onChange={(e) => updateEmployeeRole(emp.id, e.target.value as Role)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-800 bg-white"
                          >
                            <option value="hrd">HRD / Admin (Akses Penuh)</option>
                            <option value="manager">Atasan (Approve Tim)</option>
                            <option value="employee">Karyawan (Mandiri)</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleEmployeeActive(emp.id)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              emp.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                            title="Klik untuk ubah status aktif/nonaktif"
                          >
                            {emp.isActive ? (
                              <>
                                <Unlock className="h-3 w-3" /> Aktif
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3" /> Dinonaktifkan
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {emp.lastLogin || <span className="text-slate-400 italic">Belum pernah login</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setResetModalEmp({ id: emp.id, name: emp.name })}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition"
                          >
                            <KeyRound className="h-3 w-3" />
                            Reset Sandi
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: AUDIT LOG RIWAYAT LOGIN                                 */}
      {/* ============================================================== */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-2">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Aktivitas Login Sistem</h3>
            <p className="text-xs text-slate-500">
              Audit trail aktivitas login seluruh karyawan untuk keperluan kepatuhan & keamanan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Waktu Login</th>
                  <th className="px-4 py-3">Karyawan</th>
                  <th className="px-4 py-3">NIP</th>
                  <th className="px-4 py-3">Peran Akses</th>
                  <th className="px-4 py-3">Perangkat / IP</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loginLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-slate-700">{log.timestamp}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{log.employeeName}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{log.nip}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {log.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.device || 'Browser'} {log.ipAddress ? `(${log.ipAddress})` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          log.status === 'Berhasil'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status === 'Berhasil' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Reset Kata Sandi Akun</h3>
              <p className="text-xs text-slate-500">{resetModalEmp.name}</p>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kata Sandi Baru untuk Karyawan:
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalEmp(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Simpan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
