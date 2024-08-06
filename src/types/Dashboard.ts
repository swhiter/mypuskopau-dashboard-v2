export interface OrderCountByStatus {
  totalOrder: number
  pendingOrders: number
  successfulOrders: number
  failedOrders: number
}

export interface OrderPerPeriod {
  totalOrder: number
  earlyMorningOrder: number
  dayOrders: number
  eveningOrders: number
}

export interface DailyOrder {
  orderDate: string
  totalOrders: number
}

export interface MonthlyIncome {
  earlyMorningIncome: number
  dayIncome: number
  eveningIncome: number
}

export interface YearlyIncome {
  Januari: MonthlyIncome
  Februari: MonthlyIncome
  Maret: MonthlyIncome
  April: MonthlyIncome
  Mei: MonthlyIncome
  Juni: MonthlyIncome
  Juli: MonthlyIncome
  Agustus: MonthlyIncome
  September: MonthlyIncome
  Oktober: MonthlyIncome
  November: MonthlyIncome
  Desember: MonthlyIncome
}

export interface DashboardSummary {
  countOrderByStatus: OrderCountByStatus
  calculateOrderPerPeriod: OrderPerPeriod
  countOrderDaily: DailyOrder[]
  income: YearlyIncome
}
