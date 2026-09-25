import * as XLSX from 'xlsx';
import {
  Employee,
  Department,
  JobPosition,
  WorkLocation,
  EmploymentStatus,
  Gender,
  Role,
  EmployeeContract,
  SalaryHistory,
  CareerHistory,
} from '../types/hris';

export interface ParsedEmployeeRow {
  rowNumber: number;
  original: Record<string, any>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Normalized Fields
  name: string;
  nip?: string;
  nik?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: Gender;
  religion?: string;
  maritalStatus?: 'Belum Kawin' | 'Kawin' | 'Cerai';
  ptkpStatus?: 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  npwp?: string;
  hasNpwp: boolean;
  bpjsKesNumber?: string;
  bpjsTkNumber?: string;

  deptCodeOrName?: string;
  positionCodeOrName?: string;
  managerNip?: string;
  employmentStatus: EmploymentStatus;
  joinDate: string;
  contractEndDate?: string;
  
  baseSalary: number;
  jobAllowance?: number;
  dailyTransport?: number;
  dailyMeal?: number;
  workLocationCode?: string;
}

export interface ImportOptions {
  duplicateAction: 'skip' | 'update'; // match by NIP -> Email -> NIK
  createLoginAccount: boolean;
  defaultPassword?: string;
  grantLeaveQuota: boolean;
  createSalaryHistory: boolean;
  autoCreateDeptPosition: boolean;
  promoteSupervisorsToManager: boolean;
  defaultWorkLocationId?: string;
}

/**
 * Normalizes string keys and maps synonyms to canonical field names
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parses diverse date formats: dd/mm/yyyy, yyyy-mm-dd, or Excel serial numbers
 */
export function parseDateFlexible(val: any): string | undefined {
  if (!val) return undefined;
  
  // Excel Serial Number (e.g. 45000)
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  const str = String(val).trim();
  if (!str) return undefined;

  // Format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Format YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return undefined;
}

/**
 * Parses numeric currency strings like "12.500.000", "Rp 8.000.000", "8000000"
 */
export function parseCurrencyFlexible(val: any, fallback: number = 0): number {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return Math.max(0, Math.round(val));
  
  const cleanStr = String(val)
    .replace(/[^\d.,-]/g, '')
    .trim();

  // If Indonesian dot thousands separator e.g. "12.500.000"
  if (cleanStr.includes('.') && !cleanStr.includes(',')) {
    const parts = cleanStr.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      return parseInt(cleanStr.replace(/\./g, ''), 10) || fallback;
    }
  }

  // Handle standard decimal or comma
  const normalized = cleanStr.replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? fallback : Math.max(0, Math.round(num));
}

/**
 * Downloads a pre-formatted Excel template for importing employees
 */
