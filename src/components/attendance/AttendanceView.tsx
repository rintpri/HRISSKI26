import React, { useState, useEffect } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { AttendanceStatus } from '../../types/hris';
import { formatDistance, getBrowserLocation } from '../../utils/geo';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  CheckCheck,
  Edit,
  Building,
  Navigation,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    currentEmployee,
    currentRole,
    company,
    locations,
    attendanceRecords,
    todayAttendance,
    clockIn,
    clockOut,
    markAllPresentToday,
    upsertAttendanceRecord,
    employees,
    departments,
    exportToCsvOrExcel,
  } = useHRIS();

  const [activeSubTab, setActiveSubTab] = useState<'self' | 'daily' | 'matrix'>('self');

  // Real-time digital clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // GPS state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clockMessage, setClockMessage] = useState<{ success: boolean; text: string; distance?: number } | null>(null);

  // Daily View Filter
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');

  // Matrix View State
  const [matrixMonth, setMatrixMonth] = useState(new Date().getMonth() + 1);
  const [matrixYear, setMatrixYear] = useState(new Date().getFullYear());

  // Manual Edit Modal State
  const [editingRecord, setEditingRecord] = useState<{
    employeeId: string;
    employeeName: string;
    date: string;
    status: AttendanceStatus;
    clockInTime?: string;
    clockOutTime?: string;
    workLocationId?: string;
    overtimeHours?: number;
    notes?: string;
  } | null>(null);

  // Assigned locations of current employee
  const assignedLocations = locations.filter(
    (l) => currentEmployee.allowedLocationIds?.includes(l.id) || l.id === currentEmployee.primaryLocationId
  );

  // Handle GPS Clock In
  const handleClockInAction = async (status: 'Hadir' | 'WFH', customCoords?: { lat: number; lng: number }) => {
    setGpsLoading(true);
    setClockMessage(null);

    let coords = customCoords || gpsCoords;

    if (status === 'Hadir' && !coords) {
      try {
        const browserLoc = await getBrowserLocation();
        coords = { lat: browserLoc.latitude, lng: browserLoc.longitude };
        setGpsCoords(coords);
      } catch (err: any) {
        // If user blocked browser GPS but geofencing is off, still allow
        if (!company.isGeofencingActive) {
          coords = { lat: -6.225014, lng: 106.809712 }; // default SCBD
        } else {
          setGpsLoading(false);
          setClockMessage({
            success: false,
            text: err.message || 'Izin GPS diperlukan untuk verifikasi lokasi kantor.',
          });
          return;
        }
      }
    }

    const res = clockIn(status, coords || undefined);
    setClockMessage({
      success: res.success,
      text: res.message,
      distance: res.distance,
    });
    setGpsLoading(false);
  };

  // Handle Clock Out
  const handleClockOutAction = async () => {
    setGpsLoading(true);
    setClockMessage(null);
    let coords = gpsCoords;
    try {
      const browserLoc = await getBrowserLocation();
      coords = { lat: browserLoc.latitude, lng: browserLoc.longitude };
      setGpsCoords(coords);
    } catch (e) {
      // Pulang tetap bisa dicatat
    }

    const res = clockOut(coords || undefined);
    setClockMessage({
      success: res.success,
      text: res.message,
    });
    setGpsLoading(false);
  };

  // Matrix Days Generator
  const daysInMatrixMonth = new Date(matrixYear, matrixMonth, 0).getDate();
  const matrixDays = Array.from({ length: daysInMatrixMonth }, (_, i) => i + 1);

  // Export Matrix to Excel
  const handleExportMatrix = () => {
    const rows = employees.map((emp) => {
      const row: Record<string, any> = {
        NIP: emp.nip,
        'Nama Karyawan': emp.name,
        Departemen: departments.find((d) => d.id === emp.departmentId)?.name || '-',
      };

      let presentCount = 0;
      let lateCount = 0;
      let wfhCount = 0;
      let sickCount = 0;
      let permitCount = 0;
      let leaveCount = 0;
      let alphaCount = 0;
      let overtimeHoursSum = 0;

      for (let day = 1; day <= daysInMatrixMonth; day++) {
        const dateStr = `${matrixYear}-${String(matrixMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const att = attendanceRecords.find((a) => a.employeeId === emp.id && a.date === dateStr);

        let code = '-';
        if (att) {
          if (att.status === 'Hadir') {
            code = 'H';
            presentCount++;
          } else if (att.status === 'Terlambat') {
            code = 'T';
            presentCount++;
            lateCount++;
          } else if (att.status === 'WFH') {
            code = 'WFH';
            wfhCount++;
          } else if (att.status === 'Sakit') {
            code = 'S';
            sickCount++;
          } else if (att.status === 'Izin') {
            code = 'I';
            permitCount++;
          } else if (att.status === 'Cuti') {
            code = 'C';
            leaveCount++;
          } else if (att.status === 'Alpha') {
            code = 'A';
            alphaCount++;
          }
          overtimeHoursSum += att.overtimeHours || 0;
        }

        row[`Tgl ${day}`] = code;
      }

      const totalHadir = presentCount + wfhCount;
      const rate = ((totalHadir / Math.max(1, 22)) * 100).toFixed(0);

      row['Total Hadir Kantor'] = presentCount;
      row['Total WFH'] = wfhCount;
      row['Terlambat (kali)'] = lateCount;
      row['Sakit'] = sickCount;
      row['Izin'] = permitCount;
      row['Cuti'] = leaveCount;
      row['Alpha'] = alphaCount;
      row['Total Jam Lembur'] = overtimeHoursSum;
      row['% Kehadiran'] = `${rate}%`;

      return row;
    });

    exportToCsvOrExcel(`Rekap_Absensi_${matrixYear}_${matrixMonth}`, rows, 'xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sistem Kehadiran & Absensi Otomatis
          </h1>
          <p className="text-sm text-slate-500">
            Pencatatan kehadiran geofencing GPS, absensi mandiri karyawan, dan matriks bulanan.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveSubTab('self')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'self'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Absen Mandiri (GPS)
          </button>
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'daily'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Absensi Harian Tim
          </button>
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'matrix'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekap Matriks 1–31
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ABSEN MANDIRI (GEOFENCING GPS)                           */}
      {/* ============================================================== */}
      {activeSubTab === 'self' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live Clock & Action Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-400/20">
                    <Clock className="h-3.5 w-3.5" />
                    Waktu Server Resmi (WIB)
                  </span>
                  <div className="mt-2 text-4xl sm:text-5xl font-mono font-bold tracking-tight">
                    {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Jadwal Jam Kerja Kantor</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {company.standardWorkStartTime} – {company.standardWorkEndTime}
                  </div>
                  <div className="text-xs text-slate-400">Toleransi: +{company.lateGraceMinutes} menit</div>
                </div>
              </div>

              {/* Status Hari Ini */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div>
                  <div className="text-xs text-slate-400">Status Kehadiran Anda Hari Ini:</div>
                  <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                    {todayAttendance ? (
                      <>
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            todayAttendance.status === 'Hadir'
                              ? 'bg-emerald-400'
                              : todayAttendance.status === 'WFH'
                              ? 'bg-blue-400'
                              : todayAttendance.status === 'Terlambat'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        <span>{todayAttendance.status}</span>
                        {todayAttendance.clockInTime && (
                          <span className="text-xs text-slate-300 font-normal">
                            (Masuk: {todayAttendance.clockInTime}
                            {todayAttendance.clockOutTime ? ` • Pulang: ${todayAttendance.clockOutTime}` : ''})
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-300">Belum melakukan presensi</span>
                    )}
                  </div>
                </div>

                {todayAttendance?.overtimeHours ? (
                  <div className="rounded-xl bg-indigo-500/20 px-3 py-1.5 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
                    Lembur: {todayAttendance.overtimeHours} Jam (Otomatis Dihitung)
                  </div>
                ) : null}
              </div>

              {/* Feedback Alert Message */}
              {clockMessage && (
                <div
                  className={`mt-4 rounded-2xl p-4 text-xs font-semibold flex items-start gap-3 transition ${
                    clockMessage.success
                      ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-200'
                      : 'bg-rose-500/20 border border-rose-400/30 text-rose-200'
                  }`}
                >
                  {clockMessage.success ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                  )}
                  <div>
                    <div className="font-bold">{clockMessage.success ? 'Absensi Berhasil!' : 'Gagal Melakukan Absensi'}</div>
                    <div className="mt-0.5 opacity-90">{clockMessage.text}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  disabled={gpsLoading || Boolean(todayAttendance?.clockInTime)}
                  onClick={() => handleClockInAction('Hadir')}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <MapPin className="h-4 w-4" />
                  {todayAttendance?.clockInTime ? 'Sudah Absen Masuk' : 'Absen Masuk (Kantor)'}
                </button>

                <button
                  disabled={gpsLoading || Boolean(todayAttendance?.clockInTime)}
                  onClick={() => handleClockInAction('WFH')}
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-white/20 px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-100 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Building className="h-4 w-4" />
                  Absen Masuk (WFH)
                </button>

                <button
                  disabled={gpsLoading || !todayAttendance?.clockInTime || Boolean(todayAttendance?.clockOutTime)}
                  onClick={handleClockOutAction}
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Clock className="h-4 w-4" />
                  {todayAttendance?.clockOutTime ? 'Sudah Absen Pulang' : 'Absen Pulang'}
                </button>
              </div>

              {/* Simulation Quick Testers (So user can test both inside & outside Geofence effortlessly) */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Alat Uji Cepat Geofencing (Simulasi Koordinat)
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => handleClockInAction('Hadir', { lat: -6.225014, lng: 106.809712 })}
                    className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 border border-emerald-400/30 font-medium transition"
                  >
                    📍 Titik Tepat di Kantor Pusat SCBD (0 meter)
                  </button>
                  <button
                    onClick={() => handleClockInAction('Hadir', { lat: -6.245014, lng: 106.819712 })}
                    className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-3 py-1.5 border border-rose-400/30 font-medium transition"
                  >
                    🚫 Titik di Luar Radius (2.4 km)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Location Policy & Assigned Locations */}
          <div className="space-y-6">
            {/* Geofencing Policy Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Kebijakan Kunci Lokasi</h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    company.isGeofencingActive
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {company.isGeofencingActive ? 'AKTIF' : 'NONAKTIF (Default Aman)'}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  Status Kunci Lokasi:{' '}
                  <strong>{company.isGeofencingActive ? 'Wajib berada di radius' : 'Bebas dari mana saja'}</strong>.
                </p>
                <p>
                  Toleransi sinyal GPS: <strong>±{company.gpsToleranceMeters} meter</strong>.
                </p>
                <p className="text-[11px] text-slate-500">
                  Untuk mengaktifkan/menonaktifkan kunci lokasi perusahaan, kunjungi menu <strong>Kunci Lokasi (GPS)</strong>.
                </p>
              </div>
            </div>

            {/* Assigned Locations for Current User */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Lokasi Penugasan Anda</h3>
                </div>
                <span className="text-xs text-slate-400">{assignedLocations.length} Lokasi</span>
              </div>

              <div className="mt-3 space-y-2.5">
                {assignedLocations.length > 0 ? (
                  assignedLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-1 hover:border-indigo-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{loc.name}</span>
                        {loc.id === currentEmployee.primaryLocationId && (
                          <span className="rounded bg-indigo-100 text-indigo-700 px-1.5 py-0.5 text-[9px] font-bold">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px]">{loc.address}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Radius: {loc.radius} meter</span>
                        {loc.googleMapsUrl && (
                          <a
                            href={loc.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            Cek Maps
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                    Belum ditugaskan ke lokasi khusus. Anda bebas absen dari mana saja.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ABSENSI HARIAN SELURUH KARYAWAN (HRD & ATASAN)          */}
      {/* ============================================================== */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <input
                type="text"
                placeholder="Cari NIP / Nama karyawan..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none min-w-[200px]"
              />

              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="ALL">Semua Departemen</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick action: Mark all present */}
            {currentRole === 'hrd' && (
              <button
                onClick={markAllPresentToday}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition shrink-0"
              >
                <CheckCheck className="h-4 w-4" />
                Tandai Semua Hadir Hari Ini
              </button>
            )}
          </div>

          {/* Daily Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Karyawan</th>
                    <th className="px-4 py-3">Departemen</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Jam Masuk</th>
                    <th className="px-4 py-3">Jam Pulang</th>
                    <th className="px-4 py-3">Keterlambatan</th>
                    <th className="px-4 py-3">Lembur</th>
                    <th className="px-4 py-3">Lokasi / Verifikasi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees
                    .filter((emp) => {
                      if (filterDept !== 'ALL' && emp.departmentId !== filterDept) return false;
                      if (
                        searchEmployee &&
                        !emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) &&
                        !emp.nip.toLowerCase().includes(searchEmployee.toLowerCase())
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((emp) => {
                      const record = attendanceRecords.find(
                        (r) => r.employeeId === emp.id && r.date === selectedDate
                      );
                      const dept = departments.find((d) => d.id === emp.departmentId);

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="text-[11px] text-slate-400">{emp.nip}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{dept?.name || '-'}</td>
                          <td className="px-4 py-3">
                            {record ? (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  record.status === 'Hadir'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : record.status === 'WFH'
                                    ? 'bg-blue-100 text-blue-800'
                                    : record.status === 'Terlambat'
                                    ? 'bg-amber-100 text-amber-800'
                                    : record.status === 'Sakit'
                                    ? 'bg-sky-100 text-sky-800'
                                    : record.status === 'Cuti'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {record.status}
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">
                                Belum Absen
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">
                            {record?.clockInTime || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">
                            {record?.clockOutTime || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {record?.lateMinutes && record.lateMinutes > 0 ? (
                              <span className="text-amber-600 font-bold">
                                {record.lateMinutes} menit
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {record?.overtimeHours && record.overtimeHours > 0 ? (
                              <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.5 font-bold">
                                {record.overtimeHours} jam
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {record?.locationVerified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {record.distanceMeters !== undefined ? `${record.distanceMeters}m` : 'Terverifikasi'}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Manual / Belum</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {currentRole === 'hrd' && (
                              <button
                                onClick={() =>
                                  setEditingRecord({
                                    employeeId: emp.id,
                                    employeeName: emp.name,
                                    date: selectedDate,
                                    status: record?.status || 'Hadir',
                                    clockInTime: record?.clockInTime || '08:30:00',
                                    clockOutTime: record?.clockOutTime || '17:30:00',
                                    workLocationId: record?.workLocationId || locations[0]?.id,
                                    overtimeHours: record?.overtimeHours || 0,
                                    notes: record?.notes || '',
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </button>
                            )}
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

      {/* ============================================================== */}
      {/* TAB 3: REKAP BULANAN MATRIKS HARI 1–31                         */}
      {/* ============================================================== */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Header Selector & Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <select
                value={matrixMonth}
                onChange={(e) => setMatrixMonth(Number(e.target.value))}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Bulan {new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={matrixYear}
                onChange={(e) => setMatrixYear(Number(e.target.value))}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <button
              onClick={handleExportMatrix}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Ekspor Rekap Matriks (Excel .xlsx)
            </button>
          </div>

          {/* Matrix Legend */}
          <div className="flex flex-wrap gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700">Keterangan:</span>
            <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 font-bold">H: Hadir</span>
            <span className="rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 font-bold">W: WFH</span>
            <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 font-bold">T: Terlambat</span>
            <span className="rounded bg-sky-100 text-sky-800 px-1.5 py-0.5 font-bold">S: Sakit</span>
            <span className="rounded bg-purple-100 text-purple-800 px-1.5 py-0.5 font-bold">I: Izin</span>
            <span className="rounded bg-orange-100 text-orange-800 px-1.5 py-0.5 font-bold">C: Cuti</span>
            <span className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.5 font-bold">A: Alpha</span>
          </div>

          {/* Large Matrix Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-left min-w-[180px] bg-slate-100 sticky left-0 z-20 border-r border-slate-200">
                      Nama Karyawan
                    </th>
                    {matrixDays.map((d) => (
                      <th key={d} className="px-1.5 py-2 min-w-[28px] border-r border-slate-200">
                        {d}
                      </th>
                    ))}
                    <th className="px-2 py-2 min-w-[45px] bg-emerald-50 text-emerald-800 border-r border-slate-200">Hadir</th>
                    <th className="px-2 py-2 min-w-[45px] bg-blue-50 text-blue-800 border-r border-slate-200">WFH</th>
                    <th className="px-2 py-2 min-w-[45px] bg-orange-50 text-orange-800 border-r border-slate-200">Cuti</th>
                    <th className="px-2 py-2 min-w-[45px] bg-rose-50 text-rose-800 border-r border-slate-200">Alpha</th>
                    <th className="px-2 py-2 min-w-[50px] bg-indigo-50 text-indigo-800 border-r border-slate-200">Lembur</th>
                    <th className="px-3 py-2 min-w-[65px] bg-slate-200 text-slate-800">% Hadir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    let totalHadir = 0;
                    let totalWfh = 0;
                    let totalCuti = 0;
                    let totalAlpha = 0;
                    let totalLembur = 0;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 transition">
                        <td className="px-3 py-2 text-left font-semibold text-slate-900 sticky left-0 bg-white hover:bg-slate-50 border-r border-slate-200 truncate max-w-[200px]">
                          {emp.name}
                          <div className="text-[10px] text-slate-400 font-normal">{emp.nip}</div>
                        </td>

                        {matrixDays.map((d) => {
                          const dateStr = `${matrixYear}-${String(matrixMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const att = attendanceRecords.find((a) => a.employeeId === emp.id && a.date === dateStr);

                          let pill = <span className="text-slate-300">-</span>;
                          if (att) {
                            if (att.status === 'Hadir') {
                              totalHadir++;
                              pill = <span className="text-emerald-700 font-bold">H</span>;
                            } else if (att.status === 'Terlambat') {
                              totalHadir++;
                              pill = <span className="text-amber-700 font-bold">T</span>;
                            } else if (att.status === 'WFH') {
                              totalWfh++;
                              pill = <span className="text-blue-700 font-bold">W</span>;
                            } else if (att.status === 'Sakit') {
                              pill = <span className="text-sky-700 font-bold">S</span>;
                            } else if (att.status === 'Izin') {
                              pill = <span className="text-purple-700 font-bold">I</span>;
                            } else if (att.status === 'Cuti') {
                              totalCuti++;
                              pill = <span className="text-orange-700 font-bold">C</span>;
                            } else if (att.status === 'Alpha') {
                              totalAlpha++;
                              pill = <span className="text-rose-700 font-bold">A</span>;
                            }
                            totalLembur += att.overtimeHours || 0;
                          }

                          return (
                            <td key={d} className="px-1 py-1 border-r border-slate-100">
                              {pill}
                            </td>
                          );
                        })}

                        <td className="px-2 py-2 font-bold text-emerald-700 bg-emerald-50/50 border-r border-slate-200">
                          {totalHadir}
                        </td>
                        <td className="px-2 py-2 font-bold text-blue-700 bg-blue-50/50 border-r border-slate-200">
                          {totalWfh}
                        </td>
                        <td className="px-2 py-2 font-bold text-orange-700 bg-orange-50/50 border-r border-slate-200">
                          {totalCuti}
                        </td>
                        <td className="px-2 py-2 font-bold text-rose-700 bg-rose-50/50 border-r border-slate-200">
                          {totalAlpha}
                        </td>
                        <td className="px-2 py-2 font-bold text-indigo-700 bg-indigo-50/50 border-r border-slate-200">
                          {totalLembur}j
                        </td>
                        <td className="px-2 py-2 font-bold text-slate-800 bg-slate-100">
                          {(((totalHadir + totalWfh) / 22) * 100).toFixed(0)}%
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

      {/* Manual Attendance Correction Modal (HRD) */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Koreksi Manual Absensi</h3>
                <p className="text-xs text-slate-500">
                  {editingRecord.employeeName} • {editingRecord.date}
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Status Kehadiran</label>
                <select
                  value={editingRecord.status}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, status: e.target.value as AttendanceStatus })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="WFH">WFH</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Alpha">Alpha</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Jam Masuk</label>
                  <input
                    type="time"
                    step="1"
                    value={editingRecord.clockInTime || ''}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, clockInTime: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Jam Pulang</label>
                  <input
                    type="time"
                    step="1"
                    value={editingRecord.clockOutTime || ''}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, clockOutTime: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Lokasi Kerja</label>
                  <select
                    value={editingRecord.workLocationId || ''}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, workLocationId: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Jam Lembur Disetujui</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="12"
                    value={editingRecord.overtimeHours || 0}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, overtimeHours: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Catatan Koreksi</label>
                <input
                  type="text"
                  placeholder="Contoh: Koreksi absensi karena penugasan lapangan"
                  value={editingRecord.notes || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingRecord(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  upsertAttendanceRecord(editingRecord);
                  setEditingRecord(null);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
              >
                Simpan Koreksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
