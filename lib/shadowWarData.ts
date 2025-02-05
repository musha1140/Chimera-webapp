import type { Member } from "./data"

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

export const initialShadowWarData: ShadowWar = {
  warTime: null,
  warTypes: [
    {
      name: "EXALTED",
      points: 8,
      matches: [
        { id: "exalted-match-1", name: "Exalted Match 1", players: [] },
        { id: "exalted-match-2", name: "Exalted Match 2", players: [] },
        { id: "exalted-match-3", name: "Exalted Match 3", players: [] },
      ],
    },
    {
      name: "EMINENT",
      points: 4,
      matches: [
        { id: "eminent-match-1", name: "Eminent Match 1", players: [] },
        { id: "eminent-match-2", name: "Eminent Match 2", players: [] },
        { id: "eminent-match-3", name: "Eminent Match 3", players: [] },
      ],
    },
    {
      name: "FAMED",
      points: 2,
      matches: [
        { id: "famed-match-1", name: "Famed Match 1", players: [] },
        { id: "famed-match-2", name: "Famed Match 2", players: [] },
        { id: "famed-match-3", name: "Famed Match 3", players: [] },
      ],
    },
    {
      name: "PROUD",
      points: 1,
      matches: [
        { id: "proud-match-1", name: "Proud Match 1", players: [] },
        { id: "proud-match-2", name: "Proud Match 2", players: [] },
        { id: "proud-match-3", name: "Proud Match 3", players: [] },
      ],
    },
  ],
}
