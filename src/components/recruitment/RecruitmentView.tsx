import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { JobOpening, Applicant, ApplicantStage } from '../../types/hris';
import { formatRupiah } from '../../utils/payrollCalculator';
import {
  UserPlus,
  Briefcase,
  Star,
  CheckCircle2,
  XCircle,
  Plus,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign,
  FileCheck,
} from 'lucide-react';

export const RecruitmentView: React.FC = () => {
  const {
    jobOpenings,
    applicants,
    departments,
    addJobOpening,
    updateJobOpening,
    updateApplicantStage,
    updateApplicantRating,
    convertApplicantToEmployee,
  } = useHRIS();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'openings'>('pipeline');
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);

  // New Job Opening Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    code: `REC-${jobOpenings.length + 1}`,
    title: '',
    departmentId: departments[0]?.id || '',
    quota: 1,
    salaryMin: 7000000,
    salaryMax: 12000000,
    description: '',
    requirements: ['Minimal 2 tahun pengalaman kerja relevan', 'Keterampilan komunikasi kuat'],
    status: 'Buka' as JobOpening['status'],
  });

  const pipelineStages: ApplicantStage[] = [
    'Screening',
    'Interview HRD',
    'Interview User',
    'Offering',
    'Hired',
    'Ditolak',
  ];

  const handleConvert = (applicantId: string) => {
    try {
      const emp = convertApplicantToEmployee(applicantId);
      setConversionMessage(`Selamat! ${emp.name} berhasil diangkat menjadi karyawan dengan NIP ${emp.nip}!`);
      setTimeout(() => setConversionMessage(null), 5000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    addJobOpening(jobForm);
    setShowJobModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rekrutmen & Pipeline Pelamar
          </h1>
          <p className="text-sm text-slate-500">
            Manajemen lowongan dan funnel seleksi pelamar 6 tahap dengan tombol instan "Jadikan Karyawan".
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'pipeline'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pipeline Seleksi ({applicants.length})
          </button>
          <button
            onClick={() => setActiveTab('openings')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'openings'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lowongan Aktif ({jobOpenings.length})
          </button>
        </div>
      </div>

      {conversionMessage && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{conversionMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: PIPELINE 6 TAHAP                                         */}
      {/* ============================================================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Filter Lowongan:</span>
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="ALL">Semua Lowongan</option>
                {jobOpenings.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500">
              Drag / pindahkan tahap pelamar secara instan via dropdown di kartu.
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
            {pipelineStages.map((stage) => {
              const stageApplicants = applicants.filter((a) => {
                if (selectedJobFilter !== 'ALL' && a.jobOpeningId !== selectedJobFilter) return false;
                return a.stage === stage;
              });

              return (
                <div
                  key={stage}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 space-y-3 min-h-[300px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-xs">{stage}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm border border-slate-200">
                      {stageApplicants.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stageApplicants.map((app) => (
                      <div
                        key={app.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition space-y-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{app.name}</div>
                          <div className="text-[10px] text-slate-500">{app.jobTitle}</div>
                        </div>

                        {/* Stars & Source */}
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateApplicantRating(app.id, star)}
                                className="hover:scale-125 transition"
                              >
                                <Star
                                  className={`h-3 w-3 ${
                                    star <= app.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.2 font-medium">
                            {app.source}
                          </span>
                        </div>

                        {app.expectedSalary && (
                          <div className="text-[10px] text-slate-500">
                            Ekspektasi: <strong>{formatRupiah(app.expectedSalary)}</strong>
                          </div>
                        )}

                        {app.notes && (
                          <div className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 italic line-clamp-2">
                            "{app.notes}"
                          </div>
                        )}

                        {/* Move Stage Selector */}
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-1">
                          <select
                            value={app.stage}
                            onChange={(e) =>
                              updateApplicantStage(app.id, e.target.value as ApplicantStage)
                            }
                            className="rounded-lg border border-slate-200 text-[10px] py-1 px-1.5 font-medium text-slate-700 w-full"
                          >
                            {pipelineStages.map((st) => (
                              <option key={st} value={st}>
                                → {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Instant "Jadikan Karyawan" Converter Button */}
                        {(app.stage === 'Offering' || app.stage === 'Interview User' || app.stage === 'Hired') &&
                          !app.isConvertedToEmployee && (
                            <button
                              onClick={() => handleConvert(app.id)}
                              className="w-full flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-[10px] shadow-sm transition"
                            >
                              <Sparkles className="h-3 w-3" />
                              Jadikan Karyawan
                            </button>
                          )}

                        {app.isConvertedToEmployee && (
                          <div className="text-center rounded bg-emerald-50 text-emerald-700 py-1 text-[10px] font-bold border border-emerald-200">
                            ✓ Telah Menjadi Karyawan
                          </div>
                        )}
                      </div>
                    ))}

                    {stageApplicants.length === 0 && (
                      <div className="py-6 text-center text-[11px] text-slate-400 italic">
                        Kosong
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LOWONGAN PEKERJAAN                                      */}
      {/* ============================================================== */}
      {activeTab === 'openings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Lowongan Pekerjaan Perusahaan</h3>
              <p className="text-xs text-slate-500">Kelola kuota penerimaan dan rentang gaji rekrutmen</p>
            </div>
            <button
              onClick={() => setShowJobModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <Plus className="h-4 w-4" />
              Buka Lowongan Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobOpenings.map((job) => {
              const applicantCount = applicants.filter((a) => a.jobOpeningId === job.id).length;
              const dept = departments.find((d) => d.id === job.departmentId);

              return (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {job.code}
                    </span>
                    <button
                      onClick={() =>
                        updateJobOpening(job.id, {
                          status: job.status === 'Buka' ? 'Tutup' : 'Buka',
                        })
                      }
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        job.status === 'Buka'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Status: {job.status}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                  <div className="text-xs text-indigo-700 font-semibold">{dept?.name}</div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Rentang Gaji:{' '}
                      <strong className="text-slate-800">
                        {formatRupiah(job.salaryMin)} – {formatRupiah(job.salaryMax)}
                      </strong>
                    </div>
                    <div>
                      Kuota: <strong className="text-slate-800">{job.quota} Orang</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{applicantCount} Pelamar di Pipeline</span>
                    <button
                      onClick={() => {
                        setSelectedJobFilter(job.id);
                        setActiveTab('pipeline');
                      }}
                      className="text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      Lihat Pelamar <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Add Job Opening */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Buka Lowongan Pekerjaan Baru</h3>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Judul Posisi Lowongan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senior Backend Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Departemen</label>
                  <select
                    value={jobForm.departmentId}
                    onChange={(e) => setJobForm({ ...jobForm, departmentId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Kuota Diterima</label>
                  <input
                    type="number"
                    min="1"
                    value={jobForm.quota}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, quota: parseInt(e.target.value, 10) || 1 })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Gaji Minimum (Rp)</label>
                  <input
                    type="number"
                    step="500000"
                    value={jobForm.salaryMin}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, salaryMin: parseInt(e.target.value, 10) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Gaji Maksimum (Rp)</label>
                  <input
                    type="number"
                    step="500000"
                    value={jobForm.salaryMax}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, salaryMax: parseInt(e.target.value, 10) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Deskripsi Pekerjaan</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ringkasan tanggung jawab posisi..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Publikasikan Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
