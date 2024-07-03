// import type UserCredential from '@/types/Credential'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import authenticationService from '../authentications/authentications.api'

const mock = new MockAdapter(axios)

describe('authenticationService', () => {
  beforeEach(() => {
    mock.reset()
  })

  afterEach(() => {
    mock.restore()
  })

  // it('should login successfully', async () => {
  //   const credential: UserCredential = {
  //     token: 'test'
  //   }

  //   mock.onPost('/login').reply(200, credential)

  //   const payload = {
  //     username: 'anwar_gilang',
  //     password: 'testing'
  //   }
  //   const result = await authenticationService.login(payload)
  //   expect(result).toEqual(mock)
  // })

  it('should handle error when login', async () => {
    mock.onPost('/login').reply(500)

    try {
      const payload = {
        username: 'anwar_gilang',
        password: 'testing'
      }
      await authenticationService.login(payload)
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe('An unknown error occured')
      } else {
        throw error
      }
    }
  })
})
