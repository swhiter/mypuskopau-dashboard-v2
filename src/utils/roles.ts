// Pembatasan menu & route dashboard berdasarkan role di token login.
export const ROLE_SUPERADMIN = 'superadmin'
export const ROLE_BENDAHARA = 'bendahara'

// Menu bendahara; menu bendahara berikutnya ditambahkan di sini.
export const BENDAHARA_ROUTES = ['/payroll']

const PUBLIC_ROUTES = ['/login']

export const routeAllowed = (role: string | undefined, path: string): boolean => {
  if (role !== ROLE_BENDAHARA) return true
  return [...BENDAHARA_ROUTES, ...PUBLIC_ROUTES].some(
    (allowed) => path === allowed || path.startsWith(`${allowed}/`)
  )
}

export const homeRouteFor = (role: string | undefined): string =>
  role === ROLE_BENDAHARA ? '/payroll' : '/dashboard'

export const canManagePayroll = (role: string | undefined): boolean => role === ROLE_SUPERADMIN
