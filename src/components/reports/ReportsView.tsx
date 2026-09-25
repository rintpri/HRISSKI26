import React from 'react';
import { useHRIS } from '../../context/HRISContext';
import { formatRupiah } from '../../utils/payrollCalculator';
import {
  BarChart3,
  PieChart,
  Printer,
  Download,
  Users,
  Building,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    employees,
    departments,
    positions,
    attendanceRecords,
    payrollPeriods,
    payslips,
    applicants,
    company,
    exportToCsvOrExcel,
  } = useHRIS();

  // Demographics Calculation
  const maleCount = employees.filter((e) => e.gender === 'L').length;
  const femaleCount = employees.filter((e) => e.gender === 'P').length;

  const pkwttCount = employees.filter((e) => e.employmentStatus === 'PKWTT').length;
  const pkwtCount = employees.filter((e) => e.employmentStatus === 'PKWT').length;

  // Department Cost Analysis (accurate monthly allowance and salary breakdown)
  const deptCostAnalysis = departments.map((dept) => {
    const deptEmps = employees.filter((e) => e.departmentId === dept.id);
    const count = deptEmps.length;

    let baseSalaryTotal = 0;
    let jobAllowanceTotal = 0;
    let transportAllowanceMonthly = 0;
    let mealAllowanceMonthly = 0;

    deptEmps.forEach((emp) => {
      const pos = positions.find((p) => p.id === emp.positionId);
      baseSalaryTotal += emp.baseSalary;
      jobAllowanceTotal += emp.customJobAllowance ?? pos?.allowanceJob ?? 0;

      const dailyTransport = emp.customDailyTransport ?? pos?.dailyTransport ?? 35000;
      const dailyMeal = emp.customDailyMeal ?? pos?.dailyMeal ?? 30000;

      // 22 working days simulation
      transportAllowanceMonthly += dailyTransport * 22;
      mealAllowanceMonthly += dailyMeal * 22;
    });

    const totalEstMonthly =
      baseSalaryTotal + jobAllowanceTotal + transportAllowanceMonthly + mealAllowanceMonthly;

    return {
      id: dept.id,
      name: dept.name,
      count,
      baseSalaryTotal,
      jobAllowanceTotal,
      transportAllowanceMonthly,
      mealAllowanceMonthly,
      totalEstMonthly,
    };
  });

  const grandTotalMonthlySDM = deptCostAnalysis.reduce((acc, d) => acc + d.totalEstMonthly, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportReportExcel = () => {
    const data = deptCostAnalysis.map((d) => ({
      Departemen: d.name,
      'Jumlah Karyawan': d.count,
      'Total Gaji Pokok': d.baseSalaryTotal,
      'Total Tunjangan Jabatan': d.jobAllowanceTotal,
      'Est. Tunjangan Transport Bulanan': d.transportAllowanceMonthly,
      'Est. Tunjangan Makan Bulanan': d.mealAllowanceMonthly,
      'Total Estimasi Biaya SDM/Bulan': d.totalEstMonthly,
    }));

    exportToCsvOrExcel(`Laporan_Biaya_SDM_${new Date().toISOString().split('T')[0]}`, data, 'xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laporan Eksekutif & Analitik SDM
          </h1>
          <p className="text-sm text-slate-500">
            Demografi ketenagakerjaan, analisis komparasi biaya tunjangan & gaji per departemen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Ekspor Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
          >
            <Printer className="h-4 w-4" />
            Cetak Laporan Lengkap
          </button>
        </div>
      </div>

      {/* Demographic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Tenaga Kerja</span>
          <div className="text-2xl font-black text-slate-900">{employees.length} Orang</div>
          <div className="text-xs text-slate-500">
            Tetap (PKWTT): <strong>{pkwttCount}</strong> • Kontrak: <strong>{pkwtCount}</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400">Rasio Gender Karyawan</span>
          <div className="text-2xl font-black text-slate-900">
            {maleCount} Pria / {femaleCount} Wanita
          </div>
          <div className="text-xs text-slate-500">
            {((maleCount / employees.length) * 100).toFixed(0)}% Laki-laki •{' '}
            {((femaleCount / employees.length) * 100).toFixed(0)}% Perempuan
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400">Estimasi Total Biaya SDM/Bulan</span>
          <div className="text-2xl font-black text-indigo-700">
            {formatRupiah(grandTotalMonthlySDM)}
          </div>
          <div className="text-xs text-slate-500">Gaji Pokok + Tunjangan Harian (22 Hari)</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase text-slate-400">Pipeline Rekrutmen</span>
          <div className="text-2xl font-black text-slate-900">{applicants.length} Kandidat</div>
          <div className="text-xs text-slate-500">
            Offering: <strong>{applicants.filter((a) => a.stage === 'Offering').length}</strong> • Hired:{' '}
            <strong>{applicants.filter((a) => a.stage === 'Hired').length}</strong>
          </div>
        </div>
      </div>

      {/* Department SDM & Allowance Cost Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-2">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Analisis Biaya SDM, Gaji Pokok & Tunjangan Harian per Departemen
            </h3>
            <p className="text-xs text-slate-500">
              Rincian simulasi anggaran bulanan untuk uang makan & transport sesuai absensi kehadiran.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Departemen</th>
                <th className="px-4 py-3">Jumlah Personel</th>
                <th className="px-4 py-3">Gaji Pokok</th>
                <th className="px-4 py-3">Tunj. Jabatan</th>
                <th className="px-4 py-3">Tunj. Transport (22 Hari)</th>
                <th className="px-4 py-3">Tunj. Makan (22 Hari)</th>
                <th className="px-4 py-3 font-bold text-indigo-900">Total Biaya Bulanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptCostAnalysis.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-bold text-slate-900">{d.name}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{d.count} orang</td>
                  <td className="px-4 py-3 text-slate-800">{formatRupiah(d.baseSalaryTotal)}</td>
                  <td className="px-4 py-3 text-slate-800">{formatRupiah(d.jobAllowanceTotal)}</td>
                  <td className="px-4 py-3 text-slate-800">{formatRupiah(d.transportAllowanceMonthly)}</td>
                  <td className="px-4 py-3 text-slate-800">{formatRupiah(d.mealAllowanceMonthly)}</td>
                  <td className="px-4 py-3 font-bold text-indigo-700 text-sm">
                    {formatRupiah(d.totalEstMonthly)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td className="px-4 py-3">TOTAL KESELURUHAN</td>
                <td className="px-4 py-3">{employees.length} orang</td>
                <td className="px-4 py-3">
                  {formatRupiah(deptCostAnalysis.reduce((acc, d) => acc + d.baseSalaryTotal, 0))}
                </td>
                <td className="px-4 py-3">
                  {formatRupiah(deptCostAnalysis.reduce((acc, d) => acc + d.jobAllowanceTotal, 0))}
                </td>
                <td className="px-4 py-3">
                  {formatRupiah(deptCostAnalysis.reduce((acc, d) => acc + d.transportAllowanceMonthly, 0))}
                </td>
                <td className="px-4 py-3">
                  {formatRupiah(deptCostAnalysis.reduce((acc, d) => acc + d.mealAllowanceMonthly, 0))}
                </td>
                <td className="px-4 py-3 font-black text-indigo-900 text-sm">
                  {formatRupiah(grandTotalMonthlySDM)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
