import MSG from './msg.js'
import URLS from './urls.js'

// MedDx roles
export const UserRoles = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  ASHA: 'asha',
}

export const AvailableGenders = ['male', 'female', 'other', 'prefer_not_to_say']

export const AccountStatus = {
  ACTIVE: 'active',
  PENDING_SETUP: 'pending_setup',
  SUSPENDED: 'suspended',
}

export const DoctorStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
}

export const SlotStatus = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
}

export const AppointmentStatus = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const PaymentStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  FREE: 'free',
}

export const ConsultationMode = {
  VIDEO: 'video',
  ASYNC: 'async',
}

export const TriageUrgency = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EMERGENCY: 'emergency',
}

export const TransactionType = {
  CONSULTATION: 'consultation',
  PAYOUT: 'payout',
}

export const AvailableUserRoles = Object.values(UserRoles)
export const AvailableAccountStatuses = Object.values(AccountStatus)
export const AvailableDoctorStatuses = Object.values(DoctorStatus)
export const AvailableSlotStatuses = Object.values(SlotStatus)
export const AvailableAppointmentStatuses = Object.values(AppointmentStatus)
export const AvailablePaymentStatuses = Object.values(PaymentStatus)
export const AvailableConsultationModes = Object.values(ConsultationMode)
export const AvailableTriageUrgencies = Object.values(TriageUrgency)
export const AvailableTransactionTypes = Object.values(TransactionType)

// Retained from boilerplate so legacy Google-OAuth code in src/index.js
// keeps importing without breaking. Phase 1 will remove these usages.
export const UserLoginType = {
  GOOGLE: 'GOOGLE',
  GITHUB: 'GITHUB',
  EMAIL_PASSWORD: 'EMAIL_PASSWORD',
}
export const AvailableUserLoginTypes = Object.values(UserLoginType)

export { MSG, URLS }
