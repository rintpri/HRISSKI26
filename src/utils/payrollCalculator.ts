import { Employee, JobPosition, CompanyProfile, AttendanceRecord, Payslip } from '../types/hris';

/**
 * Calculates monthly PPh 21 using TER (Tarif Efektif Rata-Rata) per PP 58/2023 / UU HPP
 */
export function calculatePPh21(grossIncome: number, ptkpStatus: string, hasNpwp: boolean): number {
  if (grossIncome <= 5400000) {
    return 0;
  }

  // Simplified TER Categories
  // Kategori A: TK/0, TK/1, K/0
  // Kategori B: TK/2, TK/3, K/1, K/2
  // Kategori C: K/3
  let rate = 0;
  if (grossIncome <= 6000000) {
    rate = 0.005; // 0.5%
  } else if (grossIncome <= 7500000) {
    rate = 0.01; // 1%
  } else if (grossIncome <= 9000000) {
    rate = 0.015; // 1.5%
  } else if (grossIncome <= 12000000) {
    rate = 0.025; // 2.5%
  } else if (grossIncome <= 16000000) {
    rate = 0.05; // 5%
  } else if (grossIncome <= 25000000) {
    rate = 0.09; // 9%
  } else if (grossIncome <= 40000000) {
    rate = 0.15; // 15%
  } else {
    rate = 0.25; // 25%
  }

  let tax = Math.round(grossIncome * rate);
  
  // Non-NPWP penalty: +20% higher tax
  if (!hasNpwp) {
    tax = Math.round(tax * 1.2);
  }

  return tax;
}

export function calculateEmployeePayslip(
  employee: Employee,
  position: JobPosition | undefined,
  company: CompanyProfile,
  periodId: string,
  attendanceList: AttendanceRecord[],
  workingDaysInPeriod: number = 22,
  additionalBonus: number = 0,
  loanDeduction: number = 0,
  cooperativeDeduction: number = 0
): Payslip {
  // Count attendance stats
  let officeWorkDays = 0;
  let wfhWorkDays = 0;
  let leaveDays = 0;
  let sickDays = 0;
  let permitDays = 0;
  let alphaDays = 0;
  let overtimeHours = 0;

  for (const att of attendanceList) {
    if (att.status === 'Hadir' || att.status === 'Terlambat') {
      officeWorkDays++;
    } else if (att.status === 'WFH') {
      wfhWorkDays++;
    } else if (att.status === 'Cuti') {
      leaveDays++;
    } else if (att.status === 'Sakit') {
      sickDays++;
    } else if (att.status === 'Izin') {
      permitDays++;
    } else if (att.status === 'Alpha') {
      alphaDays++;
    }
    overtimeHours += att.overtimeHours || 0;
  }

  const totalPresentDays = officeWorkDays + wfhWorkDays;

  // Rate Priority: Custom Employee Override > Job Position Master > Company Default
  const dailyTransportRate =
    employee.customDailyTransport !== undefined
      ? employee.customDailyTransport
      : position?.dailyTransport ?? 35000;

  const dailyMealRate =
    employee.customDailyMeal !== undefined
      ? employee.customDailyMeal
      : position?.dailyMeal ?? 30000;

  const jobAllowance =
    employee.customJobAllowance !== undefined
      ? employee.customJobAllowance
      : position?.allowanceJob ?? 0;

  // Transport allowance calculation (policy: WFH excluded by default)
  const transportDays = company.transportExcludesWfh ? officeWorkDays : totalPresentDays;
  const transportAllowance = transportDays * dailyTransportRate;

  // Meal allowance calculation (policy: includes WFH by default)
  const mealDays = company.mealIncludesWfh ? totalPresentDays : officeWorkDays;
  const mealAllowance = mealDays * dailyMealRate;

  // Overtime pay (UU Ketenagakerjaan: Upah Sebulan / 173 * 1.5 * jam lembur)
  const hourlyRate = (employee.baseSalary || 5000000) / company.overtimeBaseDivisor;
  const overtimePay = Math.round(hourlyRate * company.overtimeMultiplier * overtimeHours);

  // Gross earnings
  const performanceBonus = additionalBonus;
  const grossIncome =
    employee.baseSalary +
    jobAllowance +
    transportAllowance +
    mealAllowance +
    overtimePay +
    performanceBonus;

  // BPJS Kesehatan (Max wage cap Rp 12,000,000)
  const bpjsKesWageBasis = Math.min(employee.baseSalary + jobAllowance, 12000000);
  const bpjsKesEmployee = Math.round(bpjsKesWageBasis * 0.01); // 1%
  const bpjsKesCompany = Math.round(bpjsKesWageBasis * 0.04); // 4%

  // BPJS Ketenagakerjaan
  const bpjsTkWageBasis = employee.baseSalary;
  const bpjsTkJhtEmployee = Math.round(bpjsTkWageBasis * 0.02); // 2%
  const bpjsTkJhtCompany = Math.round(bpjsTkWageBasis * 0.037); // 3.7%
  const bpjsTkJkkCompany = Math.round(bpjsTkWageBasis * 0.0024); // 0.24%
  const bpjsTkJkmCompany = Math.round(bpjsTkWageBasis * 0.003); // 0.3%
  const totalCompanyBenefit =
    bpjsKesCompany + bpjsTkJhtCompany + bpjsTkJkkCompany + bpjsTkJkmCompany;

  // Alpha deduction: per-day salary deduction
  const dailyBaseSalary = Math.round(employee.baseSalary / Math.max(workingDaysInPeriod, 20));
  const alphaDeduction = alphaDays * dailyBaseSalary;

  // PPh 21
  const pph21 = calculatePPh21(grossIncome, employee.ptkpStatus, employee.hasNpwp);

  const totalDeductions =
    bpjsKesEmployee +
    bpjsTkJhtEmployee +
    pph21 +
    alphaDeduction +
    loanDeduction +
    cooperativeDeduction;

  const netSalary = Math.max(0, grossIncome - totalDeductions);

  return {
    id: `PAY-${periodId}-${employee.nip}`,
    periodId,
    employeeId: employee.id,
    nip: employee.nip,
    employeeName: employee.name,
    departmentName: position ? position.title : 'Staf',
    positionTitle: position?.title || 'Karyawan',
    bankName: employee.bankName || 'BCA',
    bankAccountNumber: employee.bankAccountNumber || '-',
    hasNpwp: employee.hasNpwp,
    ptkpStatus: employee.ptkpStatus,

    officeWorkDays,
    wfhWorkDays,
    totalPresentDays,
    leaveDays,
    sickDays,
    permitDays,
    alphaDays,
    overtimeHours,

    baseSalary: employee.baseSalary,
    jobAllowance,
    dailyTransportRate,
    transportAllowance,
    dailyMealRate,
    mealAllowance,
    overtimePay,
    performanceBonus,
    grossIncome,

    bpjsKesEmployee,
    bpjsTkJhtEmployee,
    pph21,
    alphaDeduction,
    loanDeduction,
    cooperativeDeduction,
    totalDeductions,

    netSalary,

    bpjsKesCompany,
    bpjsTkJhtCompany,
    bpjsTkJkkCompany,
    bpjsTkJkmCompany,
    totalCompanyBenefit,

    status: 'Draft',
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
