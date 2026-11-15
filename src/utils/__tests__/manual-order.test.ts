import { describe, expect, it } from 'vitest'
import {
  MINIMUM_PRICE,
  buildManualOrderPayload,
  manualOrderTotals,
  validateManualOrder,
  type ManualOrderForm
} from '../manual-order'

const form = (overrides: Partial<ManualOrderForm> = {}): ManualOrderForm => ({
  customerName: ' Budi ',
  customerPhone: '0812',
  customerEmail: '',
  pickupAddress: 'Halim',
  destinationAddress: 'Bekasi',
  distance: '18.5',
  latitudeStart: '',
  longitudeStart: '',
  latitudeDestination: '',
  longitudeDestination: '',
  driverUserId: 'D123',
  carId: '23',
  staffId: '',
  price: '150000',
  chargePassenger: '',
  discount: '',
  orderType: 'REGULER',
  rentalHours: '',
  ...overrides
})

describe('buildManualOrderPayload', () => {
  it('maps to a cash order with driver userId and real car id', () => {
    expect(buildManualOrderPayload(form())).toEqual({
      customerName: 'Budi',
      customerPhone: '0812',
      customerEmail: '',
      driverId: 'D123',
      carType: 23,
      orderDetail: {
        pickupAddress: 'Halim',
        destinationAddress: 'Bekasi',
        distance: 18.5,
        latitudeStart: 0,
        longitudeStart: 0,
        latitudeDestination: '-',
        longitudeDestination: '-',
        paymentMethod: 'cash',
        vaAccount: '-',
        price: 150000,
        chargePassenger: 0,
        discount: 0,
        orderType: 'REGULER'
      }
    })
  })

  it('keeps optional coordinates and staff when filled', () => {
    const payload = buildManualOrderPayload(
      form({ latitudeStart: '-6.2', longitudeStart: '106.8', latitudeDestination: '-6.3', longitudeDestination: '107.0', staffId: '4' })
    )
    expect(payload.orderDetail).toMatchObject({
      latitudeStart: -6.2,
      longitudeStart: 106.8,
      latitudeDestination: '-6.3',
      longitudeDestination: '107.0'
    })
    expect(payload.staffId).toBe(4)
  })
})

describe('manualOrderTotals', () => {
  it('applies the minimum fare like the backend', () => {
    expect(MINIMUM_PRICE).toBe(75000)
    expect(manualOrderTotals(form({ price: '50000', chargePassenger: '10000', discount: '5000' }))).toEqual({
      price: 75000,
      minimumApplied: true,
      chargePassenger: 10000,
      discount: 5000,
      total: 80000,
      isRental: false,
      driverShare: null
    })
  })

  it('totals price + charge - discount', () => {
    expect(manualOrderTotals(form({ chargePassenger: '20000', discount: '10000' })).total).toBe(160000)
  })
})

describe('jenis order Reguler/Sewa', () => {
  it('sends REGULER without rental hours by default', () => {
    const detail = buildManualOrderPayload(form({ rentalHours: '5' })).orderDetail
    expect(detail.orderType).toBe('REGULER')
    expect(detail).not.toHaveProperty('rentalHours')
  })

  it('sends SEWA with rental hours as a number', () => {
    const detail = buildManualOrderPayload(form({ orderType: 'SEWA', rentalHours: '3' })).orderDetail
    expect(detail.orderType).toBe('SEWA')
    expect(detail.rentalHours).toBe(3)
    expect(detail.paymentMethod).toBe('cash')
  })

  it('requires 0-24 rental hours with at most 2 decimals for SEWA', () => {
    expect(validateManualOrder(form())).toBeNull()
    expect(validateManualOrder(form({ orderType: 'SEWA', rentalHours: '2.5' }))).toBeNull()
    for (const rentalHours of ['', '0', '25', '-1', '1.555', 'abc']) {
      expect(validateManualOrder(form({ orderType: 'SEWA', rentalHours }))).toBe('message.rentalHoursRequired')
    }
  })

  it('shows the driver share: 40% without deductions for SEWA', () => {
    const sewa = manualOrderTotals(form({ orderType: 'SEWA', rentalHours: '3', price: '300000' }))
    expect(sewa.isRental).toBe(true)
    expect(sewa.driverShare).toBe(120000)
    expect(manualOrderTotals(form()).isRental).toBe(false)
  })
})
