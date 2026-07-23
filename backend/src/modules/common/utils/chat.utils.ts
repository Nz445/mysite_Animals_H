import crypto from 'node:crypto'

export const createToken = () => crypto.randomBytes(24).toString('hex')
export const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex')
export const usernamePattern = /^[\u4e00-\u9fa5A-Za-z0-9_]+$/
