import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { Role } from '../../types/hris';
import {
  Building2,
  Bell,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Users,
  HardDrive,
  FileSpreadsheet,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    company,
    currentEmployee,
    currentRole,
    setCurrentRole,
    setCurrentEmployeeId,
    employees,
    contractAlerts,
    documentAlerts,
    upcomingBirthdays,
    pendingLeaveApprovals,
    resetToDemoData,
    logout,
  } = useHRIS();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const totalAlertCount =
    contractAlerts.length +
    documentAlerts.length +
    pendingLeaveApprovals.length +
    upcomingBirthdays.length;

  const roleLabels: Record<Role, { name: string; badge: string; color: string }> = {
    hrd: { name: 'HRD / Admin', badge: 'Akses Penuh', color: 'bg-indigo-700 text-white' },
    manager: { name: 'Atasan / Manager', badge: 'Approval Tim', color: 'bg-emerald-700 text-white' },
    employee: { name: 'Karyawan', badge: 'Self-Service', color: 'bg-amber-700 text-white' },
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Brand & Company Name */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white shadow-md shadow-indigo-200">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-900 text-sm sm:text-base">
              {company.name}
            </span>
            <span className="hidden rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 md:inline-block border border-blue-200">
              HRIS Enterprise
            </span>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">{company.tagline}</p>
        </div>
      </div>

      {/* Right Controls: Role Switcher, Google Sync Indicator, Notifications, Persona Switcher */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Fast Role Simulator Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition shadow-sm"
            title="Ganti Mode Peran Pengguna untuk menguji workflow"
          >
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span className="hidden sm:inline">Peran:</span>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${roleLabels[currentRole].color}`}>
              {roleLabels[currentRole].name}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Simulasi Hak Akses
              </div>
              <div className="mt-1 space-y-1">
                {(['hrd', 'manager', 'employee'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
                      currentRole === r
                        ? 'bg-indigo-50 font-semibold text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{roleLabels[r].name}</span>
                    <span className="text-[10px] text-slate-400">{roleLabels[r].badge}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications & Smart Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Peringatan Kontrak, Dokumen & Persetujuan"
          >
            <Bell className="h-4 w-4" />
            {totalAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {totalAlertCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 z-50 max-h-[480px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <span className="text-sm font-bold text-slate-800">Pusat Peringatan & Notifikasi</span>
                <span className="text-xs text-indigo-600 font-medium">{totalAlertCount} aktif</span>
              </div>

              <div className="mt-3 space-y-2.5">
                {/* Pending Leave Approvals */}
                {pendingLeaveApprovals.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      Persetujuan Cuti Menunggu Tindakan ({pendingLeaveApprovals.length})
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {pendingLeaveApprovals.slice(0, 3).map((lr) => (
                        <div key={lr.id} className="text-xs text-slate-700 bg-white/80 p-1.5 rounded-lg border border-amber-100">
                          <span className="font-semibold text-slate-900">{lr.employeeName}</span> ({lr.leaveType}) - {lr.totalDays} hari kerja
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contract Expiring <= 90 days */}
                {contractAlerts.length > 0 && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      Peringatan Kontrak PKWT (≤90 Hari) ({contractAlerts.length})
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {contractAlerts.map(({ contract, employee, daysLeft }) => (
                        <div key={contract.id} className="text-xs text-slate-700 bg-white/80 p-1.5 rounded-lg border border-rose-100 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-900">{employee.name}</span>
                            <div className="text-[11px] text-slate-500">Berakhir: {contract.endDate}</div>
                          </div>
                          <span className="rounded bg-rose-100 text-rose-700 px-1.5 py-0.5 text-[10px] font-bold">
                            {daysLeft} hari lagi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Expiring <= 60 days */}
                {documentAlerts.length > 0 && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      Dokumen Habis Berlaku (≤60 Hari) ({documentAlerts.length})
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {documentAlerts.map(({ document, employee, daysLeft }) => (
                        <div key={document.id} className="text-xs text-slate-700 bg-white/80 p-1.5 rounded-lg border border-blue-100 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-900">{employee.name}</span>
                            <div className="text-[11px] text-slate-500">{document.title}</div>
                          </div>
                          <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-bold">
                            {daysLeft} hari lagi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Birthdays this month */}
                {upcomingBirthdays.length > 0 && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
                      <Calendar className="h-3.5 w-3.5 text-purple-600" />
                      Ulang Tahun Karyawan Bulan Ini ({upcomingBirthdays.length})
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {upcomingBirthdays.map(({ employee, day, age }) => (
                        <div key={employee.id} className="text-xs text-slate-700 bg-white/80 p-1.5 rounded-lg border border-purple-100 flex justify-between items-center">
                          <span className="font-medium text-slate-800">{employee.name}</span>
                          <span className="text-[11px] font-semibold text-purple-700">Tgl {day} ({age} th)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalAlertCount === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Tidak ada peringatan kritis saat ini. Semua dokumen dan kontrak dalam status aman.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 shadow-sm hover:border-slate-300 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-xs">
              {currentEmployee.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{currentEmployee.name}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[130px]">{currentEmployee.nip}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl ring-1 ring-black/5 z-50">
              <div className="border-b border-slate-100 pb-2 px-2">
                <p className="text-xs font-bold text-slate-800">{currentEmployee.name}</p>
                <p className="text-[11px] text-slate-500">{currentEmployee.email}</p>
                <p className="text-[10px] text-indigo-600 font-medium mt-0.5">NIP: {currentEmployee.nip}</p>
              </div>

              <div className="mt-2">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ganti Profil Demo
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {employees.slice(0, 8).map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setCurrentEmployeeId(emp.id);
                        setCurrentRole(emp.role);
                        setShowUserMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition ${
                        currentEmployee.id === emp.id
                          ? 'bg-indigo-50 font-bold text-indigo-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-left truncate">
                        <div>{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.nip} • {emp.role.toUpperCase()}</div>
                      </div>
                      {currentEmployee.id === emp.id && <UserCheck className="h-3.5 w-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 border-t border-slate-100 pt-2 flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    if (confirm('Kembalikan semua data ke contoh dummy data awal?')) {
                      resetToDemoData();
                      setShowUserMenu(false);
                    }
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Data
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition"
                >
                  Keluar (Logout)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
