export interface User {
  username: string;
  password?: string; // In a real app, never store plain text
  fullName: string;
  biometricsEnabled: boolean;
}

export interface PortfolioItem {
  id: string;
  type: 'Hypotéka' | 'Pojištění' | 'Investice' | 'Penzijní spoření' | 'Stavební spoření' | 'Bonusový vklad' | 'Úvěr ze SS' | 'Běžný účet' | 'Retence' | 'Pojištění nemovitosti' | 'Autopojištění' | 'Spořící účet';
  name: string;
  value: number; // Value in CZK (Monthly premium for Life Ins, Annual for others, Volume for Loans/Invest)
  expiryDate?: string;
  createdDate: string; // New: When the product was added/sold
  details: string;
  // Commission details
  commissionType?: 'PERCENTAGE' | 'FIXED';
  commissionInput?: number; // The % rate or fixed amount entered
  commissionFinal?: number; // The calculated final amount in CZK
  isExisting?: boolean; // New flag for products client already owns
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  occupation: string;
  // Removed status
  income: number;
  portfolio: PortfolioItem[];
  notes: string;
  lastContact: string;
}

export interface KPI {
  totalAUM: number; // Assets Under Management
  activeClients: number;
  pendingTasks: number;
  monthlyCommission: number;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'Vysoká' | 'Střední' | 'Nízká';
  completed: boolean;
  clientId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'MEETING' | 'TASK' | 'REMINDER';
  description?: string;
}

export interface CommissionSettings {
  // General Loans & Invest
  mortgageRate: number; // Percentage 
  investmentRate: number; // Percentage (Updated to 0.68%)

  // Insurance
  lifeInsuranceRate: number; // Percentage of ANNUAL premium (105%)
  propertyInsuranceRate: number; // Percentage of ANNUAL premium (36%)
  autoInsuranceRate: number; // Percentage of ANNUAL premium (12.5%)

  // Savings & Pension
  pensionFixed: number; // Fixed (2210)
  savingsAccountFixed: number; // Fixed (338)

  // Stavební spoření (Building Savings)
  ssFirstOver500: number; 
  ssFirstUnder500: number; 
  ssNextOver500: number; 
  ssNextUnder500: number; 

  // Bonusové vklady (Bonus Deposits)
  deposit1YearFixed: number; 
  deposit25MonthRate: number; 

  // Úvěry ze SS (Building Savings Loans)
  buUnsecuredLoanRate: number; 
  buSecuredLoanRate: number; 
  buRegularLoanRate: number; 

  // Běžné účty a Identita (Accounts & Identity)
  identityCommission: number; 
  accountCommission: number; 
  activityBonus: number; 

  // Retence (Retention)
  retentionCommission: number; 
  retentionThreshold: number; 
}

export interface DailyActivity {
  type: 'CALL' | 'EMAIL' | 'MEETING';
  clientName: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}