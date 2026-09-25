import React, { useState } from 'react';
import { useHRIS } from '../../context/HRISContext';
import { WorkLocation } from '../../types/hris';
import { getBrowserLocation } from '../../utils/geo';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Users,
  Navigation,
  Check,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react';

export const LocationManagement: React.FC = () => {
  const {
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    company,
    updateCompanyProfile,
    employees,
    assignEmployeeLocations,
    currentRole,
  } = useHRIS();

  const [activeTab, setActiveTab] = useState<'master' | 'assignments' | 'policy'>('master');

  // Modal State for Location Form
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WorkLocation | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Kantor Cabang' as WorkLocation['type'],
    address: '',
    latitude: -6.225014,
    longitude: 106.809712,
    radius: 100,
    isMandatoryRadius: true,
  });

  // Modal State for Employee Location Assignment
  const [assigningEmpId, setAssigningEmpId] = useState<string | null>(null);
  const [primaryLocId, setPrimaryLocId] = useState<string>('');
  const [selectedAllowedLocs, setSelectedAllowedLocs] = useState<string[]>([]);

  // Policy Form State
  const [policyGeofencingActive, setPolicyGeofencingActive] = useState(company.isGeofencingActive);
  const [policyGpsTolerance, setPolicyGpsTolerance] = useState(company.gpsToleranceMeters);
  const [policySaved, setPolicySaved] = useState(false);

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({
      code: `LOC-${locations.length + 1}`,
      name: '',
      type: 'Kantor Cabang',
      address: '',
      latitude: -6.225014,
      longitude: 106.809712,
      radius: 100,
      isMandatoryRadius: true,
    });
    setShowLocationModal(true);
  };

  const openEditModal = (loc: WorkLocation) => {
    setEditingLocation(loc);
    setFormData({
      code: loc.code,
      name: loc.name,
      type: loc.type,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
      radius: loc.radius,
      isMandatoryRadius: loc.isMandatoryRadius,
    });
    setShowLocationModal(true);
  };

  const handleDetectCurrentGps = async () => {
    try {
      const pos = await getBrowserLocation();
      setFormData((prev) => ({
        ...prev,
        latitude: Number(pos.latitude.toFixed(6)),
        longitude: Number(pos.longitude.toFixed(6)),
      }));
    } catch (e: any) {
      alert(e.message || 'Gagal membaca koordinat GPS perangkat.');
    }
  };

  const handleSubmitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (editingLocation) {
      updateLocation(editingLocation.id, {
        ...formData,
        googleMapsUrl: `https://maps.google.com/?q=${formData.latitude},${formData.longitude}`,
      });
    } else {
      addLocation({
        ...formData,
        googleMapsUrl: `https://maps.google.com/?q=${formData.latitude},${formData.longitude}`,
      });
    }

    setShowLocationModal(false);
  };

  const openAssignmentModal = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    setAssigningEmpId(empId);
    setPrimaryLocId(emp.primaryLocationId || '');
    setSelectedAllowedLocs(emp.allowedLocationIds || []);
  };

  const handleSaveAssignment = () => {
    if (assigningEmpId) {
      assignEmployeeLocations(assigningEmpId, primaryLocId || undefined, selectedAllowedLocs);
      setAssigningEmpId(null);
    }
  };

  const handleSavePolicy = () => {
    updateCompanyProfile({
      isGeofencingActive: policyGeofencingActive,
      gpsToleranceMeters: policyGpsTolerance,
    });
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kunci Lokasi / Geofencing Lokasi Kerja
          </h1>
          <p className="text-sm text-slate-500">
            Atur titik koordinat kantor, radius presensi, dan penugasan karyawan sesuai fungsi & mobilitas.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('master')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'master'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Master Lokasi ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'assignments'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Penugasan Karyawan
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'policy'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kebijakan & Radius
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MASTER LOKASI                                            */}
      {/* ============================================================== */}
      {activeTab === 'master' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-sm font-bold text-slate-800">Daftar Titik Lokasi Resmi Perusahaan</span>
              <p className="text-xs text-slate-500">Kantor pusat, cabang, gudang, dan lokasi proyek aktif</p>
            </div>
            {currentRole === 'hrd' && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <Plus className="h-4 w-4" />
                Tambah Lokasi
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => {
              const assignedCount = employees.filter(
                (e) => e.allowedLocationIds?.includes(loc.id) || e.primaryLocationId === loc.id
              ).length;

              return (
                <div
                  key={loc.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <span className="rounded-lg bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-bold border border-indigo-100">
                        {loc.code}
                      </span>
                      <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-medium">
                        {loc.type}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{loc.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{loc.address}</p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Koordinat:</span>
                        <span className="font-mono font-medium">
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Radius Absen:</span>
                        <span className="font-semibold text-slate-900">{loc.radius} meter</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Karyawan Ditugaskan:</span>
                        <span className="font-bold text-indigo-600">{assignedCount} orang</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {loc.googleMapsUrl && (
                      <a
                        href={loc.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Buka Google Maps
                      </a>
                    )}

                    {currentRole === 'hrd' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(loc)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          title="Edit Lokasi"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus lokasi ${loc.name}?`)) {
                              deleteLocation(loc.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Hapus Lokasi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PENUGASAN LOKASI KARYAWAN                                */}
      {/* ============================================================== */}
      {activeTab === 'assignments' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Penugasan Titik Lokasi Karyawan</h3>
              <p className="text-xs text-slate-500">
                Tentukan 1 lokasi utama dan pilih beberapa lokasi sekaligus untuk staf mobile (misal Sales).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Karyawan</th>
                  <th className="px-4 py-3">Lokasi Utama</th>
                  <th className="px-4 py-3">Lokasi Tambahan yang Diizinkan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const primaryLoc = locations.find((l) => l.id === emp.primaryLocationId);
                  const allowedLocs = locations.filter((l) => emp.allowedLocationIds?.includes(l.id));

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-400">{emp.nip}</div>
                      </td>
                      <td className="px-4 py-3">
                        {primaryLoc ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold border border-indigo-100">
                            <MapPin className="h-3 w-3" />
                            {primaryLoc.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum diatur</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {allowedLocs.length > 0 ? (
                            allowedLocs.map((l) => (
                              <span
                                key={l.id}
                                className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-medium"
                              >
                                {l.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">Bebas dari mana saja</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {currentRole === 'hrd' && (
                          <button
                            onClick={() => openAssignmentModal(emp.id)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition"
                          >
                            Ubah Penugasan
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
      )}

      {/* ============================================================== */}
      {/* TAB 3: KEBIJAKAN & RADIUS (GEOFENCING TOGGLE)                   */}
      {/* ============================================================== */}
      {activeTab === 'policy' && (
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Kebijakan Global Kunci Lokasi (Geofencing)</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                Pengaturan penegakan radius GPS saat karyawan melakukan Absen Masuk. Status default sistem: <strong>NONAKTIF (Aman)</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Main Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Status Kunci Lokasi (Geofencing)</span>
                <span className="text-slate-500 text-xs">
                  {policyGeofencingActive
                    ? 'AKTIF: Browser mewajibkan GPS, karyawan di luar radius lokasi kerja akan ditolak saat Absen Masuk.'
                    : 'NONAKTIF: Karyawan dapat melakukan absensi dari mana saja tanpa pemblokiran radius.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPolicyGeofencingActive(!policyGeofencingActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  policyGeofencingActive ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    policyGeofencingActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* GPS Tolerance Setting */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Toleransi Keakuratan GPS (Meter)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="10"
                  value={policyGpsTolerance}
                  onChange={(e) => setPolicyGpsTolerance(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 p-2.5 font-medium w-36 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-slate-500 text-xs">
                  (Tambahan radius fleksibel untuk mengantisipasi drifting GPS gedung tinggi. Default: 50m)
                </span>
              </div>
            </div>

            {/* Behavior Information Box */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Catatan Penting Mekanisme Geofencing:
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90 pl-1">
                <li>Karyawan yang belum ditugaskan ke lokasi mana pun tetap bebas absen dari mana saja.</li>
                <li>Absen pulang mencatat koordinat namun tidak diblokir untuk kemudahan mobilitas pulang.</li>
                <li>HRD memiliki akses untuk mengoreksi absensi manual kapan saja bila terjadi kendala perangkat.</li>
              </ul>
            </div>

            {policySaved && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4" />
                Kebijakan kunci lokasi berhasil diperbarui!
              </div>
            )}

            {currentRole === 'hrd' && (
              <div className="pt-2">
                <button
                  onClick={handleSavePolicy}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
                >
                  Simpan Kebijakan Lokasi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Lokasi */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingLocation ? 'Edit Lokasi Kerja' : 'Tambah Lokasi Kerja Baru'}
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLocation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Kode Lokasi</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="HQ-SCBD"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Jenis Lokasi</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as WorkLocation['type'] })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                  >
                    <option value="Kantor Pusat">Kantor Pusat</option>
                    <option value="Kantor Cabang">Kantor Cabang</option>
                    <option value="Gudang">Gudang</option>
                    <option value="Proyek">Proyek</option>
                    <option value="Lokasi Klien">Lokasi Klien</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Nama Lokasi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kantor Pusat SCBD"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jl. Jend Sudirman Kav 52..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Radius (Meter)</label>
                  <input
                    type="number"
                    min="20"
                    max="5000"
                    required
                    value={formData.radius}
                    onChange={(e) =>
                      setFormData({ ...formData, radius: parseInt(e.target.value, 10) || 100 })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
              </div>

              {/* Detect current GPS button */}
              <button
                type="button"
                onClick={handleDetectCurrentGps}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                Gunakan Titik Koordinat GPS Saya Saat Ini
              </button>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  Simpan Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penugasan Lokasi Karyawan */}
      {assigningEmpId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ubah Penugasan Lokasi</h3>
                <p className="text-xs text-slate-500">
                  {employees.find((e) => e.id === assigningEmpId)?.name}
                </p>
              </div>
              <button
                onClick={() => setAssigningEmpId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Primary Location */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lokasi Utama (Homebase)</label>
                <select
                  value={primaryLocId}
                  onChange={(e) => setPrimaryLocId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium"
                >
                  <option value="">-- Tanpa Lokasi Utama (Bebas) --</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Locations Permission */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Lokasi Tambahan yang Diizinkan Presensi:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-100 bg-slate-50">
                  {locations.map((loc) => {
                    const isChecked = selectedAllowedLocs.includes(loc.id);
                    return (
                      <label
                        key={loc.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAllowedLocs([...selectedAllowedLocs, loc.id]);
                            } else {
                              setSelectedAllowedLocs(selectedAllowedLocs.filter((id) => id !== loc.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium">{loc.name}</span>
                        <span className="text-[10px] text-slate-400">({loc.type})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAssigningEmpId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAssignment}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
              >
                Simpan Penugasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
