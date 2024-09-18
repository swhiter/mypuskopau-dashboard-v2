// Requests
export interface PaginationRequest {
  page: number
  limit: number
  totalRows: number
  totalPages: number
  search: string
}

// Responses
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: string
  pageCount: number
  message: string
}

export interface GeneralResponse<T> {
  data: T
  statusCode: number
  message: string
}

export interface TableField {
  name: string
  title: string
  sortable?: boolean
  field?: (value: number | string | boolean) => number | string | boolean
}
