import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { LeaveRequest, LeaveStatus } from '../../types/hris';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Shield,
  FileText,
  UserCheck,
  RotateCcw,
  Sparkles,
  Filter,
} from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const {
    currentEmployee,
    currentRole,
    leaveRequests,
    applyLeave,
    approveLeaveByManager,
    rejectLeaveByManager,
    approveLeaveByHrd,
    rejectLeaveByHrd,
    cancelLeave,
    employees,
    departments,
    generateAnnualLeaveQuotaAll,
    updateEmployeeLeaveBalance,
  } = useHRIS();

  const [activeTab, setActiveTab] = useState<'requests' | 'apply' | 'balances'>('requests');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Cuti Tahunan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');
  const [formFeedback, setFormFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // Notes Modal for Approval/Rejection
  const [approvalModal, setApprovalModal] = useState<{
    requestId: string;
    action: 'approve_manager' | 'reject_manager' | 'approve_hrd' | 'reject_hrd';
    applicantName: string;
    leaveType: string;
  } | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Mass Balance Generator Modal State
  const [defaultQuota, setDefaultQuota] = useState(12);

  // Auto calculate total working days
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      if (e >= s) {
        let count = 0;
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
          const day = d.getDay();
          if (day !== 0 && day !== 6) count++;
        }
        setTotalDays(Math.max(1, count));
      }
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const res = applyLeave({
      employeeId: currentEmployee.id,
      employeeNip: currentEmployee.nip,
      employeeName: currentEmployee.name,
      departmentName: departments.find((d) => d.id === currentEmployee.departmentId)?.name || 'Departemen',
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });

    setFormFeedback({
      success: res.success,
      text: res.message,
    });

    if (res.success) {
      setTimeout(() => {
        setStartDate('');
        setEndDate('');
        setReason('');
        setFormFeedback(null);
        setActiveTab('requests');
      }, 1500);
    }
  };

  const handleConfirmAction = () => {
    if (!approvalModal) return;
    const { action, requestId } = approvalModal;

    if (action === 'approve_manager') {
      approveLeaveByManager(requestId, actionNotes);
    } else if (action === 'reject_manager') {
      rejectLeaveByManager(requestId, actionNotes);
    } else if (action === 'approve_hrd') {
      approveLeaveByHrd(requestId, actionNotes);
    } else if (action === 'reject_hrd') {
      rejectLeaveByHrd(requestId, actionNotes);
    }

    setApprovalModal(null);
    setActionNotes('');
  };

  const leaveTypesList: LeaveRequest['leaveType'][] = [
    'Cuti Tahunan',
    'Cuti Sakit',
    'Cuti Menikah',
    'Cuti Melahirkan',
    'Cuti Duka / Kemalangan',
    'Cuti Khitanan/Baptis',
    'Cuti Haji/Umrah',
    'Cuti Alasan Penting',
    'Izin Khusus',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pengelolaan Cuti & Izin Berjenjang
          </h1>
          <p className="text-sm text-slate-500">
            Sistem 9 jenis cuti, approval berjenjang Atasan → HRD, dan pembaruan absensi otomatis.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('requests')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'requests'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Pengajuan ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'apply'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Ajukan Cuti Baru
          </button>
          {currentRole === 'hrd' && (
            <button
              onClick={() => setActiveTab('balances')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'balances'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saldo & Kuota Karyawan
            </button>
          )}
        </div>
      </div>

      {/* Sisa Saldo Quick Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-200">
            {currentEmployee.annualLeaveBalance}
          </div>
          <div>
            <div className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">
              Sisa Saldo Cuti Tahunan Anda ({currentEmployee.name})
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {currentEmployee.annualLeaveBalance} Hari Kerja Tersedia
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('apply')}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Ajukan Cuti Sekarang
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DAFTAR PENGAJUAN & APPROVAL BERJENJANG                   */}
      {/* ============================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Status Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600 shrink-0">Filter Status:</span>
            {['ALL', 'Menunggu Atasan', 'Menunggu HRD', 'Disetujui', 'Ditolak', 'Dibatalkan'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-lg px-2.5 py-1 font-medium transition shrink-0 ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {leaveRequests
              .filter((lr) => {
                if (filterStatus !== 'ALL' && lr.status !== filterStatus) return false;
                // If regular employee, only show their own
                if (currentRole === 'employee' && lr.employeeId !== currentEmployee.id) {
                  return false;
                }
                return true;
              })
              .map((lr) => {
                const isSubordinate = lr.managerNip === currentEmployee.nip;
                const canManagerApprove = (currentRole === 'manager' || currentRole === 'hrd') && isSubordinate && lr.status === 'Menunggu Atasan';
                const canHrdApprove = currentRole === 'hrd' && lr.status === 'Menunggu HRD';
                const canCancel = lr.employeeId === currentEmployee.id && lr.status !== 'Dibatalkan' && lr.status !== 'Ditolak';

                return (
                  <div
                    key={lr.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
                  >
                    {/* Top Row: Employee & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{lr.employeeName}</span>
                          <span className="text-xs text-slate-400">({lr.employeeNip})</span>
                          <span className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">
                            {lr.departmentName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Diajukan pada: {lr.appliedAt}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-bold">
                          {lr.leaveType}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            lr.status === 'Disetujui'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lr.status === 'Menunggu Atasan'
                              ? 'bg-amber-100 text-amber-800'
                              : lr.status === 'Menunggu HRD'
                              ? 'bg-sky-100 text-sky-800'
                              : lr.status === 'Ditolak'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {lr.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Duration & Reason */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold block">Periode Tanggal:</span>
                        <div className="font-bold text-slate-800 text-sm">
                          {lr.startDate} s/d {lr.endDate}
                        </div>
                        <span className="text-indigo-600 font-semibold">({lr.totalDays} hari kerja)</span>
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <span className="text-slate-400 font-semibold block">Alasan Pengajuan:</span>
                        <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{lr.reason}"
                        </p>
                      </div>
                    </div>

                    {/* Two-Tier Timeline Visual */}
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Jalur Persetujuan Berjenjang:
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
                        {/* Step 1: Atasan Langsung */}
                        <div
                          className={`flex-1 rounded-lg p-2 border ${
                            lr.managerStatus === 'Disetujui'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : lr.managerStatus === 'Ditolak'
                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>1. Atasan Langsung ({lr.managerName || 'Manager'})</span>
                            <span className="text-[10px] uppercase font-bold">{lr.managerStatus}</span>
                          </div>
                          {lr.managerNotes && (
                            <div className="text-[11px] text-slate-600 mt-1 italic">
                              Catatan: {lr.managerNotes}
                            </div>
                          )}
                          {lr.managerApprovedAt && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{lr.managerApprovedAt}</div>
                          )}
                        </div>

                        <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block shrink-0" />

                        {/* Step 2: HRD Final */}
                        <div
                          className={`flex-1 rounded-lg p-2 border ${
                            lr.hrdStatus === 'Disetujui'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : lr.hrdStatus === 'Ditolak'
                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>2. Verifikasi HRD (Final)</span>
                            <span className="text-[10px] uppercase font-bold">{lr.hrdStatus}</span>
                          </div>
                          {lr.hrdNotes && (
                            <div className="text-[11px] text-slate-600 mt-1 italic">
                              Catatan: {lr.hrdNotes}
                            </div>
                          )}
                          {lr.hrdApprovedAt && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{lr.hrdApprovedAt}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-400">
                        ID: <span className="font-mono">{lr.id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Manager Approval Actions */}
                        {canManagerApprove && (
                          <>
                            <button
                              onClick={() =>
                                setApprovalModal({
                                  requestId: lr.id,
                                  action: 'approve_manager',
                                  applicantName: lr.employeeName,
                                  leaveType: lr.leaveType,
                                })
                              }
                              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
                            >
                              ✓ Setujui (Atasan)
                            </button>
                            <button
                              onClick={() =>
                                setApprovalModal({
                                  requestId: lr.id,
                                  action: 'reject_manager',
                                  applicantName: lr.employeeName,
                                  leaveType: lr.leaveType,
                                })
                              }
                              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                            >
                              ✕ Tolak (Atasan)
                            </button>
                          </>
                        )}

                        {/* HRD Approval Actions */}
                        {canHrdApprove && (
                          <>
                            <button
                              onClick={() =>
                                setApprovalModal({
                                  requestId: lr.id,
                                  action: 'approve_hrd',
                                  applicantName: lr.employeeName,
                                  leaveType: lr.leaveType,
                                })
                              }
                              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
                            >
                              ✓ Setujui Final & Potong Saldo (HRD)
                            </button>
                            <button
                              onClick={() =>
                                setApprovalModal({
                                  requestId: lr.id,
                                  action: 'reject_hrd',
                                  applicantName: lr.employeeName,
                                  leaveType: lr.leaveType,
                                })
                              }
                              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                            >
                              ✕ Tolak (HRD)
                            </button>
                          </>
                        )}

                        {/* Cancel Button */}
                        {canCancel && (
                          <button
                            onClick={() => {
                              if (confirm('Batalkan pengajuan cuti ini? Jika sebelumnya sudah disetujui, saldo akan dipulihkan.')) {
                                cancelLeave(lr.id);
                              }
                            }}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                          >
                            Batalkan Cuti
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {leaveRequests.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
                Belum ada pengajuan cuti.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: AJUKAN CUTI BARU (9 JENIS CUTI & VALIDASI)               */}
      {/* ============================================================== */}
      {activeTab === 'apply' && (
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-900">Form Pengajuan Cuti / Izin Karyawan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Pengajuan akan diverifikasi berjenjang oleh Atasan Langsung Anda, kemudian disahkan oleh Tim HRD.
            </p>
          </div>

          <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Jenis Cuti / Izin (9 Jenis Resmi)</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                {leaveTypesList.map((lt) => (
                  <option key={lt} value={lt}>
                    {lt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Mulai Cuti</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => handleDateChange(e.target.value, endDate)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Selesai Cuti</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => handleDateChange(startDate, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px]">Durasi Dihitung Otomatis:</span>
                <div className="text-sm font-bold text-slate-900">{totalDays} Hari Kerja (Exclude Sabtu/Minggu)</div>
              </div>
              {leaveType === 'Cuti Tahunan' && (
                <div className="text-right">
                  <span className="text-slate-500 text-[11px]">Sisa Saldo Anda:</span>
                  <div className={`text-sm font-bold ${currentEmployee.annualLeaveBalance >= totalDays ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {currentEmployee.annualLeaveBalance} Hari
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Alasan Pengajuan Cuti</label>
              <textarea
                rows={3}
                required
                placeholder="Jelaskan keperluan cuti secara jelas dan rinci..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {formFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  formFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {formFeedback.text}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
              >
                Kirim Pengajuan Cuti
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SALDO CUTI KARYAWAN (HRD ONLY)                           */}
      {/* ============================================================== */}
      {activeTab === 'balances' && currentRole === 'hrd' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pengaturan Saldo Cuti Tahunan Karyawan</h3>
              <p className="text-xs text-slate-500">
                Generate kuota cuti tahunan massal atau ubah saldo per masing-masing karyawan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="30"
                value={defaultQuota}
                onChange={(e) => setDefaultQuota(Number(e.target.value))}
                className="w-20 rounded-xl border border-slate-200 p-2 text-xs text-center font-bold"
              />
              <button
                onClick={() => {
                  if (confirm(`Terapkan ${defaultQuota} hari kuota cuti ke seluruh karyawan?`)) {
                    generateAnnualLeaveQuotaAll(defaultQuota);
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate Setahun Massal
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Karyawan</th>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Status Kontrak</th>
                  <th className="px-4 py-3">Saldo Cuti Tersisa</th>
                  <th className="px-4 py-3 text-right">Ubah Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400">{emp.nip}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {departments.find((d) => d.id === emp.departmentId)?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-medium">
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-indigo-700 text-sm">{emp.annualLeaveBalance} Hari</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => updateEmployeeLeaveBalance(emp.id, Math.max(0, emp.annualLeaveBalance - 1))}
                          className="h-7 w-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                          title="Kurangi 1 hari"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateEmployeeLeaveBalance(emp.id, emp.annualLeaveBalance + 1)}
                          className="h-7 w-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                          title="Tambah 1 hari"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Notes Modal */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {approvalModal.action.includes('approve') ? 'Persetujuan Cuti' : 'Penolakan Cuti'}
              </h3>
              <p className="text-xs text-slate-500">
                {approvalModal.applicantName} • {approvalModal.leaveType}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700">Catatan Tindakan (Opsional)</label>
              <textarea
                rows={3}
                placeholder="Berikan catatan persetujuan atau alasan penolakan..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setApprovalModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md ${
                  approvalModal.action.includes('approve')
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Konfirmasi {approvalModal.action.includes('approve') ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
