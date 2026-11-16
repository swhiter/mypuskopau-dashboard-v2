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
  source: 'ORDER' | 'PAYROLL' | 'DEBT' | 'CASH'
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

  async getUnclassified(): Promise<GeneralResponse<UnclassifiedMovement[]>> {
    return await httpClient.get<GeneralResponse<UnclassifiedMovement[]>>('/accounting/unclassified')
  }
}

const accountingService = new AccountingService()
export default accountingService
