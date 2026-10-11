import { PassTypeEnum, PaymentStatus, MatchStatus, Role, AccountStatus } from "@prisma/client"

export type { PassTypeEnum, PaymentStatus, MatchStatus, Role, AccountStatus }

export interface UserSession {
  userId: string
  role?: Role
}

export interface LoginCredentials {
  phone: string
  passNumber: string
}

export interface LoginResponse {
  success: boolean
  error?: string
}

export interface PassLookupResponse {
  success: boolean
  gbnNumber?: string
  name?: string
  error?: string
}

export interface RegistrationSubmitResponse {
  success: boolean
  registrationId?: string
  gbnNumber?: string
  phone?: string
  error?: string
}

export interface AttendeeMatchProfile {
  gender?: string | null
  age?: number | null
  experience?: string | null
  vibe?: string | null
}

export interface AttendeePartnerInfo {
  name: string
  gender?: string | null
  age?: number | null
  experience?: string | null
  vibe?: string | null
}

export interface AttendeeMatchData {
  id: string
  status: MatchStatus
  revealAt: string
  partner: AttendeePartnerInfo | null
}

export interface DashboardAttendeeData {
  user: {
    name: string
    phone: string
  }
  registration: {
    gbnNumber: string
    passType: PassTypeEnum
    paymentStatus: PaymentStatus
    matchmakingOptIn: boolean
    partnerName?: string | null
    groupMembers?: { name?: string; phone?: string }[] | null
    rejectionReason?: string | null
  }
  match: AttendeeMatchData | null
}

export interface ParticipantListItem {
  id: string
  gbnNumber: string
  passType: PassTypeEnum
  paymentStatus: PaymentStatus
  matchmakingOptIn: boolean
  createdAt: Date | string
  user: {
    id: string
    name: string
    phone: string
    status: AccountStatus
  }
  payment?: {
    id: string
    amount: number
    status: PaymentStatus
    paymentScreenshotUrl: string
  } | null
}
