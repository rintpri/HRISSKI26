import React from 'react';
import { useHRIS } from '../../context/HRISContext';
import { formatRupiah } from '../../utils/payrollCalculator';
import { NavTab } from '../layout/Sidebar';
import {
  Users,
  Clock,
  CalendarDays,
  Banknote,
  AlertTriangle,
  Gift,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    currentEmployee,
    currentRole,
    company,
    employees,
    attendanceRecords,
    leaveRequests,
    payrollPeriods,
    announcements,
    contractAlerts,
    documentAlerts,
    upcomingBirthdays,
    pendingLeaveApprovals,
    todayAttendance,
  } = useHRIS();

  const todayStr = new Date().toISOString().split('T')[0];
  const presentTodayCount = attendanceRecords.filter(
    (a) => a.date === todayStr && (a.status === 'Hadir' || a.status === 'Terlambat' || a.status === 'WFH')
  ).length;

  const currentMonthPeriod = payrollPeriods[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-400/20">
              Selamat Datang di Portal HRIS Terpadu
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
              Halo, {currentEmployee.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Mode Akses:{' '}
              <strong className="text-indigo-400 uppercase font-bold tracking-wider">
                {currentRole === 'hrd'
                  ? 'HRD & Super Admin'
                  : currentRole === 'manager'
                  ? 'Atasan / Manager Divisi'
                  : 'Portal Layanan Mandiri Karyawan'}
              </strong>{' '}
              • {company.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 text-xs shadow-md transition flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Presensi Mandiri Hari Ini
            </button>
            <button
              onClick={() => onNavigate('myslip')}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 text-xs transition border border-white/20"
            >
              Slip Gaji Saya
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div
          onClick={() => onNavigate(currentRole === 'hrd' ? 'employees' : 'selfservice')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Personel Aktif</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{employees.length} Orang</div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Tetap & Kontrak PKWT</span>
            <span className="text-indigo-600 font-bold flex items-center gap-0.5">
              Kelola <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Kehadiran Hari Ini */}
        <div
          onClick={() => onNavigate('attendance')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Kehadiran Hari Ini</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {presentTodayCount} / {employees.length}
          </div>
          <div className="text-xs text-slate-500">
            Tingkat Presensi: {((presentTodayCount / Math.max(employees.length, 1)) * 100).toFixed(0)}%
          </div>
        </div>

        {/* Pengajuan Cuti Pending */}
        <div
          onClick={() => onNavigate('leave')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-300 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Persetujuan Cuti</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {pendingLeaveApprovals.length} Menunggu
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Approval Berjenjang</span>
            <span className="text-amber-700 font-bold flex items-center gap-0.5">
              Tinjau <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Payroll Summary */}
        <div
          onClick={() => onNavigate(currentRole === 'hrd' ? 'payroll' : 'myslip')}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Payroll Periode Ini</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">
            {currentMonthPeriod ? formatRupiah(currentMonthPeriod.totalNet) : 'Siap Hitung'}
          </div>
          <div className="text-xs text-slate-500">
            {currentMonthPeriod ? `Status: ${currentMonthPeriod.status}` : 'Bulan Berjalan'}
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Today Status & Alerts) + Right (Birthdays & Announcements) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Attendance Status Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Status Presensi Anda Hari Ini</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">{todayStr}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500">Status Saat Ini:</span>
                <div className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  {todayAttendance ? (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>{todayAttendance.status}</span>
                      <span className="text-xs text-slate-500 font-normal">
                        (Masuk: {todayAttendance.clockInTime || '-'}
                        {todayAttendance.clockOutTime ? ` • Pulang: ${todayAttendance.clockOutTime}` : ''})
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span>Belum Melakukan Absen</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => onNavigate('attendance')}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                Buka Menu Absensi GPS
              </button>
            </div>
          </div>

          {/* Critical Alerts: Contracts (<=90d) & Documents (<=60d) */}
          {(contractAlerts.length > 0 || documentAlerts.length > 0) && (
            <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2 text-rose-800">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  <h3 className="font-bold text-sm">Peringatan Kritis Kontrak & Dokumen</h3>
                </div>
                <span className="text-xs font-bold text-rose-600">
                  {contractAlerts.length + documentAlerts.length} Perlu Tindakan
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {contractAlerts.map(({ contract, employee, daysLeft }) => (
                  <div
                    key={contract.id}
                    className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{employee.name}</span>
                      <div className="text-[11px] text-slate-500">
                        Kontrak PKWT berakhir: <strong>{contract.endDate}</strong> ({daysLeft} hari lagi)
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('employees')}
                      className="rounded-lg bg-rose-600 text-white font-bold px-3 py-1.5 text-[11px] shadow-sm hover:bg-rose-500 transition"
                    >
                      Perpanjang
                    </button>
                  </div>
                ))}

                {documentAlerts.map(({ document, employee, daysLeft }) => (
                  <div
                    key={document.id}
                    className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{employee.name}</span>
                      <div className="text-[11px] text-slate-500">
                        Dokumen: <strong>{document.title}</strong> habis pada {document.expiryDate} ({daysLeft} hari lagi)
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('employees')}
                      className="rounded-lg bg-indigo-600 text-white font-bold px-3 py-1.5 text-[11px] shadow-sm hover:bg-indigo-500 transition"
                    >
                      Tinjau
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Birthdays & Announcements */}
        <div className="space-y-6">
          {/* Ulang Tahun Bulan Ini */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Gift className="h-4 w-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Ulang Tahun Bulan Ini</h3>
            </div>

            <div className="space-y-2 text-xs">
              {upcomingBirthdays.length > 0 ? (
                upcomingBirthdays.map(({ employee, day, age }) => (
                  <div
                    key={employee.id}
                    className="rounded-xl border border-purple-100 bg-purple-50/60 p-2.5 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{employee.name}</span>
                      <div className="text-[11px] text-purple-700">Tanggal {day} • Usia {age} Tahun</div>
                    </div>
                    <span className="text-xl">🎂</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic py-2">Tidak ada yang berulang tahun bulan ini.</p>
              )}
            </div>
          </div>

          {/* Pengumuman Perusahaan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Megaphone className="h-4 w-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Pengumuman Resmi</h3>
            </div>

            <div className="space-y-3 text-xs">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5 hover:border-slate-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{ann.title}</span>
                    <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-[9px] font-bold">
                      {ann.category}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{ann.content}</p>
                  <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                    <span>Oleh: {ann.authorName}</span>
                    <span>{ann.publishedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