export function downloadEmployeeTemplate(): void {
  const sampleData = [
    {
      'Nama Lengkap (Wajib)': 'Aditya Pratama, S.Kom',
      'NIP (Kosongkan utk auto)': 'NSA-2026-009',
      'NIK': '3171012304900001',
      'Email': 'aditya.pratama@pt-nsa.co.id',
      'No HP': '081298765432',
      'Tgl Lahir': '15/04/1992',
      'Tempat Lahir': 'Jakarta',
      'Jenis Kelamin': 'L',
      'Agama': 'Islam',
      'Status Nikah': 'Kawin',
      'Status PTKP': 'K/1',
      'Alamat': 'Jl. Kemang Raya No. 45, Jakarta Selatan',
      'Nama Bank': 'BCA',
      'No Rekening': '8830192831',
      'Atas Nama Rekening': 'Aditya Pratama',
      'NPWP': '09.234.567.8-012.000',
      'No BPJS Kesehatan': '0001234567890',
      'No BPJS Ketenagakerjaan': '19028374650',
      'Departemen': 'Teknologi Informasi',
      'Jabatan': 'Senior Fullstack Engineer',
      'NIP Atasan': 'NSA-2024-002',
      'Status Kerja': 'PKWTT',
      'Tgl Masuk': '01/02/2026',
      'Akhir Kontrak': '',
      'Gaji Pokok': '14.500.000',
      'Tunjangan Jabatan': '2.000.000',
      'Tarif Transport Harian': '45.000',
      'Tarif Makan Harian': '40.000',
      'Kode Lokasi Kerja': 'HQ-SCBD',
    },
    {
      'Nama Lengkap (Wajib)': 'Nadia Safitri, S.E',
      'NIP (Kosongkan utk auto)': '',
      'NIK': '3275016508950003',
      'Email': 'nadia.safitri@pt-nsa.co.id',
      'No HP': '081387654321',
      'Tgl Lahir': '20/08/1995',
      'Tempat Lahir': 'Bandung',
      'Jenis Kelamin': 'P',
      'Agama': 'Islam',
      'Status Nikah': 'Belum Kawin',
      'Status PTKP': 'TK/0',
      'Alamat': 'Jl. Bintaro Sektor 9, Tangerang Selatan',
      'Nama Bank': 'Mandiri',
      'No Rekening': '1230009876543',
      'Atas Nama Rekening': 'Nadia Safitri',
      'NPWP': '',
      'No BPJS Kesehatan': '0009876543210',
      'No BPJS Ketenagakerjaan': '18029384756',
      'Departemen': 'Pemasaran & Bisnis',
      'Jabatan': 'Account Executive Specialist',
      'NIP Atasan': 'NSA-2024-003',
      'Status Kerja': 'PKWT',
      'Tgl Masuk': '15/03/2026',
      'Akhir Kontrak': '15/03/2027',
      'Gaji Pokok': '8.500.000',
      'Tunjangan Jabatan': '500.000',
      'Tarif Transport Harian': '40.000',
      'Tarif Makan Harian': '35.000',
      'Kode Lokasi Kerja': 'HQ-SCBD',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Karyawan');
  XLSX.writeFile(workbook, 'Template_Impor_Karyawan_HRIS.xlsx');
}

/**
 * Reads binary buffer / file, maps columns, and provides validation diagnostics
 */
export function parseEmployeeExcelFile(fileBuffer: ArrayBuffer): ParsedEmployeeRow[] {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: '',
  });

  const parsedList: ParsedEmployeeRow[] = [];

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // header is row 1
    const errors: string[] = [];
    const warnings: string[] = [];

    // Map columns via key normalization
    const mapped: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      const norm = normalizeKey(key);

      if (norm.includes('nama') || norm.includes('fullname')) {
        mapped.name = String(val).trim();
      } else if (norm.includes('nip') && !norm.includes('atasan')) {
        mapped.nip = String(val).trim();
      } else if (norm.includes('nik') || norm.includes('ktp')) {
        mapped.nik = String(val).trim();
      } else if (norm.includes('email') || norm.includes('surel')) {
        mapped.email = String(val).trim().toLowerCase();
      } else if (norm.includes('hp') || norm.includes('telp') || norm.includes('telepon')) {
        mapped.phone = String(val).trim();
      } else if (norm.includes('tgllahir') || norm.includes('tanggallahir') || norm.includes('birthdate')) {
        mapped.birthDate = parseDateFlexible(val);
      } else if (norm.includes('tempatlahir')) {
        mapped.birthPlace = String(val).trim();
      } else if (norm.includes('kelamin') || norm.includes('gender')) {
        const gStr = String(val).trim().toUpperCase();
        mapped.gender = gStr.startsWith('P') ? 'P' : 'L';
      } else if (norm.includes('agama')) {
        mapped.religion = String(val).trim();
      } else if (norm.includes('nikah') || norm.includes('marital')) {
        const m = String(val).trim();
        mapped.maritalStatus = m.includes('Kawin') ? (m.includes('Belum') ? 'Belum Kawin' : 'Kawin') : 'Belum Kawin';
      } else if (norm.includes('ptkp')) {
        mapped.ptkpStatus = String(val).trim();
      } else if (norm.includes('alamat')) {
        mapped.address = String(val).trim();
      } else if (norm.includes('namabank') || norm.includes('bank')) {
        mapped.bankName = String(val).trim();
      } else if (norm.includes('rekening') && !norm.includes('nama')) {
        mapped.bankAccountNumber = String(val).trim();
      } else if (norm.includes('atasnama') || norm.includes('pemilikrek')) {
        mapped.bankAccountHolder = String(val).trim();
      } else if (norm.includes('npwp')) {
        mapped.npwp = String(val).trim();
      } else if (norm.includes('bpjskes')) {
        mapped.bpjsKesNumber = String(val).trim();
      } else if (norm.includes('bpjstk') || norm.includes('jamsostek')) {
        mapped.bpjsTkNumber = String(val).trim();
      } else if (norm.includes('dept') || norm.includes('departemen')) {
        mapped.deptCodeOrName = String(val).trim();
      } else if (norm.includes('jabat') || norm.includes('posisi')) {
        mapped.positionCodeOrName = String(val).trim();
      } else if (norm.includes('atasan') || norm.includes('supervisor')) {
        mapped.managerNip = String(val).trim();
      } else if (norm.includes('statuskerja') || norm.includes('tipekontrak')) {
        const s = String(val).trim().toUpperCase();
        if (s.includes('PKWTT') || s.includes('TETAP')) mapped.employmentStatus = 'PKWTT';
        else if (s.includes('MAGANG')) mapped.employmentStatus = 'Magang';
        else mapped.employmentStatus = 'PKWT';
      } else if (norm.includes('tglmasuk') || norm.includes('tanggalmasuk') || norm.includes('joindate')) {
        mapped.joinDate = parseDateFlexible(val);
      } else if (norm.includes('akhirkontrak') || norm.includes('selesaiko')) {
        mapped.contractEndDate = parseDateFlexible(val);
      } else if (norm.includes('gajipokok') || norm.includes('gaji')) {
        mapped.baseSalary = parseCurrencyFlexible(val, 5000000);
      } else if (norm.includes('tunjanganjabat') || norm.includes('tunjjabat')) {
        mapped.jobAllowance = parseCurrencyFlexible(val, 0);
      } else if (norm.includes('transport')) {
        mapped.dailyTransport = parseCurrencyFlexible(val, 35000);
      } else if (norm.includes('makan')) {
        mapped.dailyMeal = parseCurrencyFlexible(val, 30000);
      } else if (norm.includes('lokasi') || norm.includes('cabang')) {
        mapped.workLocationCode = String(val).trim();
      }
    }

    // Required check: Nama Lengkap
    const name = mapped.name || '';
    if (!name) {
      errors.push('Nama Lengkap wajib diisi');
    }

    if (!mapped.joinDate) {
      warnings.push('Tanggal masuk tidak terdeteksi, default ke hari ini');
      mapped.joinDate = new Date().toISOString().split('T')[0];
    }

    const hasNpwp = Boolean(mapped.npwp && mapped.npwp.length > 5);

    parsedList.push({
      rowNumber,
      original: row,
      isValid: errors.length === 0,
      errors,
      warnings,
      name,
      nip: mapped.nip,
      nik: mapped.nik || `3171${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      email: mapped.email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@pt-nsa.co.id`,
      phone: mapped.phone || '081200000000',
      birthDate: mapped.birthDate || '1995-01-01',
      birthPlace: mapped.birthPlace || 'Jakarta',
      gender: mapped.gender || 'L',
      religion: mapped.religion || 'Islam',
      maritalStatus: mapped.maritalStatus || 'Belum Kawin',
      ptkpStatus: mapped.ptkpStatus || 'TK/0',
      address: mapped.address || 'Jakarta',
      bankName: mapped.bankName || 'BCA',
      bankAccountNumber: mapped.bankAccountNumber || '883000000',
      bankAccountHolder: mapped.bankAccountHolder || name,
      npwp: mapped.npwp,
      hasNpwp,
      bpjsKesNumber: mapped.bpjsKesNumber,
      bpjsTkNumber: mapped.bpjsTkNumber,
      deptCodeOrName: mapped.deptCodeOrName || 'Umum & Operasional',
      positionCodeOrName: mapped.positionCodeOrName || 'Staff Operasional',
      managerNip: mapped.managerNip,
      employmentStatus: mapped.employmentStatus || 'PKWT',
      joinDate: mapped.joinDate,
      contractEndDate: mapped.contractEndDate,
      baseSalary: mapped.baseSalary !== undefined ? mapped.baseSalary : 5000000,
      jobAllowance: mapped.jobAllowance,
      dailyTransport: mapped.dailyTransport,
      dailyMeal: mapped.dailyMeal,
      workLocationCode: mapped.workLocationCode,
    });
  });

  return parsedList;
}

