import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { Employee, EmploymentStatus, Gender, Role } from '../../types/hris';
import { X, Sparkles, UserPlus, Save } from 'lucide-react';

interface EmployeeFormModalProps {
  initialData?: Employee | null;
  onClose: () => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  initialData,
  onClose,
}) => {
  const {
    departments,
    positions,
    locations,
    employees,
    addEmployee,
    updateEmployee,
  } = useHRIS();

  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: initialData?.name || '',
    nip: initialData?.nip || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    nik: initialData?.nik || '',
    npwp: initialData?.npwp || '',
    birthDate: initialData?.birthDate || '1995-05-15',
    birthPlace: initialData?.birthPlace || 'Jakarta',
    gender: initialData?.gender || 'L',
    religion: initialData?.religion || 'Islam',
    maritalStatus: initialData?.maritalStatus || 'Belum Kawin',
    ptkpStatus: initialData?.ptkpStatus || 'TK/0',
    address: initialData?.address || '',
    bankName: initialData?.bankName || 'BCA',
    bankAccountNumber: initialData?.bankAccountNumber || '',
    bankAccountHolder: initialData?.bankAccountHolder || '',
    bpjsKesNumber: initialData?.bpjsKesNumber || '',
    bpjsTkNumber: initialData?.bpjsTkNumber || '',
    departmentId: initialData?.departmentId || departments[0]?.id || '',
    positionId: initialData?.positionId || positions[0]?.id || '',
    managerNip: initialData?.managerNip || '',
    employmentStatus: initialData?.employmentStatus || 'PKWT',
    joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
    role: initialData?.role || 'employee',
    baseSalary: initialData?.baseSalary || 6500000,
    customJobAllowance: initialData?.customJobAllowance,
    customDailyTransport: initialData?.customDailyTransport,
    customDailyMeal: initialData?.customDailyMeal,
    primaryLocationId: initialData?.primaryLocationId || locations[0]?.id,
    allowedLocationIds: initialData?.allowedLocationIds || (locations[0] ? [locations[0].id] : []),
    annualLeaveBalance: initialData?.annualLeaveBalance ?? 12,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (isEditing && initialData) {
      updateEmployee(initialData.id, formData);
    } else {
      addEmployee(formData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {!isEditing && 'NIP, akun login, kontrak kerja, dan saldo cuti dibuat otomatis.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[550px] overflow-y-auto">
          {/* Section 1: Identitas Pribadi */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm pb-1 border-b border-slate-100">
              1. Identitas Diri & Kontak
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Anggara, S.Kom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  NIP {!isEditing && '(Kosongkan untuk otomatis NSA-YYYY-NNN)'}
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NIK (KTP)</label>
                <input
                  type="text"
                  placeholder="3171xxxxxxxxxxxx"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Perusahaan</label>
                <input
                  type="email"
                  placeholder="karyawan@pt-nsa.co.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Handphone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NPWP (Pajak)</label>
                <input
                  type="text"
                  placeholder="Kosongkan jika belum memiliki NPWP"
                  value={formData.npwp}
                  onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status PTKP</label>
                <select
                  value={formData.ptkpStatus}
                  onChange={(e) => setFormData({ ...formData, ptkpStatus: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  <option value="TK/0">TK/0 (Lajang)</option>
                  <option value="TK/1">TK/1</option>
                  <option value="TK/2">TK/2</option>
                  <option value="TK/3">TK/3</option>
                  <option value="K/0">K/0 (Menikah, 0 Tanggungan)</option>
                  <option value="K/1">K/1 (Menikah, 1 Tanggungan)</option>
                  <option value="K/2">K/2 (Menikah, 2 Tanggungan)</option>
                  <option value="K/3">K/3 (Menikah, 3 Tanggungan)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Kepegawaian & Penempatan */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm pb-1 border-b border-slate-100">
              2. Penempatan & Struktur Organisasi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Departemen</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jabatan & Grade</label>
                <select
                  value={formData.positionId}
                  onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Level {p.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status Kepegawaian</label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, employmentStatus: e.target.value as EmploymentStatus })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  <option value="PKWT">PKWT (Kontrak)</option>
                  <option value="PKWTT">PKWTT (Tetap)</option>
                  <option value="Probation">Probation (Masa Percobaan)</option>
                  <option value="Magang">Magang (Internship)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Atasan Langsung (NIP)</label>
                <select
                  value={formData.managerNip || ''}
                  onChange={(e) => setFormData({ ...formData, managerNip: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  <option value="">-- Tanpa Atasan (Direksi) --</option>
                  {employees
                    .filter((e) => e.role === 'manager' || e.role === 'hrd')
                    .map((m) => (
                      <option key={m.id} value={m.nip}>
                        {m.name} ({m.nip})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hak Akses Peran</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                >
                  <option value="employee">Karyawan (Portal Self-Service)</option>
                  <option value="manager">Atasan / Manager (Bisa Approve Cuti Tim)</option>
                  <option value="hrd">HRD / Admin (Akses Penuh Seluruh Modul)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lokasi Presensi Utama (GPS)</label>
                <select
                  value={formData.primaryLocationId || ''}
                  onChange={(e) => setFormData({ ...formData, primaryLocationId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  <option value="">Bebas Absen dari Mana Saja</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Gaji & Kompensasi */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm pb-1 border-b border-slate-100">
              3. Kompensasi & Tunjangan (Prioritas Khusus Karyawan)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gaji Pokok (Rp) *</label>
                <input
                  type="number"
                  step="100000"
                  required
                  value={formData.baseSalary}
                  onChange={(e) =>
                    setFormData({ ...formData, baseSalary: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tunjangan Jabatan Khusus (Rp)
                </label>
                <input
                  type="number"
                  step="50000"
                  placeholder="Kosongkan untuk ikuti tarif jabatan"
                  value={formData.customJobAllowance ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customJobAllowance: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tarif Transport Khusus per Hari (Rp)
                </label>
                <input
                  type="number"
                  step="5000"
                  placeholder="Kosongkan untuk ikuti tarif jabatan"
                  value={formData.customDailyTransport ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customDailyTransport: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tarif Makan Khusus per Hari (Rp)
                </label>
                <input
                  type="number"
                  step="5000"
                  placeholder="Kosongkan untuk ikuti tarif jabatan"
                  value={formData.customDailyMeal ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customDailyMeal: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-indigo-500 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              {isEditing ? 'Simpan Perubahan' : 'Buat Karyawan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
