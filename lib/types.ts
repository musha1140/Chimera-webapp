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

