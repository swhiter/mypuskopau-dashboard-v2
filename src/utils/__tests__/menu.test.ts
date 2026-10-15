import { describe, expect, it } from 'vitest'
import { filterMenusForRole, groupContainsPath, type MenuEntry } from '../menu'

const leaf = (title: string, href: string) => ({ title, href, icon: 'x', isMdi: true })

const menus: MenuEntry[] = [
  leaf('Dashboard', '/dashboard'),
  {
    title: 'Transaksi',
    icon: 'x',
    isMdi: true,
    children: [leaf('Pesanan', '/order-management'), leaf('Struk Vendor', '/vendor-orders')]
  },
  {
    title: 'Keuangan',
    icon: 'x',
    isMdi: true,
    children: [leaf('Penggajian', '/payroll'), leaf('Laporan', '/reports/income')]
  }
]

describe('filterMenusForRole', () => {
  it('keeps everything for superadmin', () => {
    expect(filterMenusForRole(menus, 'superadmin')).toEqual(menus)
  })

  it('keeps only allowed children for bendahara and drops empty groups', () => {
    expect(filterMenusForRole(menus, 'bendahara')).toEqual([
      { title: 'Keuangan', icon: 'x', isMdi: true, children: [leaf('Penggajian', '/payroll')] }
    ])
  })
})

describe('groupContainsPath', () => {
  it('matches child routes and nested paths, case-insensitively', () => {
    const transaksi = menus[1] as Extract<MenuEntry, { children: unknown }>
    expect(groupContainsPath(transaksi, '/vendor-orders')).toBe(true)
    expect(groupContainsPath(transaksi, '/order-management/12')).toBe(true)
    expect(groupContainsPath(transaksi, '/payroll')).toBe(false)
    const tarif = { title: 'Tarif', icon: 'x', isMdi: true, children: [leaf('Argo', '/Argo-tariff-management')] }
    expect(groupContainsPath(tarif, '/argo-tariff-management')).toBe(true)
  })
})
