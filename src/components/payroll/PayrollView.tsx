import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { Payslip } from '../../types/hris';
import { formatRupiah } from '../../utils/payrollCalculator';
import { PayslipModal } from './PayslipModal';
import {
  Banknote,
  Calculator,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Edit,
  TrendingUp,
  CreditCard,
  Shield,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface PayrollViewProps {
  initialSubTab?: 'payroll' | 'myslip' | 'components';
}

export const PayrollView: React.FC<PayrollViewProps> = ({ initialSubTab = 'payroll' }) => {
  const {
    payrollPeriods,
    payslips,
    generateMonthlyPayroll,
    markPayrollPaid,
    updatePayslipOverrides,
    employees,
    positions,
    company,
    currentEmployee,
    currentRole,
    exportToCsvOrExcel,
  } = useHRIS();

  const [activeTab, setActiveTab] = useState<'payroll' | 'myslip' | 'components'>(initialSubTab);

  // Month & Year Selector
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchEmployee, setSearchEmployee] = useState('');

  // Selected Payslip for Modal Preview
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);

  // Edit Overrides Modal State
  const [editingPayslip, setEditingPayslip] = useState<{
    id: string;
    name: string;
    bonus: number;
    loan: number;
    coop: number;
  } | null>(null);

  const currentPeriodId = `prd-${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const currentPeriod = payrollPeriods.find((p) => p.id === currentPeriodId);
  const currentPayslips = payslips.filter((s) => s.periodId === currentPeriodId);

  // Handle Generate
  const handleGenerate = () => {
    generateMonthlyPayroll(selectedMonth, selectedYear);
  };

  // Handle Mark Paid
  const handleMarkPaid = () => {
    if (confirm(`Tandai seluruh gaji periode ${selectedMonth}/${selectedYear} sebagai LUNAS/DIBAYARKAN?`)) {
      markPayrollPaid(currentPeriodId);
    }
  };

  // Export to Excel/CSV
  const handleExportPayroll = (format: 'xlsx' | 'csv' = 'xlsx') => {
    const data = currentPayslips.map((p) => ({
      NIP: p.nip,
      'Nama Karyawan': p.employeeName,
      Jabatan: p.positionTitle,
      'Hari Hadir Kantor': p.officeWorkDays,
      'Hari WFH': p.wfhWorkDays,
      'Jam Lembur': p.overtimeHours,
      'Gaji Pokok': p.baseSalary,
      'Tunjangan Jabatan': p.jobAllowance,
      'Tunjangan Transport': p.transportAllowance,
      'Tunjangan Makan': p.mealAllowance,
      'Upah Lembur': p.overtimePay,
      'Bonus Insentif': p.performanceBonus,
      'Penghasilan Bruto': p.grossIncome,
      'BPJS Kesehatan (1%)': p.bpjsKesEmployee,
      'BPJS TK JHT (2%)': p.bpjsTkJhtEmployee,
      'PPh 21': p.pph21,
      'Potongan Alpha': p.alphaDeduction,
      'Pinjaman / Kasbon': p.loanDeduction,
      'Iuran Koperasi': p.cooperativeDeduction,
      'Total Potongan': p.totalDeductions,
      'Gaji Bersih (Netto)': p.netSalary,
      'BPJS Kes Perusahaan (4%)': p.bpjsKesCompany,
      'BPJS TK Perusahaan': p.bpjsTkJhtCompany + p.bpjsTkJkkCompany + p.bpjsTkJkmCompany,
      Status: p.status,
    }));

    exportToCsvOrExcel(`Payroll_${selectedYear}_${selectedMonth}`, data, format);
  };

  // Payslip of current user for "Slip Gaji Saya"
  const myPayslip = payslips.find((s) => s.employeeId === currentEmployee.id) || currentPayslips.find((s) => s.employeeId === currentEmployee.id);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sistem Penggajian & Payroll Karyawan
          </h1>
          <p className="text-sm text-slate-500">
            Kalkulasi gaji otomatis: tunjangan kehadiran, lembur 1.5×, BPJS Kesehatan & TK, serta PPh 21 TER UU HPP.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          {currentRole === 'hrd' && (
            <button
              onClick={() => setActiveTab('payroll')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'payroll'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Penggajian Bulanan
            </button>
          )}
          <button
            onClick={() => setActiveTab('myslip')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'myslip'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Slip Gaji Saya
          </button>
          {currentRole === 'hrd' && (
            <button
              onClick={() => setActiveTab('components')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'components'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Komponen & Pajak
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PENGGAJIAN BULANAN                                      */}
      {/* ============================================================== */}
      {activeTab === 'payroll' && currentRole === 'hrd' && (
        <div className="space-y-6">
          {/* Period Selector & Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Periode:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>

              {currentPeriod && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    currentPeriod.status === 'Dibayar'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status: {currentPeriod.status}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <Calculator className="h-4 w-4" />
                {currentPayslips.length > 0 ? 'Hitung Ulang Periode' : 'Generate Payroll Periode'}
              </button>

              {currentPayslips.length > 0 && currentPeriod?.status !== 'Dibayar' && (
                <button
                  onClick={handleMarkPaid}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
                >
                  <CheckCircle className="h-4 w-4" />
                  Tandai Dibayar (Lunas)
                </button>
              )}

              {currentPayslips.length > 0 && (
                <button
                  onClick={() => handleExportPayroll('xlsx')}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  title="Ekspor ke Excel"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Ekspor Excel (.xlsx)
                </button>
              )}
            </div>
          </div>

          {/* Metric Summary Cards */}
          {currentPeriod && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">Total Penghasilan Bruto</span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {formatRupiah(currentPeriod.totalGross)}
                </div>
                <span className="text-[10px] text-slate-500">{currentPeriod.employeeCount} Karyawan</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">Total Potongan (BPJS + PPh)</span>
                <div className="text-xl font-bold text-rose-600 mt-1">
                  {formatRupiah(currentPeriod.totalDeductions)}
                </div>
                <span className="text-[10px] text-slate-500">Iuran BPJS & Pajak PPh 21</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
                <span className="text-[11px] font-bold uppercase text-indigo-700">Total Gaji Bersih (Netto)</span>
                <div className="text-xl font-black text-indigo-900 mt-1">
                  {formatRupiah(currentPeriod.totalNet)}
                </div>
                <span className="text-[10px] text-indigo-600">Total Take Home Pay Dikeluarkan</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">Hari Kerja Standar</span>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {currentPeriod.workingDaysCount} Hari Kerja
                </div>
                <span className="text-[10px] text-slate-500">Basis perhitungan uang transport/makan</span>
              </div>
            </div>
          )}

          {/* Payslips Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Daftar Slip Gaji Karyawan Periode Ini</h3>
              <input
                type="text"
                placeholder="Cari NIP / Nama..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs w-56"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Karyawan</th>
                    <th className="px-4 py-3">Gaji Pokok</th>
                    <th className="px-4 py-3">Tunj. Transport (Hari × Tarif)</th>
                    <th className="px-4 py-3">Tunj. Makan (Hari × Tarif)</th>
                    <th className="px-4 py-3">Upah Lembur</th>
                    <th className="px-4 py-3">Bruto</th>
                    <th className="px-4 py-3">Potongan</th>
                    <th className="px-4 py-3">Netto (THP)</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentPayslips
                    .filter((p) => {
                      if (
                        searchEmployee &&
                        !p.employeeName.toLowerCase().includes(searchEmployee.toLowerCase()) &&
                        !p.nip.toLowerCase().includes(searchEmployee.toLowerCase())
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((payslip) => (
                      <tr key={payslip.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{payslip.employeeName}</div>
                          <div className="text-[11px] text-slate-400">
                            {payslip.nip} • {payslip.positionTitle}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {formatRupiah(payslip.baseSalary)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {formatRupiah(payslip.transportAllowance)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {payslip.officeWorkDays} hari × {formatRupiah(payslip.dailyTransportRate)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {formatRupiah(payslip.mealAllowance)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {payslip.totalPresentDays} hari × {formatRupiah(payslip.dailyMealRate)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {payslip.overtimePay > 0 ? (
                            <span className="font-semibold text-indigo-700">
                              {formatRupiah(payslip.overtimePay)} ({payslip.overtimeHours}j)
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {formatRupiah(payslip.grossIncome)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-rose-600">
                          -{formatRupiah(payslip.totalDeductions)}
                        </td>
                        <td className="px-4 py-3 font-black text-indigo-900">
                          {formatRupiah(payslip.netSalary)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                setEditingPayslip({
                                  id: payslip.id,
                                  name: payslip.employeeName,
                                  bonus: payslip.performanceBonus,
                                  loan: payslip.loanDeduction,
                                  coop: payslip.cooperativeDeduction,
                                })
                              }
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 transition"
                              title="Ubah Bonus / Potongan Khusus"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setViewingPayslip(payslip)}
                              className="rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition flex items-center gap-1"
                            >
                              <Printer className="h-3 w-3" />
                              Lihat Slip
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {currentPayslips.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400 space-y-3">
                  <p>Periode ini belum dihitung.</p>
                  <button
                    onClick={handleGenerate}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Kalkulasi Payroll Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SLIP GAJI SAYA (SELF SERVICE PORTAL)                    */}
      {/* ============================================================== */}
      {activeTab === 'myslip' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Portal Slip Gaji Mandiri</h3>
              <p className="text-xs text-slate-500">
                Akses slip gaji resmi Anda ({currentEmployee.name} - {currentEmployee.nip}). Siap cetak atau diunduh sebagai PDF.
              </p>
            </div>

            {myPayslip && (
              <button
                onClick={() => setViewingPayslip(myPayslip)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <Printer className="h-4 w-4" />
                Cetak Slip Gaji Bulan Ini
              </button>
            )}
          </div>

          {myPayslip ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Summary Card */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 shadow-md space-y-4">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Gaji Bersih Diterima (THP)
                </span>
                <div className="text-3xl font-black font-mono text-emerald-400">
                  {formatRupiah(myPayslip.netSalary)}
                </div>
                <div className="text-xs text-slate-300 border-t border-white/10 pt-3 space-y-1">
                  <div>Rekening: {myPayslip.bankName} - {myPayslip.bankAccountNumber}</div>
                  <div>Kehadiran: {myPayslip.officeWorkDays} Hadir Kantor, {myPayslip.wfhWorkDays} WFH</div>
                  <div>Status: {myPayslip.status}</div>
                </div>
              </div>

              {/* Rincian Ringkas Card */}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Rincian Komponen Gaji Periode Berjalan
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="font-bold text-slate-700">Penerimaan:</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gaji Pokok</span>
                      <span className="font-semibold">{formatRupiah(myPayslip.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunjangan Transport</span>
                      <span className="font-semibold">{formatRupiah(myPayslip.transportAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunjangan Makan</span>
                      <span className="font-semibold">{formatRupiah(myPayslip.mealAllowance)}</span>
                    </div>
                    {myPayslip.overtimePay > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Upah Lembur</span>
                        <span className="font-semibold">{formatRupiah(myPayslip.overtimePay)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="font-bold text-slate-700">Potongan:</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">BPJS Kesehatan (1%)</span>
                      <span className="font-semibold text-rose-600">-{formatRupiah(myPayslip.bpjsKesEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">BPJS Ketenagakerjaan (2%)</span>
                      <span className="font-semibold text-rose-600">-{formatRupiah(myPayslip.bpjsTkJhtEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">PPh 21 Progresif</span>
                      <span className="font-semibold text-rose-600">-{formatRupiah(myPayslip.pph21)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              Belum ada data slip gaji terbit untuk akun Anda pada periode ini.
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MASTER KOMPONEN & TARIF PAJAK                           */}
      {/* ============================================================== */}
      {activeTab === 'components' && currentRole === 'hrd' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BPJS & PPh21 Rules */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" />
              Ketentuan Pajak PPh 21 (TER UU HPP) & BPJS
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">BPJS Kesehatan:</span>
                <p>Karyawan: 1% • Perusahaan: 4% • Plafon Dasar Gaji Maksimal: Rp 12.000.000</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">BPJS Ketenagakerjaan:</span>
                <p>JHT Karyawan: 2% • JHT Perusahaan: 3.7%</p>
                <p>JKK Perusahaan: 0.24% • JKM Perusahaan: 0.30%</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">Pajak Penghasilan (PPh 21):</span>
                <p>Dihitung menggunakan skema Tarif Efektif Rata-Rata (TER) PP 58/2023.</p>
                <p className="text-rose-600 font-semibold">
                  * Karyawan tanpa NPWP dikenakan tarif lebih tinggi 20% (+20%).
                </p>
              </div>
            </div>
          </div>

          {/* Tunjangan per Jabatan Simulation */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Simulasi Tunjangan Transport & Makan per Jabatan
            </h3>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-3 py-2">Jabatan</th>
                    <th className="px-3 py-2">Transport/Hari</th>
                    <th className="px-3 py-2">Makan/Hari</th>
                    <th className="px-3 py-2">Est. Biaya (22 Hari)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {positions.map((p) => {
                    const est = (p.dailyTransport + p.dailyMeal) * 22;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-800">{p.title}</td>
                        <td className="px-3 py-2 text-slate-600">{formatRupiah(p.dailyTransport)}</td>
                        <td className="px-3 py-2 text-slate-600">{formatRupiah(p.dailyMeal)}</td>
                        <td className="px-3 py-2 font-bold text-indigo-700">{formatRupiah(est)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Print Modal */}
      {viewingPayslip && (
        <PayslipModal
          payslip={viewingPayslip}
          company={company}
          onClose={() => setViewingPayslip(null)}
        />
      )}

      {/* Edit Overrides Modal */}
      {editingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Ubah Penyesuaian Gaji</h3>
              <p className="text-xs text-slate-500">{editingPayslip.name}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Bonus Insentif / Prestasi (Rp)</label>
                <input
                  type="number"
                  step="50000"
                  value={editingPayslip.bonus}
                  onChange={(e) =>
                    setEditingPayslip({ ...editingPayslip, bonus: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Potongan Pinjaman / Kasbon (Rp)</label>
                <input
                  type="number"
                  step="50000"
                  value={editingPayslip.loan}
                  onChange={(e) =>
                    setEditingPayslip({ ...editingPayslip, loan: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Iuran Koperasi (Rp)</label>
                <input
                  type="number"
                  step="10000"
                  value={editingPayslip.coop}
                  onChange={(e) =>
                    setEditingPayslip({ ...editingPayslip, coop: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingPayslip(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updatePayslipOverrides(
                    editingPayslip.id,
                    editingPayslip.bonus,
                    editingPayslip.loan,
                    editingPayslip.coop
                  );
                  setEditingPayslip(null);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
