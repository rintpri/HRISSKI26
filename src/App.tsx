import React, { useState } from 'react';
import { HRISProvider, useHRIS } from './context/HRISContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { EmployeeList } from './components/employees/EmployeeList';
import { AttendanceView } from './components/attendance/AttendanceView';
import { LocationManagement } from './components/locations/LocationManagement';
import { LeaveManagement } from './components/leave/LeaveManagement';
import { PayrollView } from './components/payroll/PayrollView';
import { OrganizationView } from './components/organization/OrganizationView';
import { PerformanceView } from './components/performance/PerformanceView';
import { RecruitmentView } from './components/recruitment/RecruitmentView';
import { ReportsView } from './components/reports/ReportsView';
import { CompanyProfileSettings } from './components/settings/CompanyProfileSettings';
import { SelfServiceProfile } from './components/selfservice/SelfServiceProfile';
import { UsersView } from './components/users/UsersView';
import { LoginView } from './components/auth/LoginView';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  FileCheck,
  Users,
  Menu,
  X,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentRole } = useHRIS();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigate = (tab: NavTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'employees':
        return <EmployeeList />;
      case 'attendance':
        return <AttendanceView />;
      case 'locations':
        return <LocationManagement />;
      case 'leave':
        return <LeaveManagement />;
      case 'payroll':
        return <PayrollView initialSubTab="payroll" />;
      case 'myslip':
        return <PayrollView initialSubTab="myslip" />;
      case 'organization':
        return <OrganizationView />;
      case 'performance':
        return <PerformanceView />;
      case 'recruitment':
        return <RecruitmentView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <CompanyProfileSettings />;
      case 'selfservice':
        return <SelfServiceProfile />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={handleNavigate} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Quick Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 py-2 backdrop-blur-md md:hidden shadow-lg">
        <button
          onClick={() => handleNavigate('dashboard')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            currentTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="h-4 w-4 mb-0.5" />
          Beranda
        </button>
        <button
          onClick={() => handleNavigate('attendance')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            currentTab === 'attendance' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Clock className="h-4 w-4 mb-0.5" />
          Absensi
        </button>
        <button
          onClick={() => handleNavigate('leave')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            currentTab === 'leave' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <CalendarDays className="h-4 w-4 mb-0.5" />
          Cuti
        </button>
        <button
          onClick={() => handleNavigate('myslip')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            currentTab === 'myslip' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <FileCheck className="h-4 w-4 mb-0.5" />
          Slip Gaji
        </button>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center text-[10px] font-bold text-slate-600"
        >
          {mobileMenuOpen ? <X className="h-4 w-4 mb-0.5" /> : <Menu className="h-4 w-4 mb-0.5" />}
          Menu Lain
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden flex justify-end">
          <div className="w-72 bg-slate-900 text-white p-4 flex flex-col justify-between h-full overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-sm text-indigo-400">Navigasi Modul</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {[
                { id: 'dashboard', label: 'Dashboard Utama', roles: ['hrd', 'manager', 'employee'] },
                { id: 'selfservice', label: 'Portal Mandiri Saya', roles: ['hrd', 'manager', 'employee'] },
                { id: 'myslip', label: 'Slip Gaji Saya', roles: ['hrd', 'manager', 'employee'] },
                { id: 'attendance', label: 'Kehadiran & Absensi GPS', roles: ['hrd', 'manager', 'employee'] },
                { id: 'locations', label: 'Kunci Lokasi (GPS)', roles: ['hrd', 'manager'] },
                { id: 'leave', label: 'Pengajuan & Approval Cuti', roles: ['hrd', 'manager', 'employee'] },
                { id: 'employees', label: 'Data Karyawan & Impor Excel', roles: ['hrd', 'manager'] },
                { id: 'payroll', label: 'Sistem Penggajian (Payroll)', roles: ['hrd'] },
                { id: 'organization', label: 'Struktur Organisasi & Jabatan', roles: ['hrd'] },
                { id: 'performance', label: 'Penilaian Kinerja (KPI)', roles: ['hrd', 'manager', 'employee'] },
                { id: 'recruitment', label: 'Rekrutmen & Pelamar', roles: ['hrd'] },
                { id: 'reports', label: 'Laporan & Analitik', roles: ['hrd', 'manager'] },
                { id: 'users', label: 'Pengguna & Hak Akses', roles: ['hrd'] },
                { id: 'settings', label: 'Profil Perusahaan', roles: ['hrd'] },
              ]
                .filter((item) => item.roles.includes(currentRole))
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id as NavTab)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      currentTab === item.id
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400">
              HRIS Enterprise • PT Nusantara Sinergi Abadi
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <HRISProvider>
      <AppContent />
    </HRISProvider>
  );
}
