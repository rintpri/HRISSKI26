import React from 'react';
import { Payslip, CompanyProfile } from '../../types/hris';
import { formatRupiah } from '../../utils/payrollCalculator';
import { Printer, Download, CheckCircle, ShieldCheck, X } from 'lucide-react';

interface PayslipModalProps {
  payslip: Payslip;
  company: CompanyProfile;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, company, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const transportLabel = `Tunjangan Transport (${payslip.officeWorkDays} hari × ${formatRupiah(payslip.dailyTransportRate)})`;
  const mealLabel = `Tunjangan Makan (${payslip.totalPresentDays} hari × ${formatRupiah(payslip.dailyMealRate)})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 print:hidden">
          <span className="text-xs font-bold text-slate-700">Pratinjau Slip Gaji Resmi</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Sheet */}
        <div id="payslip-sheet" className="p-8 sm:p-10 space-y-6 text-slate-800 text-xs">
          {/* Company Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-5 gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {company.name}
              </h2>
              <p className="text-[11px] text-slate-500 max-w-md mt-0.5 leading-snug">{company.address}</p>
              <p className="text-[11px] text-slate-500">
                NPWP: {company.npwp} • Telp: {company.phone} • Email: {company.email}
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
              <div className="text-base font-extrabold text-indigo-900 uppercase tracking-wider">
                SLIP GAJI KARYAWAN
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">
                Periode: {payslip.periodId.replace('prd-', '')}
              </div>
              <div className="mt-1 inline-block rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold border border-emerald-300">
                STATUS: {payslip.status === 'Dibayar' ? 'LUNAS / DIBAYARKAN' : 'DRAFT KALKULASI'}
              </div>
            </div>
          </div>

          {/* Employee & Bank Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">NIP</span>
              <p className="font-mono font-bold text-slate-900">{payslip.nip}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap</span>
              <p className="font-bold text-slate-900">{payslip.employeeName}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Jabatan</span>
              <p className="font-medium text-slate-800">{payslip.positionTitle}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Departemen</span>
              <p className="font-medium text-slate-800">{payslip.departmentName}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Rekening Pembayaran</span>
              <p className="font-medium text-slate-800">
                {payslip.bankName} - {payslip.bankAccountNumber}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Status PTKP / NPWP</span>
              <p className="font-medium text-slate-800">
                {payslip.ptkpStatus} • {payslip.hasNpwp ? 'NPWP Terdaftar' : 'Non-NPWP (+20%)'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Kehadiran (Kantor/WFH)</span>
              <p className="font-bold text-indigo-700">
                {payslip.officeWorkDays} Kantor / {payslip.wfhWorkDays} WFH
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Lembur / Alpha</span>
              <p className="font-medium text-slate-800">
                {payslip.overtimeHours} Jam / {payslip.alphaDays} Hari
              </p>
            </div>
          </div>

          {/* Earnings & Deductions Tables Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings (Penerimaan) */}
            <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                I. PENERIMAAN (EARNINGS)
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Gaji Pokok</span>
                  <span className="font-semibold">{formatRupiah(payslip.baseSalary)}</span>
                </div>
                {payslip.jobAllowance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tunjangan Jabatan</span>
                    <span className="font-semibold">{formatRupiah(payslip.jobAllowance)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600 truncate max-w-[200px]" title={transportLabel}>
                    {transportLabel}
                  </span>
                  <span className="font-semibold">{formatRupiah(payslip.transportAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 truncate max-w-[200px]" title={mealLabel}>
                    {mealLabel}
                  </span>
                  <span className="font-semibold">{formatRupiah(payslip.mealAllowance)}</span>
                </div>
                {payslip.overtimePay > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Upah Lembur ({payslip.overtimeHours} jam × 1.5× rate)
                    </span>
                    <span className="font-semibold">{formatRupiah(payslip.overtimePay)}</span>
                  </div>
                )}
                {payslip.performanceBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bonus Insentif / Prestasi</span>
                    <span className="font-semibold">{formatRupiah(payslip.performanceBonus)}</span>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900 border-t border-slate-200 flex justify-between">
                <span>Total Penerimaan Bruto</span>
                <span className="text-indigo-700">{formatRupiah(payslip.grossIncome)}</span>
              </div>
            </div>

            {/* Deductions (Potongan) */}
            <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                II. POTONGAN (DEDUCTIONS)
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">BPJS Kesehatan (1% Karyawan)</span>
                  <span className="font-semibold">{formatRupiah(payslip.bpjsKesEmployee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">BPJS Ketenagakerjaan JHT (2%)</span>
                  <span className="font-semibold">{formatRupiah(payslip.bpjsTkJhtEmployee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    PPh 21 Progresif {payslip.hasNpwp ? '' : '(+20% Non-NPWP)'}
                  </span>
                  <span className="font-semibold">{formatRupiah(payslip.pph21)}</span>
                </div>
                {payslip.alphaDeduction > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Potongan Alpha ({payslip.alphaDays} hari)</span>
                    <span className="font-semibold">-{formatRupiah(payslip.alphaDeduction)}</span>
                  </div>
                )}
                {payslip.loanDeduction > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Cicilan Pinjaman / Kasbon</span>
                    <span className="font-semibold">-{formatRupiah(payslip.loanDeduction)}</span>
                  </div>
                )}
                {payslip.cooperativeDeduction > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Iuran Koperasi</span>
                    <span className="font-semibold">-{formatRupiah(payslip.cooperativeDeduction)}</span>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900 border-t border-slate-200 flex justify-between">
                <span>Total Potongan</span>
                <span className="text-rose-600">{formatRupiah(payslip.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* NET SALARY HIGHLIGHT (TAKE HOME PAY) */}
          <div className="rounded-2xl bg-indigo-900 text-white p-5 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md">
            <div>
              <div className="text-xs uppercase font-bold text-indigo-300">
                PENGHASILAN BERSIH (TAKE HOME PAY)
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Ditransfer ke rekening {payslip.bankName} {payslip.bankAccountNumber} a/n {payslip.employeeName}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {formatRupiah(payslip.netSalary)}
            </div>
          </div>

          {/* Company-Borne Benefits (Informatif BPJS Ditanggung Perusahaan) */}
          <div className="rounded-xl border border-dashed border-slate-300 p-3 bg-slate-50/50 text-[11px] text-slate-500">
            <span className="font-bold text-slate-700 block mb-1">
              * Manfaat Iuran Ditanggung Perusahaan (Informatif di luar gaji pokok):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>BPJS Kes Perusahaan (4%): {formatRupiah(payslip.bpjsKesCompany)}</div>
              <div>BPJS TK JHT (3.7%): {formatRupiah(payslip.bpjsTkJhtCompany)}</div>
              <div>BPJS TK JKK (0.24%): {formatRupiah(payslip.bpjsTkJkkCompany)}</div>
              <div>BPJS TK JKM (0.3%): {formatRupiah(payslip.bpjsTkJkmCompany)}</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 pt-8 text-center text-xs">
            <div className="space-y-12">
              <p className="text-slate-500">Diterima oleh Karyawan,</p>
              <div>
                <p className="font-bold text-slate-900 underline">{payslip.employeeName}</p>
                <p className="text-[10px] text-slate-400">NIP: {payslip.nip}</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="text-slate-500">Disahkan oleh Tim Keuangan & HRD,</p>
              <div>
                <p className="font-bold text-slate-900 underline">{company.payrollSignerName}</p>
                <p className="text-[10px] text-slate-400">{company.payrollSignerPosition}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
