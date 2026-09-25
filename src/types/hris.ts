export type Role = 'hrd' | 'manager' | 'employee';

export type EmploymentStatus = 'PKWT' | 'PKWTT' | 'Magang' | 'Probation';
export type Gender = 'L' | 'P';
export type AttendanceStatus = 'Hadir' | 'WFH' | 'Terlambat' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpha' | 'Libur';
export type LeaveStatus = 'Menunggu Atasan' | 'Menunggu HRD' | 'Disetujui' | 'Ditolak' | 'Dibatalkan';
export type PayrollStatus = 'Draft' | 'Dihitung' | 'Disetujui' | 'Dibayar';
export type ApplicantStage = 'Screening' | 'Interview HRD' | 'Interview User' | 'Offering' | 'Hired' | 'Ditolak';

export interface WorkLocation {
  id: string;
  code: string;
  name: string;
  type: 'Kantor Pusat' | 'Kantor Cabang' | 'Gudang' | 'Proyek' | 'Lokasi Klien';
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters, e.g. 100
  isMandatoryRadius: boolean;
  googleMapsUrl?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headEmployeeId?: string; // NIP or employee ID
  description?: string;
}

export interface JobPosition {
  id: string;
  code: string;
  departmentId: string;
  title: string;
  level: number; // Grade 1 - 7
  baseSalaryMin: number;
  baseSalaryMax: number;
  allowanceJob: number; // Tunjangan Jabatan
  dailyTransport: number; // Tarif Transport per hari hadir kantor
  dailyMeal: number; // Tarif Makan per hari hadir (kantor + WFH)
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  type: 'KTP' | 'NPWP' | 'BPJS' | 'Ijazah' | 'Sertifikat' | 'Kontrak' | 'Lainnya';
  title: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string; // for ≤60 days alert
  fileUrl?: string;
  notes?: string;
}

export interface EmployeeContract {
  id: string;
  employeeId: string;
  contractNumber: string;
  type: EmploymentStatus;
  startDate: string;
  endDate?: string; // for PKWT ≤90 days alert
  notes?: string;
  isActive: boolean;
}

export interface SalaryHistory {
  id: string;
  employeeId: string;
  effectiveDate: string;
  baseSalary: number;
  jobAllowance: number;
  reason: 'Kenaikan Berkala' | 'Promosi' | 'Penyesuaian' | 'Awal Masuk';
}

export interface CareerHistory {
  id: string;
  employeeId: string;
  effectiveDate: string;
  departmentName: string;
  positionTitle: string;
  type: 'Pengangkatan' | 'Promosi' | 'Mutasi' | 'Demosi';
  notes?: string;
}

export interface Employee {
  id: string;
  nip: string; // e.g. NSA-2024-001
  name: string;
  email: string;
  phone: string;
  nik: string;
  npwp?: string;
  hasNpwp: boolean;
  birthDate: string;
  birthPlace: string;
  gender: Gender;
  religion: string;
  maritalStatus: 'Belum Kawin' | 'Kawin' | 'Cerai';
  ptkpStatus: 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  bpjsKesNumber?: string;
  bpjsTkNumber?: string;
  
  // Employment
  departmentId: string;
  positionId: string;
  managerNip?: string; // NIP of direct manager
  employmentStatus: EmploymentStatus;
  joinDate: string;
  role: Role; // hrd | manager | employee
  avatarUrl?: string;
  isActive: boolean;

  // Compensation Overrides (prioritas: khusus karyawan > jabatan > perusahaan)
  baseSalary: number;
  customJobAllowance?: number;
  customDailyTransport?: number;
  customDailyMeal?: number;

  // Geofencing Work Locations
  primaryLocationId?: string; // main location
  allowedLocationIds: string[]; // multi locations permitted
  
  // Leave Quota
  annualLeaveBalance: number; // default 12 days
  
  // System login
  username: string;
  password?: string;
  lastLogin?: string;
}

export interface LoginLog {
  id: string;
  employeeId: string;
  employeeName: string;
  nip: string;
  role: Role;
  timestamp: string;
  ipAddress?: string;
  device?: string;
  status: 'Berhasil' | 'Gagal';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeNip: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  clockInTime?: string; // HH:mm:ss
  clockOutTime?: string; // HH:mm:ss
  clockInLat?: number;
  clockInLng?: number;
  clockOutLat?: number;
  clockOutLng?: number;
  workLocationId?: string;
  distanceMeters?: number;
  locationVerified: boolean;
  lateMinutes: number;
  workHours: number;
  overtimeHours: number;
  notes?: string;
  isManualEdit?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeNip: string;
  employeeName: string;
  departmentName: string;
  leaveType: 
    | 'Cuti Tahunan'
    | 'Cuti Sakit'
    | 'Cuti Menikah'
    | 'Cuti Melahirkan'
    | 'Cuti Duka / Kemalangan'
    | 'Cuti Khitanan/Baptis'
    | 'Cuti Haji/Umrah'
    | 'Cuti Alasan Penting'
    | 'Izin Khusus';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  appliedAt: string;
  
