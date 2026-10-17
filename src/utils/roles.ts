// Pembatasan menu & route dashboard berdasarkan role di token login.
export const ROLE_SUPERADMIN = 'superadmin'
export const ROLE_BENDAHARA = 'bendahara'

// Menu bendahara; menu bendahara berikutnya ditambahkan di sini.
export const BENDAHARA_ROUTES = ['/cash', '/payroll', '/reports/income', '/reports/ritase']
// Halaman yang hanya untuk bendahara (role lain tidak boleh membuka).
export const BENDAHARA_ONLY_ROUTES = ['/cash']

const PUBLIC_ROUTES = ['/login']

const matches = (path: string, routes: string[]): boolean =>
  routes.some((route) => path === route || path.startsWith(`${route}/`))

export const routeAllowed = (role: string | undefined, path: string): boolean => {
  if (role === ROLE_BENDAHARA) return matches(path, [...BENDAHARA_ROUTES, ...PUBLIC_ROUTES])
  return !matches(path, BENDAHARA_ONLY_ROUTES)
}

export const homeRouteFor = (role: string | undefined): string =>
  role === ROLE_BENDAHARA ? '/cash' : '/dashboard'

export const canManagePayroll = (role: string | undefined): boolean => role === ROLE_SUPERADMIN
