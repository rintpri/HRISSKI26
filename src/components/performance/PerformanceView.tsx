import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { PerformanceEvaluation } from '../../types/hris';
import { Award, Plus, Star, CheckCircle, TrendingUp, Filter } from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const {
    performanceEvaluations,
    employees,
    departments,
    addPerformanceEvaluation,
    currentRole,
    currentEmployee,
  } = useHRIS();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: employees[4]?.id || '',
    period: 'Semester 2 2026',
    evaluatorNip: currentEmployee.nip,
    evaluatorName: currentEmployee.name,
    kpiScore: 85,
    disciplineScore: 90,
    teamworkScore: 85,
    leadershipScore: 80,
    notes: 'Kinerja sangat baik dan memenuhi target kuartal.',
    strengths: 'Kemampuan teknis solid dan proaktif.',
    improvements: 'Tingkatkan presensi waktu pagi.',
    status: 'Final' as PerformanceEvaluation['status'],
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === formData.employeeId);
    if (!emp) return;

    const dept = departments.find((d) => d.id === emp.departmentId);

    addPerformanceEvaluation({
      employeeId: emp.id,
      employeeNip: emp.nip,
      employeeName: emp.name,
      departmentName: dept?.name || 'Departemen',
      period: formData.period,
      evaluatorNip: currentEmployee.nip,
      evaluatorName: currentEmployee.name,
      kpiScore: formData.kpiScore,
      disciplineScore: formData.disciplineScore,
      teamworkScore: formData.teamworkScore,
      leadershipScore: formData.leadershipScore,
      notes: formData.notes,
      strengths: formData.strengths,
      improvements: formData.improvements,
      status: formData.status,
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Penilaian Kinerja & Evaluasi KPI
          </h1>
          <p className="text-sm text-slate-500">
            Sistem evaluasi kinerja berkala berbasis KPI, kedisiplinan, kerjasama tim, dan kepemimpinan.
          </p>
        </div>

        {(currentRole === 'hrd' || currentRole === 'manager') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            Beri Penilaian Baru
          </button>
        )}
      </div>

      {/* Grid of Evaluations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {performanceEvaluations.map((evalItem) => {
          const gradeColor =
            evalItem.grade === 'A'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : evalItem.grade === 'B'
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-amber-100 text-amber-800 border-amber-300';

          return (
            <div
              key={evalItem.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{evalItem.employeeName}</h3>
                  <div className="text-[11px] text-slate-500">
                    {evalItem.employeeNip} • {evalItem.departmentName}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Periode: <strong>{evalItem.period}</strong> • Dievaluasi oleh: {evalItem.evaluatorName}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-xl border px-3 py-1 font-black text-sm shadow-sm ${gradeColor}`}
                  >
                    Grade {evalItem.grade}
                  </span>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    Skor: {evalItem.finalScore} / 100
                  </div>
                </div>
              </div>

              {/* Score Breakdown Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-bold">KPI (40%)</span>
                  <span className="font-bold text-slate-900 text-sm">{evalItem.kpiScore}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-bold">Disiplin (20%)</span>
                  <span className="font-bold text-slate-900 text-sm">{evalItem.disciplineScore}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-bold">Teamwork (20%)</span>
                  <span className="font-bold text-slate-900 text-sm">{evalItem.teamworkScore}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-bold">Lead (20%)</span>
                  <span className="font-bold text-slate-900 text-sm">{evalItem.leadershipScore}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div>
                  <strong className="text-slate-900">Kekuatan Utama:</strong> {evalItem.strengths}
                </div>
                <div>
                  <strong className="text-slate-900">Area Pengembangan:</strong> {evalItem.improvements}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Performance Review */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Input Form Penilaian Kinerja Karyawan</h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Pilih Karyawan</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.nip})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Periode Evaluasi</label>
                  <input
                    type="text"
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">KPI (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.kpiScore}
                    onChange={(e) => setFormData({ ...formData, kpiScore: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Disiplin</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.disciplineScore}
                    onChange={(e) =>
                      setFormData({ ...formData, disciplineScore: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Teamwork</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.teamworkScore}
                    onChange={(e) =>
                      setFormData({ ...formData, teamworkScore: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Leadership</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.leadershipScore}
                    onChange={(e) =>
                      setFormData({ ...formData, leadershipScore: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Kekuatan / Pencapaian Utama</label>
                <input
                  type="text"
                  required
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Saran Perbaikan / Pengembangan</label>
                <input
                  type="text"
                  required
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Simpan Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
