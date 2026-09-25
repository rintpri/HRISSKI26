import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import {
  downloadEmployeeTemplate,
  parseEmployeeExcelFile,
  executeEmployeeImport,
  ParsedEmployeeRow,
  ImportOptions,
} from '../../utils/excelImport';
import {
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

interface EmployeeImportModalProps {
  onClose: () => void;
}

export const EmployeeImportModal: React.FC<EmployeeImportModalProps> = ({ onClose }) => {
  const {
    employees,
    departments,
    positions,
    locations,
    applyImportedBatch,
  } = useHRIS();

  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Configurable Import Options
  const [options, setOptions] = useState<ImportOptions>({
    duplicateAction: 'update',
    createLoginAccount: true,
    defaultPassword: 'password123',
    grantLeaveQuota: true,
    createSalaryHistory: true,
    autoCreateDeptPosition: true,
    promoteSupervisorsToManager: true,
    defaultWorkLocationId: locations[0]?.id,
  });

  const [importSummary, setImportSummary] = useState<{
    created: number;
    updated: number;
    newDepts: number;
    newPositions: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const rows = parseEmployeeExcelFile(buffer);
        if (rows.length === 0) {
          setErrorMessage('Berkas tidak memiliki baris data yang valid atau format tidak terbaca.');
          return;
        }
        setParsedRows(rows);
        setStep('preview');
      } catch (err: any) {
        setErrorMessage(`Gagal membaca file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada baris data valid untuk diimpor.');
      return;
    }

    const initialDeptCount = departments.length;
    const initialPosCount = positions.length;

    const result = executeEmployeeImport(
      parsedRows,
      options,
      employees,
      departments,
      positions,
      locations
    );

    applyImportedBatch(result);

    setImportSummary({
      created: result.createdEmployees.length,
      updated: result.updatedEmployees.length,
      newDepts: result.newDepartments.length - initialDeptCount,
      newPositions: result.newPositions.length - initialPosCount,
    });

    setStep('success');
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Impor Data Karyawan via Excel (.xlsx / .csv)
              </h3>
              <p className="text-xs text-slate-500">
                Migrasi data cepat dengan pencocokan kolom cerdas dan pembuatan otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* STEP 1: UPLOAD & TEMPLATE */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Template Download Banner */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Unduh Template Resmi Database Karyawan
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 max-w-lg leading-relaxed">
                    Template sudah dilengkapi kolom identitas, kepegawaian, tarif transport & makan harian,
                    serta format gaji otomatis. Urutan kolom fleksibel dan mengenali variasi nama kolom.
                  </p>
                </div>
                <button
                  onClick={downloadEmployeeTemplate}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Unduh Template (.xlsx)
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                <UploadCloud className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">Pilih Berkas Excel atau CSV Anda</h4>
                <p className="text-xs text-slate-500 mt-1">Mendukung format .xlsx, .xls, atau .csv</p>

                <label className="mt-4 inline-block cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition">
                  Pilih File Dari Komputer
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {errorMessage && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & CONFIGURE OPTIONS */}
          {step === 'preview' && (
            <div className="space-y-6">
              {/* File Info & Diagnostics Stats */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Berkas Terpilih:</span>
                  <span className="font-bold text-slate-900 ml-1.5">{fileName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-1 font-bold">
                    ✓ {validCount} Baris Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="rounded-lg bg-rose-100 text-rose-800 px-2.5 py-1 font-bold">
                      ✕ {invalidCount} Tidak Lengkap
                    </span>
                  )}
                </div>
              </div>

              {/* Import Options Toggle Box */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3 text-xs">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5 text-sm">
                  <Settings className="h-4 w-4 text-indigo-600" />
                  Opsi & Pengaturan Impor Otomatis:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={options.duplicateAction === 'update'}
                      onChange={(e) =>
                        setOptions({ ...options, duplicateAction: e.target.checked ? 'update' : 'skip' })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Perbarui jika NIP/Email sudah ada</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={options.createLoginAccount}
                      onChange={(e) =>
                        setOptions({ ...options, createLoginAccount: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Buat Akun Login & Password Awal</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={options.grantLeaveQuota}
                      onChange={(e) =>
                        setOptions({ ...options, grantLeaveQuota: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Beri Saldo Cuti (12 Hari)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={options.autoCreateDeptPosition}
                      onChange={(e) =>
                        setOptions({ ...options, autoCreateDeptPosition: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Buat Dept/Jabatan jika belum ada</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={options.promoteSupervisorsToManager}
                      onChange={(e) =>
                        setOptions({ ...options, promoteSupervisorsToManager: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Naikkan peran jadi Atasan bagi NIP atasan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={options.createSalaryHistory}
                      onChange={(e) =>
                        setOptions({ ...options, createSalaryHistory: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    <span>Catat Riwayat Gaji & Kontrak Awal</span>
                  </label>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-12">No</th>
                        <th className="px-3 py-2">Nama Lengkap</th>
                        <th className="px-3 py-2">NIP</th>
                        <th className="px-3 py-2">Departemen</th>
                        <th className="px-3 py-2">Jabatan</th>
                        <th className="px-3 py-2">Gaji Pokok</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}
                        >
                          <td className="px-3 py-2 font-mono text-slate-400">{row.rowNumber}</td>
                          <td className="px-3 py-2 font-bold text-slate-900">{row.name}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">
                            {row.nip || <span className="text-indigo-600 italic">Auto</span>}
                          </td>
                          <td className="px-3 py-2 text-slate-700">{row.deptCodeOrName || '-'}</td>
                          <td className="px-3 py-2 text-slate-700">{row.positionCodeOrName || '-'}</td>
                          <td className="px-3 py-2 font-medium">
                            Rp {row.baseSalary.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                                <XCircle className="h-3.5 w-3.5" />
                                {row.errors.join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  ← Ganti Berkas
                </button>

                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
                >
                  <Sparkles className="h-4 w-4" />
                  Mulai Eksekusi Impor ({validCount} Karyawan)
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && importSummary && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Migrasi Data Karyawan Berhasil!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Data karyawan beserta akun login, saldo cuti, kontrak, riwayat gaji, dan penugasan lokasi telah
                terbuat secara otomatis di dalam sistem.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Karyawan Baru</span>
                  <span className="text-lg font-bold text-emerald-600">+{importSummary.created}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Diperbarui</span>
                  <span className="text-lg font-bold text-indigo-600">{importSummary.updated}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dept Baru</span>
                  <span className="text-lg font-bold text-slate-800">+{importSummary.newDepts}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Jabatan Baru</span>
                  <span className="text-lg font-bold text-slate-800">+{importSummary.newPositions}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
