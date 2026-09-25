import React from 'react';
import { useHRIS } from '../../context/HRISContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  MapPin,
  CalendarDays,
  Banknote,
  FileCheck,
  Building,
  Award,
  UserPlus,
  BarChart3,
  Settings,
  User,
  Shield,
  KeyRound,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'locations'
  | 'leave'
  | 'payroll'
  | 'myslip'
  | 'organization'
  | 'performance'
  | 'recruitment'
  | 'reports'
  | 'users'
  | 'settings'
  | 'selfservice';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { currentRole, pendingLeaveApprovals, contractAlerts } = useHRIS();

  const isHrd = currentRole === 'hrd';
  const isManager = currentRole === 'manager';

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    section?: string;
    visibleFor: ('hrd' | 'manager' | 'employee')[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      visibleFor: ['hrd', 'manager', 'employee'],
    },
    {
      id: 'selfservice',
      label: 'Portal Mandiri Saya',
      icon: User,
      visibleFor: ['hrd', 'manager', 'employee'],
    },
    {
      id: 'myslip',
      label: 'Slip Gaji Saya',
      icon: FileCheck,
      visibleFor: ['hrd', 'manager', 'employee'],
    },
    {
      id: 'attendance',
      label: 'Kehadiran & Absensi',
      icon: Clock,
      section: 'Operasional SDM',
      visibleFor: ['hrd', 'manager', 'employee'],
    },
    {
      id: 'locations',
      label: 'Kunci Lokasi (GPS)',
      icon: MapPin,
      visibleFor: ['hrd', 'manager'],
    },
    {
      id: 'leave',
      label: 'Cuti & Izin',
      icon: CalendarDays,
      badge: pendingLeaveApprovals.length > 0 ? pendingLeaveApprovals.length : undefined,
      badgeColor: 'bg-amber-500 text-white',
      visibleFor: ['hrd', 'manager', 'employee'],
    },
    {
      id: 'employees',
      label: 'Data Karyawan',
      icon: Users,
      badge: contractAlerts.length > 0 ? contractAlerts.length : undefined,
      badgeColor: 'bg-rose-500 text-white',
      section: 'Kelola Talenta & Payroll',
      visibleFor: ['hrd', 'manager'],
    },
    {
      id: 'payroll',
      label: 'Sistem Penggajian',
      icon: Banknote,
      visibleFor: ['hrd'],
    },
    {
      id: 'organization',
      label: 'Struktur Organisasi',
      icon: Building,
      visibleFor: ['hrd'],
    },
    {
      id: 'performance',
      label: 'Penilaian Kinerja',
      icon: Award,
      visibleFor: ['hrd', 'manager', 'employee'],
    },
    {
      id: 'recruitment',
      label: 'Rekrutmen & Pelamar',
      icon: UserPlus,
      visibleFor: ['hrd'],
    },
    {
      id: 'reports',
      label: 'Laporan & Analitik',
      icon: BarChart3,
      section: 'Manajemen & Sistem',
      visibleFor: ['hrd', 'manager'],
    },
    {
      id: 'users',
      label: 'Pengguna & Hak Akses',
      icon: KeyRound,
      section: 'Manajemen & Sistem',
      visibleFor: ['hrd'],
    },
    {
      id: 'settings',
      label: 'Profil Perusahaan',
      icon: Settings,
      visibleFor: ['hrd'],
    },
  ];

  let currentSection = '';

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="py-4 px-3 space-y-1">
        {navItems.map((item) => {
          if (!item.visibleFor.includes(currentRole)) return null;

          const showSection = item.section && item.section !== currentSection;
          if (showSection) {
            currentSection = item.section!;
          }

          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="pt-4 pb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onSelectTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Role Footer */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <Shield className="h-3.5 w-3.5 text-indigo-400" />
          <span>Status Akses:</span>
          <span className="font-bold text-indigo-400 uppercase">{currentRole}</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500">
          Gunakan tombol peran di navbar atas untuk simulasi Atasan / Karyawan.
        </p>
      </div>
    </aside>
  );
};
