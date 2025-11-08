// Type guards
export const isString = (value) => typeof value === 'string'
export const isNumber = (value) => typeof value === 'number' && !isNaN(value)
export const isBoolean = (value) => typeof value === 'boolean'
export const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
export const isArray = (value) => Array.isArray(value)
export const isFunction = (value) => typeof value === 'function'
export const isNull = (value) => value === null
export const isUndefined = (value) => value === undefined
export const isNullish = (value) => value === null || value === undefined

// Validation guards
export const isEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return isString(email) && emailRegex.test(email)
}

export const isUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return isString(password) && passwordRegex.test(password)
}

export const isPhoneNumber = (phone) => {
  // Basic phone number validation (adjust regex as needed)
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return isString(phone) && phoneRegex.test(phone.replace(/\s/g, ''))
}

// Array guards
export const isEmpty = (value) => {
  if (isArray(value)) return value.length === 0
  if (isString(value)) return value.trim().length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return isNullish(value)
}

export const isNotEmpty = (value) => !isEmpty(value)

// Number guards
export const isPositive = (value) => isNumber(value) && value > 0
export const isNegative = (value) => isNumber(value) && value < 0
export const isZero = (value) => isNumber(value) && value === 0
export const isInteger = (value) => isNumber(value) && Number.isInteger(value)

// Date guards
export const isValidDate = (date) => {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d)
}

// File guards
export const isValidFileSize = (file, maxSizeInMB = 10) => {
  if (!file || !file.size) return false
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

export const isValidFileType = (file, allowedTypes = []) => {
  if (!file || !file.type) return false
  if (allowedTypes.length === 0) return true
  return allowedTypes.includes(file.type)
}

// Course-specific guards
export const isValidCourseSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return isString(slug) && slugRegex.test(slug)
}

export const isValidPrice = (price) => {
  return isNumber(price) && price >= 0
}

export const isValidPercentage = (percentage) => {
  return isNumber(percentage) && percentage >= 0 && percentage <= 100
}

// User role guards
export const isAdmin = (user) => {
  return user?.role === 'admin'
}

export const isTeacher = (user) => {
  return user?.role === 'teacher'
}

export const isStudent = (user) => {
  return user?.role === 'student'
}

export const hasRole = (user, role) => {
  return user?.role === role
}

// Payment guards
export const isValidPaymentStatus = (status) => {
  const validStatuses = ['pending', 'success', 'failed', 'cancelled', 'expired']
  return validStatuses.includes(status)
}

// Quiz guards
export const isValidQuizType = (type) => {
  const validTypes = ['quiz', 'file']
  return validTypes.includes(type)
}

export const isValidQuizStatus = (status) => {
  const validStatuses = ['pending', 'passed', 'failed']
  return validStatuses.includes(status)
}
