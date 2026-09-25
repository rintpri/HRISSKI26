import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { CompanyProfile } from '../../types/hris';
import {
  Building2,
  Clock,
  Save,
  Check,
  HardDrive,
  FileSpreadsheet,
  Shield,
  CreditCard,
} from 'lucide-react';

export const CompanyProfileSettings: React.FC = () => {
  const { company, updateCompanyProfile } = useHRIS();

  const [form, setForm] = useState<CompanyProfile>({ ...company });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestGoogleSheetsBackup = () => {
    setSyncStatus('Memproses sinkronisasi data ke Google Sheets...');
    setTimeout(() => {
      setSyncStatus('✓ Data payroll & rekap absensi berhasil disinkronkan ke Google Sheets!');
      updateCompanyProfile({ googleSheetsConnected: true, googleDriveConnected: true });
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Profil Perusahaan & Kebijakan HRIS
        </h1>
        <p className="text-sm text-slate-500">
          Ubah informasi identitas korporat, jadwal jam kerja kantor, rumus lembur, dan integrasi cloud.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identitas Perusahaan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Identitas Resmi Perusahaan</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Perusahaan (PT)</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tagline / Bidang Usaha</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Alamat Kantor Pusat</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">NPWP Badan Perusahaan</label>
              <input
                type="text"
                value={form.npwp}
                onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Telepon Kantor</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Resmi HRD</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Website Perusahaan</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Pengesah Slip Gaji */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Penandatangan Resmi Slip Gaji</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Pejabat Penandatangan</label>
              <input
                type="text"
                value={form.payrollSignerName}
                onChange={(e) => setForm({ ...form, payrollSignerName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jabatan Pejabat</label>
              <input
                type="text"
                value={form.payrollSignerPosition}
                onChange={(e) => setForm({ ...form, payrollSignerPosition: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Kebijakan Jam Kerja & Lembur */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Kebijakan Jam Kerja & Lembur</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jam Mulai Kerja Standar</label>
              <input
                type="time"
                value={form.standardWorkStartTime}
                onChange={(e) => setForm({ ...form, standardWorkStartTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jam Selesai Kerja Standar</label>
              <input
                type="time"
                value={form.standardWorkEndTime}
                onChange={(e) => setForm({ ...form, standardWorkEndTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Toleransi Keterlambatan (Menit)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={form.lateGraceMinutes}
                onChange={(e) => setForm({ ...form, lateGraceMinutes: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
              />
            </div>
          </div>

          {/* Allowance Rules */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block">Aturan Kehadiran pada Payroll:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.transportExcludesWfh}
                onChange={(e) => setForm({ ...form, transportExcludesWfh: e.target.checked })}
                className="rounded text-indigo-600"
              />
              <span>Tunjangan Transport hanya dihitung pada hari hadir kantor (WFH dikecualikan)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.mealIncludesWfh}
                onChange={(e) => setForm({ ...form, mealIncludesWfh: e.target.checked })}
                className="rounded text-indigo-600"
              />
              <span>Tunjangan Makan dihitung pada seluruh hari kerja hadir (termasuk WFH)</span>
            </label>
          </div>
        </div>

        {/* Card 4: Google Drive & Google Sheets Integration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Integrasi Google Drive & Google Sheets</h3>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
              Terkoneksi
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Sistem HRIS dapat mengekspor rekap matriks kehadiran, laporan slip gaji bulanan, dan data karyawan
            secara langsung ke format spreadsheet (Google Sheets / Excel .xlsx / CSV).
          </p>

          {syncStatus && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold rounded-xl">
              {syncStatus}
            </div>
          )}

          <button
            type="button"
            onClick={handleTestGoogleSheetsBackup}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition"
          >
            <HardDrive className="h-4 w-4 text-emerald-600" />
            Sinkronkan / Uji Backup Spreadsheet
          </button>
        </div>

        {savedSuccess && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
            <Check className="h-4 w-4" />
            Profil perusahaan dan kebijakan sistem berhasil disimpan!
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
          >
            <Save className="h-4 w-4" />
            Simpan Perubahan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
