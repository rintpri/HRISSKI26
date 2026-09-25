import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { Employee } from '../../types/hris';
import { formatRupiah } from '../../utils/payrollCalculator';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeImportModal } from './EmployeeImportModal';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building,
} from 'lucide-react';

export const EmployeeList: React.FC = () => {
  const {
    employees,
    departments,
    positions,
    locations,
    deleteEmployee,
    currentRole,
    exportToCsvOrExcel,
  } = useHRIS();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [formEmployee, setFormEmployee] = useState<Employee | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    if (selectedDept !== 'ALL' && emp.departmentId !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && emp.employmentStatus !== selectedStatus) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(term);
      const matchNip = emp.nip.toLowerCase().includes(term);
      const matchEmail = emp.email.toLowerCase().includes(term);
      if (!matchName && !matchNip && !matchEmail) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportData = (format: 'xlsx' | 'csv' = 'xlsx') => {
    const data = filteredEmployees.map((e) => {
      const dept = departments.find((d) => d.id === e.departmentId);
      const pos = positions.find((p) => p.id === e.positionId);
      const loc = locations.find((l) => l.id === e.primaryLocationId);
      return {
        NIP: e.nip,
        'Nama Lengkap': e.name,
        NIK: e.nik,
        Email: e.email,
        'No Handphone': e.phone,
        Departemen: dept?.name || '-',
        Jabatan: pos?.title || '-',
        Grade: pos?.level || '-',
        'Atasan Langsung': e.managerNip || '-',
        'Status Kerja': e.employmentStatus,
        'Tanggal Masuk': e.joinDate,
        'Gaji Pokok': e.baseSalary,
        'Tunjangan Jabatan': e.customJobAllowance ?? pos?.allowanceJob ?? 0,
        'Tarif Transport Harian': e.customDailyTransport ?? pos?.dailyTransport ?? 35000,
        'Tarif Makan Harian': e.customDailyMeal ?? pos?.dailyMeal ?? 30000,
        'Lokasi Utama': loc?.name || 'Bebas',
        'Sisa Saldo Cuti': e.annualLeaveBalance,
        NPWP: e.npwp || 'Non-NPWP',
        PTKP: e.ptkpStatus,
        Bank: `${e.bankName} ${e.bankAccountNumber}`,
      };
    });

    exportToCsvOrExcel(`Data_Karyawan_${new Date().toISOString().split('T')[0]}`, data, format);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Direktori Data Karyawan
          </h1>
          <p className="text-sm text-slate-500">
            Total {employees.length} personel terdaftar • Lengkap dengan profil, kontrak, dokumen, dan riwayat gaji.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {currentRole === 'hrd' && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                Impor Data Excel
              </button>

              <button
                onClick={() => {
                  setFormEmployee(null);
                  setShowFormModal(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
              >
                <UserPlus className="h-4 w-4" />
                Tambah Karyawan
              </button>
            </>
          )}

          <button
            onClick={() => handleExportData('xlsx')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            title="Ekspor ke Excel"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Ekspor Excel
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIP, atau email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 font-medium"
          >
            <option value="ALL">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status Kerja</option>
            <option value="PKWTT">PKWTT (Tetap)</option>
            <option value="PKWT">PKWT (Kontrak)</option>
            <option value="Probation">Probation</option>
            <option value="Magang">Magang</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Karyawan</th>
                <th className="px-4 py-3">Departemen & Jabatan</th>
                <th className="px-4 py-3">Status Kerja</th>
                <th className="px-4 py-3">Lokasi Kerja (GPS)</th>
                <th className="px-4 py-3">Gaji Pokok</th>
                <th className="px-4 py-3">Sisa Cuti</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.map((emp) => {
                const dept = departments.find((d) => d.id === emp.departmentId);
                const pos = positions.find((p) => p.id === emp.positionId);
                const loc = locations.find((l) => l.id === emp.primaryLocationId);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white text-xs shadow-sm">
                          {emp.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {emp.nip} • {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{pos?.title || '-'}</div>
                      <div className="text-[11px] text-slate-400">{dept?.name || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          emp.employmentStatus === 'PKWTT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : emp.employmentStatus === 'PKWT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {loc ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                          <MapPin className="h-3 w-3 text-indigo-500" />
                          {loc.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Bebas</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {formatRupiah(emp.baseSalary)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-indigo-600">{emp.annualLeaveBalance} hari</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setDetailEmployee(emp)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                          title="Lihat Detail Profil Bertab"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {currentRole === 'hrd' && (
                          <>
                            <button
                              onClick={() => {
                                setFormEmployee(emp);
                                setShowFormModal(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                              title="Edit Karyawan"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus karyawan ${emp.name}?`)) {
                                  deleteEmployee(emp.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada data karyawan yang cocok dengan kriteria pencarian.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <div>
            Menampilkan {Math.min(filteredEmployees.length, (currentPage - 1) * pageSize + 1)} -{' '}
            {Math.min(filteredEmployees.length, currentPage * pageSize)} dari {filteredEmployees.length} karyawan
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Detail Dossier */}
      {detailEmployee && (
        <EmployeeDetailModal
          employee={detailEmployee}
          onClose={() => setDetailEmployee(null)}
          onEdit={() => {
            setFormEmployee(detailEmployee);
            setDetailEmployee(null);
            setShowFormModal(true);
          }}
        />
      )}

      {/* Modal: Form Add/Edit */}
      {showFormModal && (
        <EmployeeFormModal
          initialData={formEmployee}
          onClose={() => {
            setShowFormModal(false);
            setFormEmployee(null);
          }}
        />
      )}

      {/* Modal: Excel Importer */}
      {showImportModal && (
        <EmployeeImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
};