  // Two-tiered approval
  managerNip?: string;
  managerName?: string;
  managerStatus: 'Pending' | 'Disetujui' | 'Ditolak';
  managerApprovedAt?: string;
  managerNotes?: string;

  hrdStatus: 'Pending' | 'Disetujui' | 'Ditolak';
  hrdApprovedAt?: string;
  hrdNotes?: string;
}

export interface PayrollPeriod {
  id: string;
  month: number; // 1 - 12
  year: number; // e.g. 2026
  startDate: string;
  endDate: string;
  workingDaysCount: number; // standard e.g. 20-22 days
  status: PayrollStatus;
  generatedAt: string;
  paidAt?: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
}

export interface Payslip {
  id: string;
  periodId: string;
  employeeId: string;
  nip: string;
  employeeName: string;
  departmentName: string;
  positionTitle: string;
  bankName: string;
  bankAccountNumber: string;
  hasNpwp: boolean;
  ptkpStatus: string;

  // Days attended
  officeWorkDays: number; // Hadir kantor
  wfhWorkDays: number; // WFH
  totalPresentDays: number; // office + WFH
  leaveDays: number;
  sickDays: number;
  permitDays: number;
  alphaDays: number;
  overtimeHours: number;

  // Earnings
  baseSalary: number;
  jobAllowance: number;
  dailyTransportRate: number;
  transportAllowance: number; // Transport calculation label
  dailyMealRate: number;
  mealAllowance: number; // Meal calculation label
  overtimePay: number; // 1.5x base hourly rate (base / 173 * 1.5 * hours)
  performanceBonus: number;
  grossIncome: number;

  // Deductions
  bpjsKesEmployee: number; // 1%
  bpjsTkJhtEmployee: number; // 2%
  pph21: number; // progressive tax
  alphaDeduction: number;
  loanDeduction: number;
  cooperativeDeduction: number;
  totalDeductions: number;

  // Net Pay
  netSalary: number;

  // Company Costs (Informatif)
  bpjsKesCompany: number; // 4%
  bpjsTkJhtCompany: number; // 3.7%
  bpjsTkJkkCompany: number; // 0.24%
  bpjsTkJkmCompany: number; // 0.3%
  totalCompanyBenefit: number;

  status: 'Draft' | 'Dibayar';
  paymentDate?: string;
}

export interface JobOpening {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  quota: number;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string[];
  status: 'Buka' | 'Tutup';
  postedDate: string;
}

export interface Applicant {
  id: string;
  jobOpeningId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  source: 'LinkedIn' | 'Jobstreet' | 'Karier Web' | 'Referensi' | 'Walk-in';
  stage: ApplicantStage;
  rating: number; // 1 to 5 stars
  expectedSalary: number;
  notes?: string;
  appliedDate: string;
  isConvertedToEmployee?: boolean;
}

export interface PerformanceEvaluation {
  id: string;
  employeeId: string;
  employeeNip: string;
  employeeName: string;
  departmentName: string;
  period: string; // e.g. "Q3 2026" or "Semester 1 2026"
  evaluatorNip: string;
  evaluatorName: string;
  kpiScore: number; // 0 - 100
  disciplineScore: number; // 0 - 100
  teamworkScore: number; // 0 - 100
  leadershipScore: number; // 0 - 100
  finalScore: number; // Weighted 0 - 100
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  notes: string;
  strengths: string;
  improvements: string;
  status: 'Draft' | 'Submitted' | 'Final';
  evaluatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Kebijakan' | 'Libur Nasional' | 'Acara Kantor' | 'HR Info';
  content: string;
  publishedDate: string;
  authorName: string;
  isPinned: boolean;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  npwp: string;
  payrollSignerName: string;
  payrollSignerPosition: string;
  standardWorkStartTime: string; // "08:30"
  standardWorkEndTime: string; // "17:30"
  lateGraceMinutes: number; // 15 mins
  isGeofencingActive: boolean; // default false as requested
  gpsToleranceMeters: number; // default 50m
  transportExcludesWfh: boolean; // default true
  mealIncludesWfh: boolean; // default true
  overtimeMultiplier: number; // 1.5
  overtimeBaseDivisor: number; // 173
  googleSheetsConnected: boolean;
  googleDriveConnected: boolean;
}
