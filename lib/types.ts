export interface ContestInfo {
  isContested: boolean
  opposingClan?: string
  warDateTime?: Date
}

export interface Tower {
  id: string
  name: string
  buff: string
  description: string
  members: string[]
  contest: ContestInfo
}

export interface Member {
  name: string
  class: string
  isReady: boolean
  cr?: number
  resonance?: number
  level?: number
}

export interface WarMatch {
  id: string
  name: string
  players: Member[]
}

export interface WarType {
  name: string
  points: number
  matches: WarMatch[]
}

export interface ShadowWar {
  warTime: Date | null
  warTypes: WarType[]
}

export interface MemberRemoval {
  reason: string
  date: Date
  approvedBy: string
}
