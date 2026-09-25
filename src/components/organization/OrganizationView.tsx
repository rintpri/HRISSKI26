import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { Department, JobPosition } from '../../types/hris';
import { formatRupiah } from '../../utils/payrollCalculator';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Check,
  Briefcase,
  Users,
} from 'lucide-react';

export const OrganizationView: React.FC = () => {
  const {
    departments,
    positions,
    employees,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addPosition,
    updatePosition,
    deletePosition,
    massUpdatePositionAllowancesByLevel,
  } = useHRIS();

  const [activeTab, setActiveTab] = useState<'departments' | 'positions'>('positions');

  // Mass Apply Modal State (e.g. all Level 5 positions updated at once)
  const [showMassModal, setShowMassModal] = useState(false);
  const [massLevel, setMassLevel] = useState(5);
  const [massTransport, setMassTransport] = useState(45000);
  const [massMeal, setMassMeal] = useState(40000);
  const [massSuccess, setMassSuccess] = useState(false);

  // Position Form Modal
  const [showPosModal, setShowPosModal] = useState(false);
  const [editingPos, setEditingPos] = useState<JobPosition | null>(null);
  const [posForm, setPosForm] = useState({
    code: '',
    title: '',
    departmentId: departments[0]?.id || '',
    level: 3,
    baseSalaryMin: 6000000,
    baseSalaryMax: 10000000,
    allowanceJob: 500000,
    dailyTransport: 35000,
    dailyMeal: 30000,
  });

  // Dept Form Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    headEmployeeId: '',
    description: '',
  });

  const handleOpenCreatePos = () => {
    setEditingPos(null);
    setPosForm({
      code: `POS-${positions.length + 1}`,
      title: '',
      departmentId: departments[0]?.id || '',
      level: 3,
      baseSalaryMin: 6000000,
      baseSalaryMax: 10000000,
      allowanceJob: 500000,
      dailyTransport: 35000,
      dailyMeal: 30000,
    });
    setShowPosModal(true);
  };

  const handleOpenEditPos = (p: JobPosition) => {
    setEditingPos(p);
    setPosForm({
      code: p.code,
      title: p.title,
      departmentId: p.departmentId,
      level: p.level,
      baseSalaryMin: p.baseSalaryMin,
      baseSalaryMax: p.baseSalaryMax,
      allowanceJob: p.allowanceJob,
      dailyTransport: p.dailyTransport,
      dailyMeal: p.dailyMeal,
    });
    setShowPosModal(true);
  };

  const handleSavePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPos) {
      updatePosition(editingPos.id, posForm);
    } else {
      addPosition(posForm);
    }
    setShowPosModal(false);
  };

  const handleExecuteMassApply = (e: React.FormEvent) => {
    e.preventDefault();
    massUpdatePositionAllowancesByLevel(massLevel, massTransport, massMeal);
    setMassSuccess(true);
    setTimeout(() => {
      setMassSuccess(false);
      setShowMassModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Struktur Organisasi & Master Jabatan
          </h1>
          <p className="text-sm text-slate-500">
            Atur hierarki departemen, level grade jabatan, serta tarif uang makan & transport massal.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('positions')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'positions'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jabatan & Tarif Tunjangan ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'departments'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Departemen & Divisi ({departments.length})
          </button>
        </div>
      </div>

      {/* TAB 1: POSITIONS & ALLOWANCE RATES */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Master Jabatan, Grade & Tarif Tunjangan Harian
              </h3>
              <p className="text-xs text-slate-500">
                Tarif transport (hari hadir kantor) & makan (hadir kantor + WFH) dihitung proporsional.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMassModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                Terapkan Massal per Level
              </button>

              <button
                onClick={handleOpenCreatePos}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
              >
                <Plus className="h-4 w-4" />
                Tambah Jabatan
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Jabatan & Kode</th>
                    <th className="px-4 py-3">Departemen</th>
                    <th className="px-4 py-3">Grade Level</th>
                    <th className="px-4 py-3">Rentang Gaji Pokok</th>
                    <th className="px-4 py-3">Tunj. Jabatan</th>
                    <th className="px-4 py-3">Transport / Hari</th>
                    <th className="px-4 py-3">Makan / Hari</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {positions.map((pos) => {
                    const dept = departments.find((d) => d.id === pos.departmentId);
                    return (
                      <tr key={pos.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{pos.title}</div>
                          <span className="font-mono text-[10px] text-slate-400">{pos.code}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{dept?.name || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 text-[11px] font-bold">
                            Level {pos.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatRupiah(pos.baseSalaryMin)} – {formatRupiah(pos.baseSalaryMax)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {formatRupiah(pos.allowanceJob)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {formatRupiah(pos.dailyTransport)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {formatRupiah(pos.dailyMeal)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditPos(pos)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus jabatan ${pos.title}?`)) {
                                  deletePosition(pos.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Departemen & Kepala Unit</h3>
              <p className="text-xs text-slate-500">Struktur unit kerja dan penanggung jawab divisi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const headEmp = employees.find((e) => e.nip === dept.headEmployeeId);
              const memberCount = employees.filter((e) => e.departmentId === dept.id).length;

              return (
                <div key={dept.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600">
                      {memberCount} Karyawan
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{dept.description || '-'}</p>

                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Kepala Departemen</span>
                    <span className="font-bold text-slate-800">{headEmp?.name || dept.headEmployeeId || '-'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Mass Apply per Level */}
      {showMassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Terapkan Tarif Tunjangan Massal per Level
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua jabatan pada grade level yang dipilih akan diperbarui tarifnya secara instan.
              </p>
            </div>

            <form onSubmit={handleExecuteMassApply} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Grade / Level Jabatan</label>
                <select
                  value={massLevel}
                  onChange={(e) => setMassLevel(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Level {lvl} ({positions.filter((p) => p.level === lvl).length} Jabatan)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tarif Transport Baru per Hari Hadir (Rp)
                </label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={massTransport}
                  onChange={(e) => setMassTransport(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tarif Uang Makan Baru per Hari Hadir (Rp)
                </label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={massMeal}
                  onChange={(e) => setMassMeal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-sm"
                />
              </div>

              {massSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Berhasil diterapkan massal ke semua jabatan Level {massLevel}!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMassModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Terapkan Massal Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Position */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPos ? 'Ubah Jabatan' : 'Tambah Jabatan Baru'}
              </h3>
            </div>

            <form onSubmit={handleSavePosition} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Kode Jabatan</label>
                  <input
                    type="text"
                    required
                    value={posForm.code}
                    onChange={(e) => setPosForm({ ...posForm, code: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Grade Level</label>
                  <select
                    value={posForm.level}
                    onChange={(e) => setPosForm({ ...posForm, level: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nama Jabatan</label>
                <input
                  type="text"
                  required
                  placeholder="Senior Developer"
                  value={posForm.title}
                  onChange={(e) => setPosForm({ ...posForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Departemen</label>
                <select
                  value={posForm.departmentId}
                  onChange={(e) => setPosForm({ ...posForm, departmentId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Gaji Pokok Min (Rp)</label>
                  <input
                    type="number"
                    step="500000"
                    value={posForm.baseSalaryMin}
                    onChange={(e) => setPosForm({ ...posForm, baseSalaryMin: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Gaji Pokok Max (Rp)</label>
                  <input
                    type="number"
                    step="500000"
                    value={posForm.baseSalaryMax}
                    onChange={(e) => setPosForm({ ...posForm, baseSalaryMax: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Tunj. Jabatan</label>
                  <input
                    type="number"
                    step="50000"
                    value={posForm.allowanceJob}
                    onChange={(e) => setPosForm({ ...posForm, allowanceJob: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Transport/Hari</label>
                  <input
                    type="number"
                    step="5000"
                    value={posForm.dailyTransport}
                    onChange={(e) => setPosForm({ ...posForm, dailyTransport: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Makan/Hari</label>
                  <input
                    type="number"
                    step="5000"
                    value={posForm.dailyMeal}
                    onChange={(e) => setPosForm({ ...posForm, dailyMeal: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPosModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Simpan Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
