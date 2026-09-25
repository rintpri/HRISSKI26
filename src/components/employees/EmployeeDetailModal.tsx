import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { Employee } from '../../types/hris';
import { formatRupiah } from '../../utils/payrollCalculator';
import {
  User,
  Briefcase,
  FileText,
  Clock,
  CalendarDays,
  Banknote,
  AlertTriangle,
  RotateCw,
  Plus,
  X,
  MapPin,
  Shield,
  CheckCircle,
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  onClose,
  onEdit,
}) => {
  const {
    departments,
    positions,
    locations,
    contracts,
    documents,
    salaryHistories,
    careerHistories,
    attendanceRecords,
    leaveRequests,
    payslips,
    extendContractOneYear,
    extendDocumentOneYear,
    currentRole,
  } = useHRIS();

  const [activeTab, setActiveTab] = useState<
    'personal' | 'employment' | 'contracts' | 'documents' | 'attendance' | 'leave' | 'payroll'
  >('personal');

  const dept = departments.find((d) => d.id === employee.departmentId);
  const position = positions.find((p) => p.id === employee.positionId);
  const primaryLoc = locations.find((l) => l.id === employee.primaryLocationId);

  const empContracts = contracts.filter((c) => c.employeeId === employee.id);
  const empDocuments = documents.filter((d) => d.employeeId === employee.id);
  const empSalaries = salaryHistories.filter((s) => s.employeeId === employee.id);
  const empCareers = careerHistories.filter((c) => c.employeeId === employee.id);
  const empAttendances = attendanceRecords
    .filter((a) => a.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const empLeaves = leaveRequests.filter((l) => l.employeeId === employee.id);
  const empPayslips = payslips.filter((p) => p.employeeId === employee.id);

  // Check contract expiry alert
  const today = new Date();
  const activeContract = empContracts.find((c) => c.isActive);
  let contractDaysLeft: number | null = null;
  if (activeContract?.endDate) {
    const end = new Date(activeContract.endDate);
    contractDaysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6">
        {/* Modal Top Profile Bar */}
        <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
              {employee.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{employee.name}</h2>
                <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-400/30">
                  {employee.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {employee.nip} • {position?.title || 'Karyawan'} • {dept?.name || 'Departemen'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <span>Bergabung: {employee.joinDate}</span>
                <span>• Status: {employee.employmentStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentRole === 'hrd' && (
              <button
                onClick={onEdit}
                className="rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold text-white transition border border-white/20"
              >
                Edit Karyawan
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'personal', label: 'Profil Pribadi', icon: User },
            { id: 'employment', label: 'Kepegawaian & Mutasi', icon: Briefcase },
            { id: 'contracts', label: 'Kontrak Kerja', icon: FileText, alert: contractDaysLeft !== null && contractDaysLeft <= 90 },
            { id: 'documents', label: 'Dokumen & Legal', icon: Shield },
            { id: 'attendance', label: 'Absensi', icon: Clock },
            { id: 'leave', label: 'Cuti & Izin', icon: CalendarDays },
            { id: 'payroll', label: 'Penggajian', icon: Banknote },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition shrink-0 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[500px] overflow-y-auto text-xs">
          {/* TAB 1: PROFIL PRIBADI */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm">
                  Identitas Diri & Kontak
                </h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Induk Kependudukan (NIK):</span>
                    <span className="font-medium text-slate-900">{employee.nik}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tempat, Tanggal Lahir:</span>
                    <span className="font-medium text-slate-900">
                      {employee.birthPlace}, {employee.birthDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jenis Kelamin:</span>
                    <span className="font-medium text-slate-900">
                      {employee.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agama:</span>
                    <span className="font-medium text-slate-900">{employee.religion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Pernikahan:</span>
                    <span className="font-medium text-slate-900">{employee.maritalStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email Perusahaan:</span>
                    <span className="font-medium text-indigo-600">{employee.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Handphone / WA:</span>
                    <span className="font-medium text-slate-900">{employee.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alamat Tempat Tinggal:</span>
                    <span className="font-medium text-slate-900 text-right max-w-[200px]">
                      {employee.address}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm">
                  Data Perbankan & Asuransi Sosial
                </h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Bank:</span>
                    <span className="font-bold text-slate-900">{employee.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Rekening:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {employee.bankAccountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Atas Nama Rekening:</span>
                    <span className="font-medium text-slate-900">{employee.bankAccountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NPWP:</span>
                    <span className="font-mono font-medium text-slate-900">
                      {employee.npwp || <span className="text-rose-500 italic">Non-NPWP</span>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Pajak (PTKP):</span>
                    <span className="font-bold text-indigo-700">{employee.ptkpStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor BPJS Kesehatan:</span>
                    <span className="font-mono text-slate-900">
                      {employee.bpjsKesNumber || 'Belum didaftarkan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor BPJS Ketenagakerjaan:</span>
                    <span className="font-mono text-slate-900">
                      {employee.bpjsTkNumber || 'Belum didaftarkan'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEPEGAWAIAN & MUTASI */}
          {activeTab === 'employment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Atasan Langsung</span>
                  <span className="font-bold text-slate-900 text-sm">{employee.managerNip || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Lokasi Presensi Utama</span>
                  <span className="font-bold text-slate-900 text-sm">{primaryLoc?.name || 'Bebas'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Hak Akses Login</span>
                  <span className="font-bold text-indigo-600 text-sm uppercase">{employee.role}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-3 text-sm">Riwayat Karir & Mutasi Jabatan</h4>
                <div className="space-y-2">
                  {empCareers.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-200 p-3 bg-white flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{c.positionTitle}</div>
                        <div className="text-[11px] text-slate-500">{c.departmentName}</div>
                      </div>
                      <div className="text-right">
                        <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-bold">
                          {c.type}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{c.effectiveDate}</div>
                      </div>
                    </div>
                  ))}
                  {empCareers.length === 0 && (
                    <p className="text-slate-400 italic">Belum ada riwayat mutasi.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KONTRAK KERJA (ALERT <=90 HARI) */}
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              {contractDaysLeft !== null && contractDaysLeft <= 90 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                    <div>
                      <h5 className="font-bold text-rose-900">
                        Peringatan: Masa Berlaku Kontrak PKWT Tinggal {contractDaysLeft} Hari!
                      </h5>
                      <p className="text-xs text-rose-700 mt-0.5">
                        Kontrak berakhir pada {activeContract?.endDate}. Segera perpanjang atau lakukan evaluasi pengangkatan.
                      </p>
                    </div>
                  </div>
                  {activeContract && (
                    <button
                      onClick={() => extendContractOneYear(activeContract.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-500 transition shrink-0"
                    >
                      <RotateCw className="h-4 w-4" />
                      Perpanjang 1 Tahun
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {empContracts.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">{c.contractNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        Jenis: <strong>{c.type}</strong> • Mulai: {c.startDate} {c.endDate ? `s/d ${c.endDate}` : '(Tetap)'}
                      </div>
                      {c.notes && <div className="text-[11px] text-slate-400 italic mt-0.5">{c.notes}</div>}
                    </div>
                    {c.endDate && (
                      <button
                        onClick={() => extendContractOneYear(c.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                      >
                        <RotateCw className="h-3 w-3" />
                        +1 Tahun
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DOKUMEN & LEGAL (ALERT <=60 HARI) */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              {empDocuments.map((doc) => {
                let isExpiringSoon = false;
                let daysLeft = 0;
                if (doc.expiryDate) {
                  daysLeft = Math.ceil(
                    (new Date(doc.expiryDate).getTime() - today.getTime()) / (1000 * 3600 * 24)
                  );
                  isExpiringSoon = daysLeft <= 60;
                }

                return (
                  <div
                    key={doc.id}
                    className={`rounded-xl border p-4 flex justify-between items-center ${
                      isExpiringSoon ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.title}</span>
                        <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] font-bold">
                          {doc.type}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        No. Dokumen: {doc.documentNumber || '-'}
                      </div>
                      {doc.expiryDate && (
                        <div className="text-[11px] text-slate-500">
                          Berlaku s/d: <strong>{doc.expiryDate}</strong>{' '}
                          {isExpiringSoon && (
                            <span className="text-amber-700 font-bold ml-1">
                              ({daysLeft} hari lagi!)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {doc.expiryDate && (
                      <button
                        onClick={() => extendDocumentOneYear(doc.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 shadow-sm"
                      >
                        <RotateCw className="h-3 w-3" />
                        Perpanjang Dokumen (1 Thn)
                      </button>
                    )}
                  </div>
                );
              })}

              {empDocuments.length === 0 && (
                <p className="text-slate-400 italic text-center py-6">Belum ada dokumen tersimpan.</p>
              )}
            </div>
          )}

          {/* TAB 5: ABSENSI */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Masuk</th>
                      <th className="px-3 py-2">Pulang</th>
                      <th className="px-3 py-2">Lembur</th>
                      <th className="px-3 py-2">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empAttendances.slice(0, 15).map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono font-medium">{att.date}</td>
                        <td className="px-3 py-2">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-bold">
                            {att.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{att.clockInTime || '-'}</td>
                        <td className="px-3 py-2 text-slate-700">{att.clockOutTime || '-'}</td>
                        <td className="px-3 py-2 text-indigo-700 font-bold">
                          {att.overtimeHours ? `${att.overtimeHours} jam` : '-'}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{att.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CUTI */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-indigo-700 font-semibold">Sisa Saldo Cuti Tahunan:</span>
                  <div className="text-xl font-bold text-slate-900">{employee.annualLeaveBalance} Hari Kerja</div>
                </div>
              </div>

              <div className="space-y-2">
                {empLeaves.map((lr) => (
                  <div
                    key={lr.id}
                    className="rounded-xl border border-slate-200 p-3 bg-white flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{lr.leaveType}</div>
                      <div className="text-slate-500 text-[11px]">
                        {lr.startDate} s/d {lr.endDate} ({lr.totalDays} hari)
                      </div>
                      <div className="text-slate-400 italic text-[11px] mt-0.5">"{lr.reason}"</div>
                    </div>
                    <span className="rounded-full bg-slate-100 text-slate-800 px-2.5 py-0.5 text-[10px] font-bold">
                      {lr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PENGGAJIAN */}
          {activeTab === 'payroll' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Gaji Pokok</span>
                  <div className="font-bold text-slate-900 text-sm">{formatRupiah(employee.baseSalary)}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Tunjangan Jabatan</span>
                  <div className="font-semibold text-slate-800 text-sm">
                    {formatRupiah(employee.customJobAllowance ?? position?.allowanceJob ?? 0)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Tarif Transport / Hari</span>
                  <div className="font-semibold text-slate-800 text-sm">
                    {formatRupiah(employee.customDailyTransport ?? position?.dailyTransport ?? 35000)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Tarif Makan / Hari</span>
                  <div className="font-semibold text-slate-800 text-sm">
                    {formatRupiah(employee.customDailyMeal ?? position?.dailyMeal ?? 30000)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2 text-sm">Riwayat Slip Gaji</h4>
                <div className="space-y-2">
                  {empPayslips.map((ps) => (
                    <div
                      key={ps.id}
                      className="rounded-xl border border-slate-200 p-3 bg-white flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900">Periode: {ps.periodId.replace('prd-', '')}</div>
                        <div className="text-[11px] text-slate-500">
                          Bruto: {formatRupiah(ps.grossIncome)} • Potongan: {formatRupiah(ps.totalDeductions)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-indigo-700 text-sm">{formatRupiah(ps.netSalary)}</div>
                        <span className="text-[10px] text-slate-400">{ps.status}</span>
                      </div>
                    </div>
                  ))}
                  {empPayslips.length === 0 && (
                    <p className="text-slate-400 italic text-center py-4">Belum ada slip gaji terarsip.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
