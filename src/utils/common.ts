import i18nSetup from '@/locales/i18n'
import { jwtDecode } from 'jwt-decode'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useToasterStore } from '@/stores/toaster'
import type { ExtJwtPayload } from '@/types/Credential'

export const urlToFile = async (url: string, filename: string): Promise<File> => {
  if (url.startsWith('data:')) {
    const [mime, base64] = url.split(',')
    const mimeType = mime.match(/:(.*?);/)?.[1] || ''
    const binaryStr = atob(base64)
    const len = binaryStr.length
    const uint8Array = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryStr.charCodeAt(i)
    }

    filename = ensureFileExtension(filename, mimeType)
    return new File([uint8Array], filename, { type: mimeType })
  } else {
    const response = await fetch(url)
    const blob = await response.blob()
    filename = ensureFileExtension(filename, blob.type)
    return new File([blob], filename, { type: blob.type })
  }
}

const ensureFileExtension = (filename: string, mimeType: string): string => {
  const extensionMap: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/msword': '.doc',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
  }

  const currentExtension = filename.split('.').pop()
  const expectedExtension = extensionMap[mimeType]

  if (expectedExtension && currentExtension !== expectedExtension.replace('.', '')) {
    return filename + expectedExtension
  }

  return filename
}

export const handleErrorResponse = (error: any): void => {
  const auth = useAuthStore()
  const toaster = useToasterStore()
  if (error instanceof Error) {
    switch (error.message) {
      case 'Unauthorized':
        toaster.info({ text: i18nSetup.global.t('errors.unauthorized') })
        auth.clearCredentials()
        router.push('/login')
        break
      default:
        toaster.error({ text: error.message })
    }
  } else {
    toaster.error({ text: error })
  }
  // if (error.response) {
  //   switch (error.response.code) {
  //     case 400:
  //       toaster.warning({ text: i18nSetup.global.t('errors.badRequest') })
  //       break
  //     case 401:
  //       toaster.info({ text: i18nSetup.global.t('errors.unauthorized') })
  //       auth.clearCredentials()
  //       break
  //     case 403:
  //       toaster.error({ text: i18nSetup.global.t('errors.forbidden') })
  //       break
  //     case 404:
  //       toaster.warning({ text: i18nSetup.global.t('errors.notFound') })
  //       break
  //     case 500:
  //       toaster.error({ text: i18nSetup.global.t('errors.internalServerError') })
  //       break
  //     default:
  //       if (error.response.data && error.response.data.message) {
  //         toaster.error({ text: error.response.data.message })
  //       } else {
  //         toaster.error({ text: `Error: ${error.response.status}` })
  //       }
  //   }
  // } else if (error.request) {
  //   toaster.error({ text: i18nSetup.global.t('errors.noResponse') })
  // } else {
  //   toaster.error({ text: error.message })
  // }
}

export const getCurrentUser = (): ExtJwtPayload => {
  const auth = useAuthStore()
  const decoded = jwtDecode<ExtJwtPayload>(auth.token!)
  return decoded
}
