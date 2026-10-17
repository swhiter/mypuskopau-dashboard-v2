import { describe, expect, it } from 'vitest'
import { canManagePayroll, homeRouteFor, routeAllowed } from '../roles'

describe('routeAllowed', () => {
  it('limits bendahara to cash and payroll', () => {
    expect(routeAllowed('bendahara', '/cash')).toBe(true)
    expect(routeAllowed('bendahara', '/cash/movements')).toBe(true)
    expect(routeAllowed('bendahara', '/payroll')).toBe(true)
    expect(routeAllowed('bendahara', '/reports/income')).toBe(true)
    expect(routeAllowed('bendahara', '/reports/ritase')).toBe(true)
    expect(routeAllowed('bendahara', '/reports')).toBe(false)
    expect(routeAllowed('bendahara', '/login')).toBe(true)
    expect(routeAllowed('bendahara', '/driver-management')).toBe(false)
    expect(routeAllowed('bendahara', '/dashboard')).toBe(false)
  })

  it('routeAllowed cash rules: other roles cannot open cash pages', () => {
    expect(routeAllowed('superadmin', '/cash')).toBe(false)
    expect(routeAllowed('superadmin', '/cash/movements')).toBe(false)
    expect(routeAllowed('superadmin', '/cashier')).toBe(true)
    expect(routeAllowed('superadmin', '/payroll')).toBe(true)
    expect(routeAllowed('superadmin', '/reports/income')).toBe(true)
    expect(routeAllowed('superadmin', '/reports/ritase')).toBe(true)
    expect(routeAllowed('superadmin', '/driver-management')).toBe(true)
    expect(routeAllowed(undefined, '/dashboard')).toBe(true)
  })
})

describe('homeRouteFor', () => {
  it('sends bendahara to cash dashboard', () => {
    expect(homeRouteFor('bendahara')).toBe('/cash')
    expect(homeRouteFor('superadmin')).toBe('/dashboard')
    expect(homeRouteFor(undefined)).toBe('/dashboard')
  })
})

describe('canManagePayroll', () => {
  it('only superadmin manages payroll', () => {
    expect(canManagePayroll('superadmin')).toBe(true)
    expect(canManagePayroll('bendahara')).toBe(false)
    expect(canManagePayroll(undefined)).toBe(false)
  })
})
