import type { MenuItem } from '@/types/MainComponents'
import { routeAllowed } from './roles'

// Entri sidebar: menu langsung (MenuItem) atau grup berisi sub menu.
export interface MenuGroup {
  title: string
  icon: string
  isMdi: boolean
  children: MenuItem[]
}

export type MenuEntry = MenuItem | MenuGroup

export const isMenuGroup = (entry: MenuEntry): entry is MenuGroup => 'children' in entry

const normalize = (path: string): string => path.toLowerCase().replace(/\/+$/, '')

// Sub menu disaring per role; grup yang tidak menyisakan sub menu disembunyikan.
export const filterMenusForRole = (menus: MenuEntry[], role: string | undefined): MenuEntry[] =>
  menus.flatMap((entry): MenuEntry[] => {
    if (!isMenuGroup(entry)) {
      return routeAllowed(role, entry.href) ? [entry] : []
    }
    const children = entry.children.filter((child) => routeAllowed(role, child.href))
    return children.length ? [{ ...entry, children }] : []
  })

// Grup dibuka otomatis bila halaman aktif adalah salah satu sub menunya.
export const groupContainsPath = (group: MenuGroup, path: string): boolean => {
  const current = normalize(path)
  return group.children.some((child) => {
    const href = normalize(child.href)
    return current === href || current.startsWith(`${href}/`)
  })
}
