import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { User, KeyRound, Check, CreditCard, Phone, MapPin } from 'lucide-react';

export const SelfServiceProfile: React.FC = () => {
  const { currentEmployee, updateEmployee, locations, departments, positions } = useHRIS();

  const [phone, setPhone] = useState(currentEmployee.phone || '');
  const [address, setAddress] = useState(currentEmployee.address || '');
  const [bankName, setBankName] = useState(currentEmployee.bankName || 'BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState(currentEmployee.bankAccountNumber || '');
  const [bankAccountHolder, setBankAccountHolder] = useState(currentEmployee.bankAccountHolder || currentEmployee.name);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const dept = departments.find((d) => d.id === currentEmployee.departmentId);
  const pos = positions.find((p) => p.id === currentEmployee.positionId);
  const primaryLoc = locations.find((l) => l.id === currentEmployee.primaryLocationId);

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(currentEmployee.id, {
      phone,
      address,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
    });
    setSaveMessage('Data kontak dan rekening bank Anda berhasil diperbarui!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    updateEmployee(currentEmployee.id, { password: newPassword });
    setNewPassword('');
    setConfirmPassword('');
    setSaveMessage('Kata sandi login Anda berhasil diubah!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Portal Layanan Mandiri Karyawan (Self-Service)
        </h1>
        <p className="text-sm text-slate-500">
          Kelola data kontak pribadi, rekening penggajian, dan keamanan kata sandi akun Anda.
        </p>
      </div>

      {saveMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <Check className="h-4 w-4" />
          {saveMessage}
        </div>
      )}

      {/* Profile Header Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-md shadow-indigo-200">
            {currentEmployee.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentEmployee.name}</h2>
              <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-bold border border-indigo-100">
                {currentEmployee.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              NIP: <strong>{currentEmployee.nip}</strong> • {pos?.title} • {dept?.name}
            </p>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>Lokasi Utama: {primaryLoc?.name || 'Bebas dari mana saja'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sisa Cuti Tahunan</span>
          <span className="text-xl font-bold text-indigo-700">{currentEmployee.annualLeaveBalance} Hari</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form 1: Update Kontak & Rekening Bank */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Pembaruan Kontak & Rekening Bank</h3>
          </div>

          <form onSubmit={handleUpdateContact} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Handphone / WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Alamat Domisili</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Bank</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Atas Nama Rekening</label>
              <input
                type="text"
                required
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
              >
                Simpan Perubahan Kontak & Rekening
              </button>
            </div>
          </form>
        </div>

        {/* Form 2: Ganti Password Login */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Ganti Kata Sandi Akun</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                required
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-500">
              Kata sandi digunakan untuk login mandiri absensi dan mengunduh slip gaji bulanan Anda.
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
              >
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
