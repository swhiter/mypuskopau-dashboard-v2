import type { GeneralResponse } from '@/types/Main'
import type { BusinessUnit, CoaAccount, CoaType } from '@/utils/accounting'
import httpClient from '../httpClient'

export interface TrialBalanceRow {
  code: string
  name: string
  type: CoaType
  normal: 'D' | 'K'
  opening: number
  debit: number
  credit: number
  closing: number
}

export interface TrialBalance {
  from: string
  to: string
  unit: BusinessUnit | null
  rows: TrialBalanceRow[]
  totals: { debit: number; credit: number; balanced: boolean }
}

export interface LedgerRow {
  entry_date: string
  source: 'ORDER' | 'PAYROLL' | 'DEBT' | 'CASH' | 'JOURNAL'
  source_id: number | null
  memo: string | null
  debit: number
  credit: number
  lines: number
  balance: number
}

export interface Ledger {
  account: { code: string; name: string; normal: 'D' | 'K' }
  from: string
  to: string
  unit: BusinessUnit | null
  opening: number
  rows: LedgerRow[]
  closing: number
}

export interface ReportParams {
  from?: string
  to?: string
  unit?: BusinessUnit | ''
}

export interface UnclassifiedMovement {
  id: number
  type: 'EXPENSE' | 'INCOME'
  fromAccount: string | null
  toAccount: string | null
  amount: number
  description: string
  movementAt: string
}

export type JournalType = 'SALDO_AWAL' | 'RIWAYAT' | 'PENYESUAIAN' | 'KOREKSI'

export interface JournalLine {
  lineNo?: number
  coaCode: string
  coaName?: string | null
  unit: BusinessUnit
  debit: number
  credit: number
  memo: string | null
}

export interface Journal {
  id: number
  journalDate: string
  type: JournalType
  description: string
  status: 'ACTIVE' | 'VOID'
  voidReason: string | null
  createdBy: string
  createdAt: string
  total?: number
  lineCount?: number
  units?: string
  lines?: JournalLine[]
}

export interface JournalInput {
  journalDate: string
  type: JournalType
  description: string
  lines: Omit<JournalLine, 'lineNo' | 'coaName'>[]
}

export interface AmountRow {
  code: string | null
  name: string
  amount: number
}

export interface IncomeSection {
  key: 'REVENUE' | 'EXPENSE' | 'OTHER_INCOME' | 'OTHER_EXPENSE'
  title: string
  rows: { code: string; name: string; month: number; ytd: number }[]
  month: number
  ytd: number
}

export interface BalanceGroup {
  code: string
  name: string
  rows: AmountRow[]
  total: number
}

export interface FinancialReport {
  month: string
  from: string
  to: string
  yearFrom: string
  unit: BusinessUnit | null
  trialBalance: {
    rows: { code: string; name: string; type: CoaType; opening: number; debit: number; credit: number; closing: number }[]
    totals: { debit: number; credit: number; balanced: boolean; closingBalanced: boolean }
  }
  income: { sections: IncomeSection[]; profit: { month: number; ytd: number } }
  balance: {
    assets: { groups: BalanceGroup[]; total: number }
    liabilities: { groups: BalanceGroup[]; total: number }
    equity: { rows: AmountRow[]; total: number }
    totalLiabilitiesEquity: number
    balanced: boolean
  }
  cashFlow: {
    accounts: { code: string; name: string; opening: number; closing: number }[]
    opening: number
    inflows: { category: string; name: string; amount: number }[]
    outflows: { category: string; name: string; amount: number }[]
    totalIn: number
    totalOut: number
    closing: number
  }
  bankCheck: { code: string; account: string; ledger: number; cash: number; difference: number }[]
}

class AccountingService {
  async getAccounts(): Promise<GeneralResponse<CoaAccount[]>> {
    return await httpClient.get<GeneralResponse<CoaAccount[]>>('/accounting/accounts')
  }

  async createAccount(data: { code: string; name: string; type: CoaType; parent: string }): Promise<GeneralResponse<unknown>> {
    return await httpClient.post<GeneralResponse<unknown>>('/accounting/accounts', data)
  }

  async updateAccount(code: string, data: { name: string; isActive: boolean }): Promise<GeneralResponse<unknown>> {
    return await httpClient.put<GeneralResponse<unknown>>(`/accounting/accounts/${encodeURIComponent(code)}`, data)
  }

  async getTrialBalance(params: ReportParams): Promise<GeneralResponse<TrialBalance>> {
    return await httpClient.get<GeneralResponse<TrialBalance>>('/accounting/trial-balance', { params })
  }

  async getLedger(params: ReportParams & { account: string }): Promise<GeneralResponse<Ledger>> {
    return await httpClient.get<GeneralResponse<Ledger>>('/accounting/ledger', { params })
  }

  async getJournals(params: {
    from?: string
    to?: string
    type?: JournalType | ''
    unit?: BusinessUnit | ''
    withLines?: '1'
  }): Promise<GeneralResponse<Journal[]>> {
    return await httpClient.get<GeneralResponse<Journal[]>>('/accounting/journals', { params })
  }

  async getJournal(id: number): Promise<GeneralResponse<Journal>> {
    return await httpClient.get<GeneralResponse<Journal>>(`/accounting/journals/${id}`)
  }

  async createJournal(data: JournalInput): Promise<GeneralResponse<{ id: number }>> {
    return await httpClient.post<GeneralResponse<{ id: number }>>('/accounting/journals', data)
  }

  async voidJournal(id: number, reason: string): Promise<GeneralResponse<unknown>> {
    return await httpClient.post<GeneralResponse<unknown>>(`/accounting/journals/${id}/void`, { reason })
  }

  async getReports(params: { month: string; unit?: BusinessUnit | '' }): Promise<GeneralResponse<FinancialReport>> {
    return await httpClient.get<GeneralResponse<FinancialReport>>('/accounting/reports', { params })
  }

  async getUnclassified(): Promise<GeneralResponse<UnclassifiedMovement[]>> {
    return await httpClient.get<GeneralResponse<UnclassifiedMovement[]>>('/accounting/unclassified')
  }
}

const accountingService = new AccountingService()
export default accountingService
