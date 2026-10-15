import { describe, expect, it } from 'vitest'
import { canManagePayroll, homeRouteFor, routeAllowed } from '../roles'

describe('routeAllowed', () => {
  it('limits bendahara to payroll', () => {
    expect(routeAllowed('bendahara', '/driver-management')).toBe(false)
    expect(routeAllowed('bendahara', '/dashboard')).toBe(false)
    expect(routeAllowed('bendahara', '/payroll')).toBe(true)
    expect(routeAllowed('bendahara', '/login')).toBe(true)
  })

  it('does not restrict other roles', () => {
    expect(routeAllowed('superadmin', '/driver-management')).toBe(true)
    expect(routeAllowed('superadmin', '/payroll')).toBe(true)
    expect(routeAllowed(undefined, '/dashboard')).toBe(true)
  })
})

describe('homeRouteFor', () => {
  it('sends bendahara to payroll', () => {
    expect(homeRouteFor('bendahara')).toBe('/payroll')
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