/**
 * Resolves dependencies and executes employee import into application state
 */
export function executeEmployeeImport(
  parsedRows: ParsedEmployeeRow[],
  options: ImportOptions,
  existingEmployees: Employee[],
  existingDepartments: Department[],
  existingPositions: JobPosition[],
  existingLocations: WorkLocation[]
): {
  createdEmployees: Employee[];
  updatedEmployees: Employee[];
  newDepartments: Department[];
  newPositions: JobPosition[];
  newContracts: EmployeeContract[];
  newSalaryHistories: SalaryHistory[];
  newCareerHistories: CareerHistory[];
} {
  const year = new Date().getFullYear();
  let nipCounter = existingEmployees.length + 1;

  const currentEmployees = [...existingEmployees];
  const newDepts = [...existingDepartments];
  const newPositions = [...existingPositions];

  const createdList: Employee[] = [];
  const updatedList: Employee[] = [];
  const contracts: EmployeeContract[] = [];
  const salaryHistories: SalaryHistory[] = [];
  const careerHistories: CareerHistory[] = [];

  // Track supervisors referenced in this import
  const managerNipsToPromote = new Set<string>();

  for (const row of parsedRows) {
    if (!row.isValid) continue;

    // Check existing match by NIP -> Email -> NIK
    const existing = currentEmployees.find(
      (e) =>
        (row.nip && e.nip.toLowerCase() === row.nip.toLowerCase()) ||
        (row.email && e.email.toLowerCase() === row.email.toLowerCase()) ||
        (row.nik && e.nik === row.nik)
    );

    if (existing && options.duplicateAction === 'skip') {
      continue;
    }

    // Resolve or Auto-Create Department
    let dept = newDepts.find(
      (d) =>
        d.code.toLowerCase() === (row.deptCodeOrName || '').toLowerCase() ||
        d.name.toLowerCase() === (row.deptCodeOrName || '').toLowerCase()
    );

    if (!dept && options.autoCreateDeptPosition && row.deptCodeOrName) {
      dept = {
        id: `dept-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: row.deptCodeOrName.toUpperCase().replace(/\s+/g, '-').slice(0, 8),
        name: row.deptCodeOrName,
      };
      newDepts.push(dept);
    }

    // Resolve or Auto-Create Job Position
    let position = newPositions.find(
      (p) =>
        p.code.toLowerCase() === (row.positionCodeOrName || '').toLowerCase() ||
        p.title.toLowerCase() === (row.positionCodeOrName || '').toLowerCase()
    );

    if (!position && options.autoCreateDeptPosition && row.positionCodeOrName) {
      position = {
        id: `pos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: row.positionCodeOrName.toUpperCase().replace(/\s+/g, '-').slice(0, 8),
        departmentId: dept ? dept.id : 'dept-ops',
        title: row.positionCodeOrName,
        level: 3,
        baseSalaryMin: 5000000,
        baseSalaryMax: 10000000,
        allowanceJob: row.jobAllowance || 500000,
        dailyTransport: row.dailyTransport || 35000,
        dailyMeal: row.dailyMeal || 30000,
      };
      newPositions.push(position);
    }

    // Resolve Work Location
    let locationId = options.defaultWorkLocationId;
    if (row.workLocationCode) {
      const loc = existingLocations.find(
        (l) =>
          l.code.toLowerCase() === row.workLocationCode?.toLowerCase() ||
          l.name.toLowerCase() === row.workLocationCode?.toLowerCase()
      );
      if (loc) {
        locationId = loc.id;
      }
    }

    // Generate NIP if empty
    const nip =
      row.nip ||
      `NSA-${year}-${String(nipCounter++).padStart(3, '0')}`;

    if (row.managerNip) {
      managerNipsToPromote.add(row.managerNip.toUpperCase());
    }

    if (existing && options.duplicateAction === 'update') {
      const updated: Employee = {
        ...existing,
        name: row.name,
        email: row.email || existing.email,
        phone: row.phone || existing.phone,
        departmentId: dept ? dept.id : existing.departmentId,
        positionId: position ? position.id : existing.positionId,
        managerNip: row.managerNip || existing.managerNip,
        baseSalary: row.baseSalary,
        customJobAllowance: row.jobAllowance,
        customDailyTransport: row.dailyTransport,
        customDailyMeal: row.dailyMeal,
        primaryLocationId: locationId || existing.primaryLocationId,
        employmentStatus: row.employmentStatus,
      };
      updatedList.push(updated);
      const idx = currentEmployees.findIndex((e) => e.id === existing.id);
      if (idx !== -1) currentEmployees[idx] = updated;
    } else {
      const newEmpId = `emp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const newEmp: Employee = {
        id: newEmpId,
        nip,
        name: row.name,
        email: row.email || `${nip.toLowerCase()}@pt-nsa.co.id`,
        phone: row.phone || '081200000000',
        nik: row.nik || '3171000000000000',
        npwp: row.npwp,
        hasNpwp: row.hasNpwp,
        birthDate: row.birthDate || '1995-01-01',
        birthPlace: row.birthPlace || 'Jakarta',
        gender: row.gender || 'L',
        religion: row.religion || 'Islam',
        maritalStatus: row.maritalStatus || 'Belum Kawin',
        ptkpStatus: row.ptkpStatus || 'TK/0',
        address: row.address || 'Jakarta',
        bankName: row.bankName || 'BCA',
        bankAccountNumber: row.bankAccountNumber || '883000000',
        bankAccountHolder: row.bankAccountHolder || row.name,
        bpjsKesNumber: row.bpjsKesNumber,
        bpjsTkNumber: row.bpjsTkNumber,

        departmentId: dept ? dept.id : 'dept-tech',
        positionId: position ? position.id : 'pos-tech-1',
        managerNip: row.managerNip,
        employmentStatus: row.employmentStatus,
        joinDate: row.joinDate,
        role: 'employee',
        isActive: true,

        baseSalary: row.baseSalary,
        customJobAllowance: row.jobAllowance,
        customDailyTransport: row.dailyTransport,
        customDailyMeal: row.dailyMeal,

        primaryLocationId: locationId,
        allowedLocationIds: locationId ? [locationId] : [],

        annualLeaveBalance: options.grantLeaveQuota ? 12 : 0,

        username: nip.toLowerCase().replace(/[^a-z0-9]/g, ''),
        password: options.defaultPassword || '123456',
      };

      createdList.push(newEmp);
      currentEmployees.push(newEmp);

      // Create contract record
      contracts.push({
        id: `ct-${Date.now()}-${Math.random()}`,
        employeeId: newEmpId,
        contractNumber: `CTR/NSA/${year}/${nip.split('-').pop()}`,
        type: row.employmentStatus,
        startDate: row.joinDate,
        endDate: row.contractEndDate || (row.employmentStatus === 'PKWT' ? '2027-01-01' : undefined),
        isActive: true,
      });

      // Create initial salary record
      if (options.createSalaryHistory) {
        salaryHistories.push({
          id: `sh-${Date.now()}-${Math.random()}`,
          employeeId: newEmpId,
          effectiveDate: row.joinDate,
          baseSalary: row.baseSalary,
          jobAllowance: row.jobAllowance || 0,
          reason: 'Awal Masuk',
        });
      }

      // Create career record
      careerHistories.push({
        id: `ch-${Date.now()}-${Math.random()}`,
        employeeId: newEmpId,
        effectiveDate: row.joinDate,
        departmentName: dept?.name || 'Departemen',
        positionTitle: position?.title || 'Posisi',
        type: 'Pengangkatan',
      });
    }
  }

  // Promote designated supervisors to Manager role if requested
  if (options.promoteSupervisorsToManager && managerNipsToPromote.size > 0) {
    currentEmployees.forEach((emp) => {
      if (managerNipsToPromote.has(emp.nip.toUpperCase()) && emp.role === 'employee') {
        emp.role = 'manager';
        const inUpdated = updatedList.find((u) => u.id === emp.id);
        if (inUpdated) inUpdated.role = 'manager';
      }
    });
  }

  return {
    createdEmployees: createdList,
    updatedEmployees: updatedList,
    newDepartments: newDepts,
    newPositions: newPositions,
    newContracts: contracts,
    newSalaryHistories: salaryHistories,
    newCareerHistories: careerHistories,
  };
}
