import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  CompanyProfile,
  WorkLocation,
  Department,
  JobPosition,
  Employee,
  EmployeeContract,
  EmployeeDocument,
  SalaryHistory,
  CareerHistory,
  AttendanceRecord,
  LeaveRequest,
  PayrollPeriod,
  Payslip,
  JobOpening,
  Applicant,
  PerformanceEvaluation,
  Announcement,
  Role,
  AttendanceStatus,
  LeaveStatus,
  LoginLog,
} from '../types/hris';
import {
  initialCompanyProfile,
  initialLocations,
  initialDepartments,
  initialPositions,
  initialEmployees,
  initialContracts,
  initialDocuments,
  initialSalaryHistories,
  initialCareerHistories,
  initialAttendanceRecords,
  initialLeaveRequests,
  initialPayrollPeriods,
  initialJobOpenings,
  initialApplicants,
  initialPerformanceEvaluations,
  initialAnnouncements,
} from '../data/initialData';
import { calculateHaversineDistance, verifyGeofence } from '../utils/geo';
import { calculateEmployeePayslip } from '../utils/payrollCalculator';
import * as XLSX from 'xlsx';

interface HRISContextType {
  // Active Persona & Auth
  isAuthenticated: boolean;
  currentEmployee: Employee;
  currentRole: Role;
  setCurrentEmployeeId: (id: string) => void;
  setCurrentRole: (role: Role) => void;
  login: (credential: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  loginAsDemo: (employeeId: string) => void;
  loginLogs: LoginLog[];
  toggleEmployeeActive: (employeeId: string) => void;
  resetEmployeePassword: (employeeId: string, newPass?: string) => void;
  updateEmployeeRole: (employeeId: string, newRole: Role) => void;

  // Company Profile
  company: CompanyProfile;
  updateCompanyProfile: (data: Partial<CompanyProfile>) => void;

  // Master Data
  locations: WorkLocation[];
  departments: Department[];
  positions: JobPosition[];
  employees: Employee[];
  contracts: EmployeeContract[];
  documents: EmployeeDocument[];
  salaryHistories: SalaryHistory[];
  careerHistories: CareerHistory[];

  // CRUD Actions
  addLocation: (loc: Omit<WorkLocation, 'id' | 'createdAt'>) => void;
  updateLocation: (id: string, loc: Partial<WorkLocation>) => void;
  deleteLocation: (id: string) => void;

  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  addPosition: (pos: Omit<JobPosition, 'id'>) => void;
  updatePosition: (id: string, pos: Partial<JobPosition>) => void;
  deletePosition: (id: string) => void;
  massUpdatePositionAllowancesByLevel: (level: number, transport: number, meal: number, jobAllowance?: number) => void;

  addEmployee: (empData: Partial<Employee>) => Employee;
  updateEmployee: (id: string, empData: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  assignEmployeeLocations: (empId: string, primaryId: string | undefined, allowedIds: string[]) => void;
  extendContractOneYear: (contractId: string) => void;
  extendDocumentOneYear: (documentId: string) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  todayAttendance: AttendanceRecord | undefined;
  clockIn: (status: 'Hadir' | 'WFH', currentCoords?: { lat: number; lng: number }) => { success: boolean; message: string; distance?: number };
  clockOut: (currentCoords?: { lat: number; lng: number }) => { success: boolean; message: string };
  markAllPresentToday: () => void;
  upsertAttendanceRecord: (record: Partial<AttendanceRecord> & { employeeId: string; date: string }) => void;

  // Leaves
  leaveRequests: LeaveRequest[];
  applyLeave: (data: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status' | 'managerStatus' | 'hrdStatus'>) => { success: boolean; message: string };
  approveLeaveByManager: (requestId: string, notes?: string) => void;
  rejectLeaveByManager: (requestId: string, notes?: string) => void;
  approveLeaveByHrd: (requestId: string, notes?: string) => void;
  rejectLeaveByHrd: (requestId: string, notes?: string) => void;
  cancelLeave: (requestId: string) => void;
  generateAnnualLeaveQuotaAll: (quota: number) => void;
  updateEmployeeLeaveBalance: (empId: string, newBalance: number) => void;

  // Payroll
  payrollPeriods: PayrollPeriod[];
  payslips: Payslip[];
  generateMonthlyPayroll: (month: number, year: number) => void;
  markPayrollPaid: (periodId: string) => void;
  updatePayslipOverrides: (payslipId: string, bonus: number, loan: number, coop: number) => void;

  // Recruitment
  jobOpenings: JobOpening[];
  applicants: Applicant[];
  addJobOpening: (job: Omit<JobOpening, 'id' | 'postedDate'>) => void;
  updateJobOpening: (id: string, job: Partial<JobOpening>) => void;
  updateApplicantStage: (applicantId: string, stage: Applicant['stage']) => void;
  updateApplicantRating: (applicantId: string, rating: number) => void;
  convertApplicantToEmployee: (applicantId: string) => Employee;

  // Performance
  performanceEvaluations: PerformanceEvaluation[];
  addPerformanceEvaluation: (evalData: Omit<PerformanceEvaluation, 'id' | 'evaluatedAt' | 'finalScore' | 'grade'>) => void;
  updatePerformanceEvaluation: (id: string, evalData: Partial<PerformanceEvaluation>) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'publishedDate'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Smart Alerts
  contractAlerts: { contract: EmployeeContract; employee: Employee; daysLeft: number }[];
  documentAlerts: { document: EmployeeDocument; employee: Employee; daysLeft: number }[];
  upcomingBirthdays: { employee: Employee; day: number; age: number }[];
  pendingLeaveApprovals: LeaveRequest[];

  // Import / Export helper
  applyImportedBatch: (data: {
    createdEmployees: Employee[];
    updatedEmployees: Employee[];
    newDepartments: Department[];
    newPositions: JobPosition[];
    newContracts: EmployeeContract[];
    newSalaryHistories: SalaryHistory[];
    newCareerHistories: CareerHistory[];
  }) => void;
  exportToCsvOrExcel: (filename: string, data: Record<string, any>[], format?: 'csv' | 'xlsx') => void;

  // Reset
  resetToDemoData: () => void;
}

const HRISContext = createContext<HRISContextType | null>(null);

const STORAGE_KEY = 'hris_v2_app_state';

export const HRISProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const loadState = <T,>(subKey: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${subKey}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return fallback;
  };

  const [company, setCompany] = useState<CompanyProfile>(() => loadState('company', initialCompanyProfile));
  const [locations, setLocations] = useState<WorkLocation[]>(() => loadState('locations', initialLocations));
  const [departments, setDepartments] = useState<Department[]>(() => loadState('departments', initialDepartments));
  const [positions, setPositions] = useState<JobPosition[]>(() => loadState('positions', initialPositions));
  const [employees, setEmployees] = useState<Employee[]>(() => loadState('employees', initialEmployees));
  const [contracts, setContracts] = useState<EmployeeContract[]>(() => loadState('contracts', initialContracts));
  const [documents, setDocuments] = useState<EmployeeDocument[]>(() => loadState('documents', initialDocuments));
  const [salaryHistories, setSalaryHistories] = useState<SalaryHistory[]>(() => loadState('salaryHistories', initialSalaryHistories));
  const [careerHistories, setCareerHistories] = useState<CareerHistory[]>(() => loadState('careerHistories', initialCareerHistories));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadState('attendance', initialAttendanceRecords));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => loadState('leave', initialLeaveRequests));
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>(() => loadState('payrollPeriods', initialPayrollPeriods));
  const [payslips, setPayslips] = useState<Payslip[]>(() => loadState('payslips', []));
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(() => loadState('jobs', initialJobOpenings));
  const [applicants, setApplicants] = useState<Applicant[]>(() => loadState('applicants', initialApplicants));
  const [performanceEvaluations, setPerformanceEvaluations] = useState<PerformanceEvaluation[]>(() => loadState('evaluations', initialPerformanceEvaluations));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadState('announcements', initialAnnouncements));

  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadState('auth_session', true));
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>(() => loadState('login_logs', [
    {
      id: 'log-1',
      employeeId: 'emp-2',
      employeeName: 'Ratna Dewi Sartika, S.Psi',
      nip: 'NSA-2023-002',
      role: 'hrd',
      timestamp: '2026-09-25 08:05:12',
      ipAddress: '192.168.1.10',
      device: 'Chrome on MacOS (Kantor Pusat)',
      status: 'Berhasil',
    },
    {
      id: 'log-2',
      employeeId: 'emp-4',
      employeeName: 'Dimas Setiawan, S.Kom',
      nip: 'NSA-2024-004',
      role: 'manager',
      timestamp: '2026-09-25 08:12:44',
      ipAddress: '192.168.1.25',
      device: 'Edge on Windows (Kantor Pusat)',
      status: 'Berhasil',
    },
    {
      id: 'log-3',
      employeeId: 'emp-5',
      employeeName: 'Rizky Pratama',
      nip: 'NSA-2024-005',
      role: 'employee',
      timestamp: '2026-09-25 08:35:02',
      ipAddress: '182.253.11.45',
      device: 'Mobile Safari on iOS (Remote)',
      status: 'Berhasil',
    },
  ]));

  // Current active logged-in employee persona
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>(() => employees[1]?.id || 'emp-2'); // Ratna Dewi (HR Head) by default
  const [currentRoleOverride, setCurrentRoleOverride] = useState<Role | null>(null);

  // Auto-sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_company`, JSON.stringify(company));
      localStorage.setItem(`${STORAGE_KEY}_locations`, JSON.stringify(locations));
      localStorage.setItem(`${STORAGE_KEY}_departments`, JSON.stringify(departments));
      localStorage.setItem(`${STORAGE_KEY}_positions`, JSON.stringify(positions));
      localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
      localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts));
      localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
      localStorage.setItem(`${STORAGE_KEY}_salaryHistories`, JSON.stringify(salaryHistories));
      localStorage.setItem(`${STORAGE_KEY}_careerHistories`, JSON.stringify(careerHistories));
      localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendanceRecords));
      localStorage.setItem(`${STORAGE_KEY}_leave`, JSON.stringify(leaveRequests));
      localStorage.setItem(`${STORAGE_KEY}_payrollPeriods`, JSON.stringify(payrollPeriods));
      localStorage.setItem(`${STORAGE_KEY}_payslips`, JSON.stringify(payslips));
      localStorage.setItem(`${STORAGE_KEY}_jobs`, JSON.stringify(jobOpenings));
      localStorage.setItem(`${STORAGE_KEY}_applicants`, JSON.stringify(applicants));
      localStorage.setItem(`${STORAGE_KEY}_evaluations`, JSON.stringify(performanceEvaluations));
      localStorage.setItem(`${STORAGE_KEY}_announcements`, JSON.stringify(announcements));
      localStorage.setItem(`${STORAGE_KEY}_auth_session`, JSON.stringify(isAuthenticated));
      localStorage.setItem(`${STORAGE_KEY}_login_logs`, JSON.stringify(loginLogs));
    } catch (e) {
      console.warn('LocalStorage quota or serialization error:', e);
    }
  }, [
    company,
    locations,
    departments,
    positions,
    employees,
    contracts,
    documents,
    salaryHistories,
    careerHistories,
    attendanceRecords,
    leaveRequests,
    payrollPeriods,
    payslips,
    jobOpenings,
    applicants,
    performanceEvaluations,
    announcements,
    isAuthenticated,
    loginLogs,
  ]);

  const currentEmployee = useMemo(() => {
    return employees.find((e) => e.id === currentEmployeeId) || employees[0];
  }, [employees, currentEmployeeId]);

  const currentRole = currentRoleOverride || currentEmployee.role;

  const setCurrentRole = (r: Role) => {
    setCurrentRoleOverride(r);
  };

  const login = (credential: string, password?: string): { success: boolean; message: string } => {
    const cred = credential.trim().toLowerCase();
    const emp = employees.find(
      (e) =>
        e.username?.toLowerCase() === cred ||
        e.nip.toLowerCase() === cred ||
        e.email.toLowerCase() === cred
    );

    if (!emp) {
      return { success: false, message: 'NIP, Username, atau Email tidak terdaftar dalam sistem.' };
    }

    if (!emp.isActive) {
      return { success: false, message: 'Akun Anda dinonaktifkan oleh Administrator. Hubungi HRD.' };
    }

    // Check password if provided (allow 'password123' as universal demo fallback or exact password)
    if (password && emp.password && password !== emp.password && password !== 'password123') {
      const failedLog: LoginLog = {
        id: `log-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        nip: emp.nip,
        role: emp.role,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        device: 'Web Browser',
        status: 'Gagal',
      };
      setLoginLogs((prev) => [failedLog, ...prev]);
      return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setCurrentEmployeeId(emp.id);
    setCurrentRoleOverride(emp.role);
    setIsAuthenticated(true);

    // Update lastLogin
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, lastLogin: nowStr } : e))
    );

    const successLog: LoginLog = {
      id: `log-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      nip: emp.nip,
      role: emp.role,
      timestamp: nowStr,
      device: 'Web Browser',
      status: 'Berhasil',
    };
    setLoginLogs((prev) => [successLog, ...prev.slice(0, 49)]);

    return { success: true, message: `Selamat datang kembali, ${emp.name}!` };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const loginAsDemo = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setCurrentEmployeeId(emp.id);
    setCurrentRoleOverride(emp.role);
    setIsAuthenticated(true);
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, lastLogin: nowStr } : e))
    );
  };

  const toggleEmployeeActive = (empId: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, isActive: !e.isActive } : e))
    );
  };

  const resetEmployeePassword = (empId: string, newPass?: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, password: newPass || 'password123' } : e))
    );
  };

  const updateEmployeeRole = (empId: string, newRole: Role) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, role: newRole } : e))
    );
    if (empId === currentEmployeeId) {
      setCurrentRoleOverride(newRole);
    }
  };

  const updateCompanyProfile = (data: Partial<CompanyProfile>) => {
    setCompany((prev) => ({ ...prev, ...data }));
  };

  // Location CRUD
  const addLocation = (loc: Omit<WorkLocation, 'id' | 'createdAt'>) => {
    const newLoc: WorkLocation = {
      ...loc,
      id: `loc-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      googleMapsUrl: loc.googleMapsUrl || `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`,
    };
    setLocations((prev) => [...prev, newLoc]);
  };

  const updateLocation = (id: string, loc: Partial<WorkLocation>) => {
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...loc } : l))
    );
  };

  const deleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  // Department & Position CRUD
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    setDepartments((prev) => [...prev, newDept]);
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...dept } : d))
    );
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const addPosition = (pos: Omit<JobPosition, 'id'>) => {
    const newPos: JobPosition = {
      ...pos,
      id: `pos-${Date.now()}`,
    };
    setPositions((prev) => [...prev, newPos]);
  };

  const updatePosition = (id: string, pos: Partial<JobPosition>) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...pos } : p))
    );
  };

  const deletePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  // Mass update position allowances by grade level
  const massUpdatePositionAllowancesByLevel = (
    level: number,
    transport: number,
    meal: number,
    jobAllowance?: number
  ) => {
    setPositions((prev) =>
      prev.map((p) => {
        if (p.level === level) {
          return {
            ...p,
            dailyTransport: transport,
            dailyMeal: meal,
            ...(jobAllowance !== undefined ? { allowanceJob: jobAllowance } : {}),
          };
        }
        return p;
      })
    );
  };

  // Employee CRUD with auto NIP, Login, Leave Quota
  const addEmployee = (empData: Partial<Employee>): Employee => {
    const year = new Date().getFullYear();
    const count = employees.length + 1;
    const nip = empData.nip || `NSA-${year}-${String(count).padStart(3, '0')}`;
    const id = `emp-${Date.now()}`;

    const newEmp: Employee = {
      id,
      nip,
      name: empData.name || 'Nama Karyawan',
      email: empData.email || `${nip.toLowerCase()}@pt-nsa.co.id`,
      phone: empData.phone || '081200000000',
      nik: empData.nik || `3171${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      npwp: empData.npwp || '',
      hasNpwp: Boolean(empData.npwp && empData.npwp.length > 5),
      birthDate: empData.birthDate || '1995-01-01',
      birthPlace: empData.birthPlace || 'Jakarta',
      gender: empData.gender || 'L',
      religion: empData.religion || 'Islam',
      maritalStatus: empData.maritalStatus || 'Belum Kawin',
      ptkpStatus: empData.ptkpStatus || 'TK/0',
      address: empData.address || 'Jakarta',
      bankName: empData.bankName || 'BCA',
      bankAccountNumber: empData.bankAccountNumber || '883000000',
      bankAccountHolder: empData.bankAccountHolder || empData.name || 'Karyawan',
      bpjsKesNumber: empData.bpjsKesNumber || '',
      bpjsTkNumber: empData.bpjsTkNumber || '',
      departmentId: empData.departmentId || departments[0]?.id || 'dept-ops',
      positionId: empData.positionId || positions[0]?.id || 'pos-9',
      managerNip: empData.managerNip,
      employmentStatus: empData.employmentStatus || 'PKWT',
      joinDate: empData.joinDate || new Date().toISOString().split('T')[0],
      role: empData.role || 'employee',
      isActive: true,
      baseSalary: empData.baseSalary || 6000000,
      customJobAllowance: empData.customJobAllowance,
      customDailyTransport: empData.customDailyTransport,
      customDailyMeal: empData.customDailyMeal,
      primaryLocationId: empData.primaryLocationId || locations[0]?.id,
      allowedLocationIds: empData.allowedLocationIds || (locations[0] ? [locations[0].id] : []),
      annualLeaveBalance: empData.annualLeaveBalance !== undefined ? empData.annualLeaveBalance : 12,
      username: nip.toLowerCase().replace(/[^a-z0-9]/g, ''),
      password: empData.password || '123456',
    };

    setEmployees((prev) => [...prev, newEmp]);

    // Auto-create initial contract
    const contract: EmployeeContract = {
      id: `ct-${Date.now()}`,
      employeeId: id,
      contractNumber: `CTR/NSA/${year}/${String(count).padStart(3, '0')}`,
      type: newEmp.employmentStatus,
      startDate: newEmp.joinDate,
      endDate:
        newEmp.employmentStatus === 'PKWT'
          ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
          : undefined,
      isActive: true,
    };
    setContracts((prev) => [...prev, contract]);

    // Auto-create initial salary history
    setSalaryHistories((prev) => [
      ...prev,
      {
        id: `sh-${Date.now()}`,
        employeeId: id,
        effectiveDate: newEmp.joinDate,
        baseSalary: newEmp.baseSalary,
        jobAllowance: newEmp.customJobAllowance || 0,
        reason: 'Awal Masuk',
      },
    ]);

    // Auto-create initial career history
    const dept = departments.find((d) => d.id === newEmp.departmentId);
    const pos = positions.find((p) => p.id === newEmp.positionId);
    setCareerHistories((prev) => [
      ...prev,
      {
        id: `ch-${Date.now()}`,
        employeeId: id,
        effectiveDate: newEmp.joinDate,
        departmentName: dept?.name || 'Departemen',
        positionTitle: pos?.title || 'Jabatan',
        type: 'Pengangkatan',
      },
    ]);

    return newEmp;
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...empData };
          if (empData.npwp !== undefined) {
            updated.hasNpwp = Boolean(empData.npwp && empData.npwp.length > 5);
          }
          return updated;
        }
        return e;
      })
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const assignEmployeeLocations = (empId: string, primaryId: string | undefined, allowedIds: string[]) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, primaryLocationId: primaryId, allowedLocationIds: allowedIds } : e))
    );
  };

  const extendContractOneYear = (contractId: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          const currentEnd = c.endDate ? new Date(c.endDate) : new Date();
          currentEnd.setFullYear(currentEnd.getFullYear() + 1);
          return {
            ...c,
            endDate: currentEnd.toISOString().split('T')[0],
            notes: (c.notes ? `${c.notes}; ` : '') + 'Diperpanjang 1 tahun',
          };
        }
        return c;
      })
    );
  };

  const extendDocumentOneYear = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === documentId) {
          const currentExp = d.expiryDate ? new Date(d.expiryDate) : new Date();
          currentExp.setFullYear(currentExp.getFullYear() + 1);
          return {
            ...d,
            expiryDate: currentExp.toISOString().split('T')[0],
            notes: (d.notes ? `${d.notes}; ` : '') + 'Masa berlaku diperpanjang 1 tahun',
          };
        }
        return d;
      })
    );
  };

  // Today Attendance for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = useMemo(() => {
    return attendanceRecords.find(
      (r) => r.employeeId === currentEmployee.id && r.date === todayStr
    );
  }, [attendanceRecords, currentEmployee.id, todayStr]);

  // Geofencing Check-in
  const clockIn = (
    status: 'Hadir' | 'WFH',
    currentCoords?: { lat: number; lng: number }
  ): { success: boolean; message: string; distance?: number } => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // If WFH, geofencing is bypassed
    if (status === 'WFH') {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: currentEmployee.id,
        employeeNip: currentEmployee.nip,
        employeeName: currentEmployee.name,
        date: todayStr,
        status: 'WFH',
        clockInTime: timeStr,
        locationVerified: true,
        lateMinutes: 0,
        workHours: 8,
        overtimeHours: 0,
        notes: 'Absensi WFH mandiri',
      };
      setAttendanceRecords((prev) => [
        ...prev.filter((r) => !(r.employeeId === currentEmployee.id && r.date === todayStr)),
        newRec,
      ]);
      return { success: true, message: 'Absen Masuk WFH berhasil dicatat.' };
    }

    // Geofencing evaluation for office attendance
    const assignedLocs = locations.filter(
      (l) => currentEmployee.allowedLocationIds?.includes(l.id) || l.id === currentEmployee.primaryLocationId
    );

    let verified = true;
    let distance = 0;
    let locMatch = locations[0];

    if (currentCoords) {
      const geoResult = verifyGeofence(
        currentCoords.lat,
        currentCoords.lng,
        company.isGeofencingActive,
        company.gpsToleranceMeters,
        assignedLocs
      );

      if (!geoResult.isAllowed) {
        return {
          success: false,
          message: geoResult.message,
          distance: geoResult.distanceMeters,
        };
      }

      verified = true;
      distance = geoResult.distanceMeters || 0;
      if (geoResult.closestLocation) {
        locMatch = geoResult.closestLocation;
      }
    } else if (company.isGeofencingActive && assignedLocs.length > 0) {
      return {
        success: false,
        message: 'Kunci lokasi aktif. Mohon izinkan akses GPS browser Anda untuk verifikasi lokasi.',
      };
    }

    // Calculate late minutes
    const [stdHour, stdMin] = company.standardWorkStartTime.split(':').map(Number);
    const standardStartTimeMs = new Date(now).setHours(stdHour, stdMin + company.lateGraceMinutes, 0, 0);
    const isLate = now.getTime() > standardStartTimeMs;
    const diffMs = Math.max(0, now.getTime() - new Date(now).setHours(stdHour, stdMin, 0, 0));
    const lateMinutes = isLate ? Math.floor(diffMs / 60000) : 0;

    const newRec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeNip: currentEmployee.nip,
      employeeName: currentEmployee.name,
      date: todayStr,
      status: isLate ? 'Terlambat' : 'Hadir',
      clockInTime: timeStr,
      clockInLat: currentCoords?.lat,
      clockInLng: currentCoords?.lng,
      workLocationId: locMatch?.id,
      distanceMeters: distance,
      locationVerified: verified,
      lateMinutes,
      workHours: 8,
      overtimeHours: 0,
      notes: isLate ? `Terlambat ${lateMinutes} menit` : 'Tepat waktu',
    };

    setAttendanceRecords((prev) => [
      ...prev.filter((r) => !(r.employeeId === currentEmployee.id && r.date === todayStr)),
      newRec,
    ]);

    return {
      success: true,
      message: `Absen Masuk Berhasil! ${verified && locMatch ? `Terverifikasi di ${locMatch.name} (${distance}m)` : ''}`,
      distance,
    };
  };

  // Clock Out (always allowed, logs coords)
  const clockOut = (currentCoords?: { lat: number; lng: number }): { success: boolean; message: string } => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const existing = attendanceRecords.find(
      (r) => r.employeeId === currentEmployee.id && r.date === todayStr
    );

    if (!existing) {
      return { success: false, message: 'Anda belum melakukan absen masuk hari ini.' };
    }

    // Calculate hours worked
    let workHours = 8;
    let overtimeHours = 0;
    if (existing.clockInTime) {
      const [inH, inM] = existing.clockInTime.split(':').map(Number);
      const inTimeMs = new Date(now).setHours(inH, inM, 0, 0);
      const hoursDiff = (now.getTime() - inTimeMs) / 3600000;
      workHours = Math.max(0, Number(hoursDiff.toFixed(1)));
      if (workHours > 8.5) {
        overtimeHours = Number((workHours - 8.5).toFixed(1));
      }
    }

    const updated: AttendanceRecord = {
      ...existing,
      clockOutTime: timeStr,
      clockOutLat: currentCoords?.lat,
      clockOutLng: currentCoords?.lng,
      workHours,
      overtimeHours,
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === existing.id ? updated : r))
    );

    return {
      success: true,
      message: `Absen Pulang berhasil dicatat pukul ${timeStr}. Total kerja: ${workHours} jam (${overtimeHours > 0 ? `Lembur ${overtimeHours} jam` : 'Standar'}).`,
    };
  };

  // Mark all employees present today
  const markAllPresentToday = () => {
    const timeStr = '08:20:00';
    const updated = [...attendanceRecords];

    employees.forEach((emp) => {
      const exists = updated.find((r) => r.employeeId === emp.id && r.date === todayStr);
      if (!exists) {
        updated.push({
          id: `att-mass-${emp.id}-${Date.now()}`,
          employeeId: emp.id,
          employeeNip: emp.nip,
          employeeName: emp.name,
          date: todayStr,
          status: 'Hadir',
          clockInTime: timeStr,
          clockOutTime: '17:30:00',
          locationVerified: true,
          lateMinutes: 0,
          workHours: 8.5,
          overtimeHours: 0,
          notes: 'Ditandai Hadir Massal oleh HRD',
          isManualEdit: true,
        });
      }
    });

    setAttendanceRecords(updated);
  };

  const upsertAttendanceRecord = (record: Partial<AttendanceRecord> & { employeeId: string; date: string }) => {
    const emp = employees.find((e) => e.id === record.employeeId);
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex((r) => r.employeeId === record.employeeId && r.date === record.date);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...record, isManualEdit: true };
        return copy;
      }
      return [
        ...prev,
        {
          id: `att-manual-${Date.now()}`,
          employeeNip: emp?.nip || '',
          employeeName: emp?.name || '',
          status: 'Hadir',
          locationVerified: true,
          lateMinutes: 0,
          workHours: 8,
          overtimeHours: 0,
          ...record,
          isManualEdit: true,
        },
      ];
    });
  };

  // Leave Management (9 types, date collision check, multi-tier approval)
  const applyLeave = (
    data: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status' | 'managerStatus' | 'hrdStatus'>
  ): { success: boolean; message: string } => {
    // Check balance if annual leave
    const emp = employees.find((e) => e.id === data.employeeId);
    if (!emp) return { success: false, message: 'Data karyawan tidak ditemukan.' };

    if (data.leaveType === 'Cuti Tahunan' && emp.annualLeaveBalance < data.totalDays) {
      return {
        success: false,
        message: `Saldo cuti tahunan tidak mencukupi (Tersisa: ${emp.annualLeaveBalance} hari, Diajukan: ${data.totalDays} hari).`,
      };
    }

    // Check overlapping leave dates
    const hasOverlap = leaveRequests.some(
      (lr) =>
        lr.employeeId === data.employeeId &&
        lr.status !== 'Ditolak' &&
        lr.status !== 'Dibatalkan' &&
        !(data.endDate < lr.startDate || data.startDate > lr.endDate)
    );

    if (hasOverlap) {
      return {
        success: false,
        message: 'Pengajuan cuti bentrok dengan jadwal cuti/izin Anda yang sudah ada.',
      };
    }

    const reqId = `leave-${Date.now()}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const supervisor = employees.find((e) => e.nip === emp.managerNip);

    const newReq: LeaveRequest = {
      ...data,
      id: reqId,
      appliedAt: nowStr,
      status: 'Menunggu Atasan',
      managerNip: emp.managerNip,
      managerName: supervisor?.name || 'Atasan Langsung',
      managerStatus: 'Pending',
      hrdStatus: 'Pending',
    };

    setLeaveRequests((prev) => [newReq, ...prev]);
    return { success: true, message: 'Pengajuan cuti berhasil dikirim ke Atasan Langsung untuk verifikasi.' };
  };

  const approveLeaveByManager = (requestId: string, notes?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLeaveRequests((prev) =>
      prev.map((lr) => {
        if (lr.id === requestId) {
          return {
            ...lr,
            managerStatus: 'Disetujui',
            managerApprovedAt: nowStr,
            managerNotes: notes || lr.managerNotes,
            status: 'Menunggu HRD', // passes to tier 2 HRD
          };
        }
        return lr;
      })
    );
  };

  const rejectLeaveByManager = (requestId: string, notes?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLeaveRequests((prev) =>
      prev.map((lr) => {
        if (lr.id === requestId) {
          return {
            ...lr,
            managerStatus: 'Ditolak',
            managerApprovedAt: nowStr,
            managerNotes: notes || lr.managerNotes,
            status: 'Ditolak',
          };
        }
        return lr;
      })
    );
  };

  // When HRD approves: automatically deduct balance and mark attendance records for those days
  const approveLeaveByHrd = (requestId: string, notes?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const target = leaveRequests.find((r) => r.id === requestId);
    if (!target) return;

    setLeaveRequests((prev) =>
      prev.map((lr) => {
        if (lr.id === requestId) {
          return {
            ...lr,
            hrdStatus: 'Disetujui',
            hrdApprovedAt: nowStr,
            hrdNotes: notes || lr.hrdNotes,
            status: 'Disetujui',
          };
        }
        return lr;
      })
    );

    // Deduct leave balance if Cuti Tahunan
    if (target.leaveType === 'Cuti Tahunan') {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === target.employeeId
            ? { ...e, annualLeaveBalance: Math.max(0, e.annualLeaveBalance - target.totalDays) }
            : e
        )
      );
    }

    // Auto mark attendance for range
    const start = new Date(target.startDate);
    const end = new Date(target.endDate);
    const newAttRecords = [...attendanceRecords];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

      const dateStr = d.toISOString().split('T')[0];
      const existingIdx = newAttRecords.findIndex(
        (a) => a.employeeId === target.employeeId && a.date === dateStr
      );

      const statusMap: AttendanceStatus = target.leaveType === 'Cuti Sakit' ? 'Sakit' : 'Cuti';

      if (existingIdx !== -1) {
        newAttRecords[existingIdx] = {
          ...newAttRecords[existingIdx],
          status: statusMap,
          notes: `${target.leaveType} disetujui HRD`,
        };
      } else {
        newAttRecords.push({
          id: `att-leave-${Date.now()}-${dateStr}`,
          employeeId: target.employeeId,
          employeeNip: target.employeeNip,
          employeeName: target.employeeName,
          date: dateStr,
          status: statusMap,
          locationVerified: true,
          lateMinutes: 0,
          workHours: 0,
          overtimeHours: 0,
          notes: `${target.leaveType} disetujui HRD`,
        });
      }
    }

    setAttendanceRecords(newAttRecords);
  };

  const rejectLeaveByHrd = (requestId: string, notes?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setLeaveRequests((prev) =>
      prev.map((lr) => {
        if (lr.id === requestId) {
          return {
            ...lr,
            hrdStatus: 'Ditolak',
            hrdApprovedAt: nowStr,
            hrdNotes: notes || lr.hrdNotes,
            status: 'Ditolak',
          };
        }
        return lr;
      })
    );
  };

  // Cancel leave restores balance if previously approved
  const cancelLeave = (requestId: string) => {
    const target = leaveRequests.find((r) => r.id === requestId);
    if (!target) return;

    if (target.status === 'Disetujui' && target.leaveType === 'Cuti Tahunan') {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === target.employeeId
            ? { ...e, annualLeaveBalance: e.annualLeaveBalance + target.totalDays }
            : e
        )
      );
    }

    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === requestId ? { ...lr, status: 'Dibatalkan' } : lr))
    );
  };

  const generateAnnualLeaveQuotaAll = (quota: number) => {
    setEmployees((prev) =>
      prev.map((e) => ({ ...e, annualLeaveBalance: quota }))
    );
  };

  const updateEmployeeLeaveBalance = (empId: string, newBalance: number) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, annualLeaveBalance: newBalance } : e))
    );
  };

  // Payroll Engine
  const generateMonthlyPayroll = (month: number, year: number) => {
    const periodId = `prd-${year}-${String(month).padStart(2, '0')}`;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const newPayslips: Payslip[] = [];
    let grossSum = 0;
    let dedSum = 0;
    let netSum = 0;

    employees.forEach((emp) => {
      const position = positions.find((p) => p.id === emp.positionId);
      const empAttendance = attendanceRecords.filter(
        (a) => a.employeeId === emp.id && a.date >= startDate && a.date <= endDate
      );

      const payslip = calculateEmployeePayslip(
        emp,
        position,
        company,
        periodId,
        empAttendance,
        22 // working days
      );

      newPayslips.push(payslip);
      grossSum += payslip.grossIncome;
      dedSum += payslip.totalDeductions;
      netSum += payslip.netSalary;
    });

    const newPeriod: PayrollPeriod = {
      id: periodId,
      month,
      year,
      startDate,
      endDate,
      workingDaysCount: 22,
      status: 'Dihitung',
      generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      totalGross: grossSum,
      totalDeductions: dedSum,
      totalNet: netSum,
      employeeCount: employees.length,
    };

    setPayrollPeriods((prev) => [
      newPeriod,
      ...prev.filter((p) => p.id !== periodId),
    ]);

    setPayslips((prev) => [
      ...prev.filter((p) => p.periodId !== periodId),
      ...newPayslips,
    ]);
  };

  const markPayrollPaid = (periodId: string) => {
    const nowStr = new Date().toISOString().split('T')[0];
    setPayrollPeriods((prev) =>
      prev.map((p) => (p.id === periodId ? { ...p, status: 'Dibayar', paidAt: nowStr } : p))
    );
    setPayslips((prev) =>
      prev.map((s) => (s.periodId === periodId ? { ...s, status: 'Dibayar', paymentDate: nowStr } : s))
    );
  };

  const updatePayslipOverrides = (payslipId: string, bonus: number, loan: number, coop: number) => {
    setPayslips((prev) =>
      prev.map((s) => {
        if (s.id === payslipId) {
          const gross = s.baseSalary + s.jobAllowance + s.transportAllowance + s.mealAllowance + s.overtimePay + bonus;
          const ded = s.bpjsKesEmployee + s.bpjsTkJhtEmployee + s.pph21 + s.alphaDeduction + loan + coop;
          return {
            ...s,
            performanceBonus: bonus,
            loanDeduction: loan,
            cooperativeDeduction: coop,
            grossIncome: gross,
            totalDeductions: ded,
            netSalary: Math.max(0, gross - ded),
          };
        }
        return s;
      })
    );
  };

  // Recruitment
  const addJobOpening = (job: Omit<JobOpening, 'id' | 'postedDate'>) => {
    const newJob: JobOpening = {
      ...job,
      id: `job-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
    };
    setJobOpenings((prev) => [...prev, newJob]);
  };

  const updateJobOpening = (id: string, job: Partial<JobOpening>) => {
    setJobOpenings((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...job } : j))
    );
  };

  const updateApplicantStage = (applicantId: string, stage: Applicant['stage']) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, stage } : a))
    );
  };

  const updateApplicantRating = (applicantId: string, rating: number) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, rating } : a))
    );
  };

  // Convert applicant to employee
  const convertApplicantToEmployee = (applicantId: string): Employee => {
    const applicant = applicants.find((a) => a.id === applicantId);
    if (!applicant) throw new Error('Pelamar tidak ditemukan');

    const job = jobOpenings.find((j) => j.id === applicant.jobOpeningId);
    const pos = positions.find((p) => p.departmentId === job?.departmentId) || positions[0];

    const newEmp = addEmployee({
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      departmentId: job?.departmentId || departments[0]?.id,
      positionId: pos?.id,
      baseSalary: applicant.expectedSalary || 6000000,
      role: 'employee',
      employmentStatus: 'PKWT',
    });

    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicantId ? { ...a, stage: 'Hired', isConvertedToEmployee: true } : a
      )
    );

    return newEmp;
  };

  // Performance
  const addPerformanceEvaluation = (
    evalData: Omit<PerformanceEvaluation, 'id' | 'evaluatedAt' | 'finalScore' | 'grade'>
  ) => {
    const finalScore = Number(
      (
        evalData.kpiScore * 0.4 +
        evalData.disciplineScore * 0.2 +
        evalData.teamworkScore * 0.2 +
        evalData.leadershipScore * 0.2
      ).toFixed(1)
    );

    let grade: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
    if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 70) grade = 'C';
    else if (finalScore >= 60) grade = 'D';
    else grade = 'E';

    const newEval: PerformanceEvaluation = {
      ...evalData,
      id: `eval-${Date.now()}`,
      finalScore,
      grade,
      evaluatedAt: new Date().toISOString().split('T')[0],
    };

    setPerformanceEvaluations((prev) => [newEval, ...prev]);
  };

  const updatePerformanceEvaluation = (id: string, evalData: Partial<PerformanceEvaluation>) => {
    setPerformanceEvaluations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...evalData } : e))
    );
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'publishedDate'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      publishedDate: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Smart Alerts
  const contractAlerts = useMemo(() => {
    const today = new Date();
    const alerts: { contract: EmployeeContract; employee: Employee; daysLeft: number }[] = [];

    contracts.forEach((c) => {
      if (c.type === 'PKWT' && c.endDate && c.isActive) {
        const end = new Date(c.endDate);
        const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 90) {
          const emp = employees.find((e) => e.id === c.employeeId);
          if (emp) alerts.push({ contract: c, employee: emp, daysLeft: diffDays });
        }
      }
    });

    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [contracts, employees]);

  const documentAlerts = useMemo(() => {
    const today = new Date();
    const alerts: { document: EmployeeDocument; employee: Employee; daysLeft: number }[] = [];

    documents.forEach((d) => {
      if (d.expiryDate) {
        const exp = new Date(d.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 60) {
          const emp = employees.find((e) => e.id === d.employeeId);
          if (emp) alerts.push({ document: d, employee: emp, daysLeft: diffDays });
        }
      }
    });

    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [documents, employees]);

  const upcomingBirthdays = useMemo(() => {
    const currentMonthNum = new Date().getMonth() + 1;
    const currentYearNum = new Date().getFullYear();
    const list: { employee: Employee; day: number; age: number }[] = [];

    employees.forEach((emp) => {
      if (emp.birthDate) {
        const parts = emp.birthDate.split('-');
        const bMonth = parseInt(parts[1], 10);
        const bDay = parseInt(parts[2], 10);
        const bYear = parseInt(parts[0], 10);

        if (bMonth === currentMonthNum) {
          list.push({
            employee: emp,
            day: bDay,
            age: currentYearNum - bYear,
          });
        }
      }
    });

    return list.sort((a, b) => a.day - b.day);
  }, [employees]);

  const pendingLeaveApprovals = useMemo(() => {
    if (currentRole === 'hrd') {
      return leaveRequests.filter((lr) => lr.status === 'Menunggu HRD');
    }
    if (currentRole === 'manager') {
      // Show requests of subordinates or requests where current employee is manager
      return leaveRequests.filter(
        (lr) => lr.status === 'Menunggu Atasan' && lr.managerNip === currentEmployee.nip
      );
    }
    return [];
  }, [leaveRequests, currentRole, currentEmployee.nip]);

  // Batch import applier
  const applyImportedBatch = (data: {
    createdEmployees: Employee[];
    updatedEmployees: Employee[];
    newDepartments: Department[];
    newPositions: JobPosition[];
    newContracts: EmployeeContract[];
    newSalaryHistories: SalaryHistory[];
    newCareerHistories: CareerHistory[];
  }) => {
    if (data.newDepartments.length > departments.length) {
      setDepartments(data.newDepartments);
    }
    if (data.newPositions.length > positions.length) {
      setPositions(data.newPositions);
    }

    setEmployees((prev) => {
      const map = new Map(prev.map((e) => [e.id, e]));
      data.updatedEmployees.forEach((u) => map.set(u.id, u));
      data.createdEmployees.forEach((c) => map.set(c.id, c));
      return Array.from(map.values());
    });

    if (data.newContracts.length > 0) {
      setContracts((prev) => [...prev, ...data.newContracts]);
    }
    if (data.newSalaryHistories.length > 0) {
      setSalaryHistories((prev) => [...prev, ...data.newSalaryHistories]);
    }
    if (data.newCareerHistories.length > 0) {
      setCareerHistories((prev) => [...prev, ...data.newCareerHistories]);
    }
  };

  // Export helper
  const exportToCsvOrExcel = (filename: string, data: Record<string, any>[], format: 'csv' | 'xlsx' = 'xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    if (format === 'csv') {
      XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
    } else {
      XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx' });
    }
  };

  // Reset to demo data
  const resetToDemoData = () => {
    localStorage.clear();
    setCompany(initialCompanyProfile);
    setLocations(initialLocations);
    setDepartments(initialDepartments);
    setPositions(initialPositions);
    setEmployees(initialEmployees);
    setContracts(initialContracts);
    setDocuments(initialDocuments);
    setSalaryHistories(initialSalaryHistories);
    setCareerHistories(initialCareerHistories);
    setAttendanceRecords(initialAttendanceRecords);
    setLeaveRequests(initialLeaveRequests);
    setPayrollPeriods(initialPayrollPeriods);
    setPayslips([]);
    setJobOpenings(initialJobOpenings);
    setApplicants(initialApplicants);
    setPerformanceEvaluations(initialPerformanceEvaluations);
    setAnnouncements(initialAnnouncements);
    setCurrentEmployeeId(initialEmployees[1].id);
    setCurrentRoleOverride(null);
  };

  return (
    <HRISContext.Provider
      value={{
        isAuthenticated,
        currentEmployee,
        currentRole,
        setCurrentEmployeeId,
        setCurrentRole,
        login,
        logout,
        loginAsDemo,
        loginLogs,
        toggleEmployeeActive,
        resetEmployeePassword,
        updateEmployeeRole,
        company,
        updateCompanyProfile,
        locations,
        departments,
        positions,
        employees,
        contracts,
        documents,
        salaryHistories,
        careerHistories,
        addLocation,
        updateLocation,
        deleteLocation,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addPosition,
        updatePosition,
        deletePosition,
        massUpdatePositionAllowancesByLevel,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        assignEmployeeLocations,
        extendContractOneYear,
        extendDocumentOneYear,
        attendanceRecords,
        todayAttendance,
        clockIn,
        clockOut,
        markAllPresentToday,
        upsertAttendanceRecord,
        leaveRequests,
        applyLeave,
        approveLeaveByManager,
        rejectLeaveByManager,
        approveLeaveByHrd,
        rejectLeaveByHrd,
        cancelLeave,
        generateAnnualLeaveQuotaAll,
        updateEmployeeLeaveBalance,
        payrollPeriods,
        payslips,
        generateMonthlyPayroll,
        markPayrollPaid,
        updatePayslipOverrides,
        jobOpenings,
        applicants,
        addJobOpening,
        updateJobOpening,
        updateApplicantStage,
        updateApplicantRating,
        convertApplicantToEmployee,
        performanceEvaluations,
        addPerformanceEvaluation,
        updatePerformanceEvaluation,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        contractAlerts,
        documentAlerts,
        upcomingBirthdays,
        pendingLeaveApprovals,
        applyImportedBatch,
        exportToCsvOrExcel,
        resetToDemoData,
      }}
    >
      {children}
    </HRISContext.Provider>
  );
};

export const useHRIS = () => {
  const context = useContext(HRISContext);
  if (!context) {
    throw new Error('useHRIS must be used within an HRISProvider');
  }
  return context;
};
