"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, X, Swords, Download, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { ChimeraHeader } from "@/components/chimera-header"
import { getTowers, addTower, updateTower, deleteTower, getMembers, initializeDatabase, exportMembersToCSV, exportMembersToPNG, importMembersFromCSV, importMembersFromPNG, getMembersFromGoogleSheetsRoster } from "../actions"
import type { ContestInfo, Tower, Member } from "@/lib/types"

const towerTypes = [
  {
    name: "Tower of Fortitude",
    buff: "PvP Enhancement (Legendary)",
    description: "(+10% Life in Battleground, Shadow War, Rite of Exile and Challenge of the Immortal)",
  },
  {
    name: "Tower of Blessings",
    buff: "Helliquary Rewards (Legendary)",
    description: "(+20% Magic Find from boss)",
  },
  {
    name: "Tower of Secrets",
    buff: "Challenge Rift Speed (Legendary)",
    description: "(+2 Rift Progress Orbs dropped by Elite monsters)",
  },
  {
    name: "Tower of Punishment",
    buff: "Dungeon Damage (+10%)",
    description: "",
  },
  {
    name: "Tower of Greed",
    buff: "Dungeon Rewards",
    description: "(+15% Magic Find from boss)",
  },
  {
    name: "Tower of Wilderness",
    buff: "Monstrous Essence Rewards (+20%)",
    description: "",
  },
  {
    name: "Tower of Wisdom",
    buff: "Experience Rewards",
    description: "(+30% from Horadric Bestiary and Bounties)",
  },
  {
    name: "Tower of Technique",
    buff: "Challenge Rift Combat Rating (+50)",
    description: "",
  },
  {
    name: "Tower of Conquest",
    buff: "Helliquary Combat Rating",
    description: "(+50)",
  },
]

export default function TowersPage() {
  const [towers, setTowers] = useState<Tower[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [editMode, setEditMode] = useState(false)
  const [selectedTower, setSelectedTower] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [contestDialogOpen, setContestDialogOpen] = useState(false)
  const [selectedTowerForContest, setSelectedTowerForContest] = useState<string | null>(null)
  const [contestInfo, setContestInfo] = useState<ContestInfo>({
    isContested: false,
    opposingClan: "",
    warDateTime: undefined,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDatabase()
        const [loadedTowers, loadedMembers] = await Promise.all([getTowers(), getMembers()])
        setTowers(loadedTowers)
        setMembers(loadedMembers)
      } catch (error) {
        console.error("Error initializing database or loading data:", error)
        setError("Failed to load data. Please try again later.")
      }
    }
    loadData()
  }, [])

  const handleAddTower = async (towerType: (typeof towerTypes)[0]) => {
    try {
      const newTower = await addTower({
        name: towerType.name,
        buff: towerType.buff,
        description: towerType.description,
        members: [],
        contest: {
          isContested: false,
        },
      })
      setTowers([...towers, newTower])
    } catch (err) {
      setError("Failed to add tower: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleDeleteTower = async (id: string) => {
    try {
      await deleteTower(id)
      setTowers(towers.filter((tower) => tower.id !== id))
    } catch (err) {
      setError("Failed to delete tower: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleAddMember = async (towerId: string, memberName: string) => {
    try {
      const tower = towers.find((t) => t.id === towerId)
      if (tower && !tower.members.includes(memberName)) {
        const updatedTower = await updateTower(towerId, {
          members: [...tower.members, memberName],
        })
        setTowers(towers.map((t) => (t.id === towerId ? updatedTower : t)))
      }
    } catch (err) {
      setError("Failed to add member: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleRemoveMember = async (towerId: string, memberName: string) => {
    try {
      const tower = towers.find((t) => t.id === towerId)
      if (tower) {
        const updatedTower = await updateTower(towerId, {
          members: tower.members.filter((m) => m !== memberName),
        })
        setTowers(towers.map((t) => (t.id === towerId ? updatedTower : t)))
      }
    } catch (err) {
      setError("Failed to remove member: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleUpdateContest = async (towerId: string) => {
    try {
      const updatedTower = await updateTower(towerId, {
        contest: contestInfo,
      })
      setTowers(towers.map((t) => (t.id === towerId ? updatedTower : t)))
      setContestDialogOpen(false)
      setSelectedTowerForContest(null)
      setContestInfo({ isContested: false, opposingClan: "", warDateTime: undefined })
    } catch (err) {
      setError("Failed to update contest status: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  const openContestDialog = (tower: Tower) => {
    setSelectedTowerForContest(tower.id)
    setContestInfo(tower.contest)
    setContestDialogOpen(true)
  }

  const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleExportCSV = async () => {
    try {
      const csvData = await exportMembersToCSV()
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "members.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting members to CSV:", error)
    }
  }

  const handleExportPNG = async () => {
    try {
      const pngData = await exportMembersToPNG()
      const blob = new Blob([pngData], { type: "image/png" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "members.png")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting members to PNG:", error)
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const csvData = e.target?.result as string
        try {
          await importMembersFromCSV(csvData)
          const updatedMembers = await getMembersFromGoogleSheetsRoster()
          setMembers(updatedMembers)
        } catch (error) {
          console.error("Error importing members from CSV:", error)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImportPNG = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const pngData = e.target?.result as ArrayBuffer
        try {
          await importMembersFromPNG(Buffer.from(pngData))
          const updatedMembers = await getMembersFromGoogleSheetsRoster()
          setMembers(updatedMembers)
        } catch (error) {
          console.error("Error importing members from PNG:", error)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const handleFetchFromGoogleSheets = async () => {
    try {
      const googleSheetMembers = await getMembersFromGoogleSheetsRoster()
      setMembers(googleSheetMembers)
    } catch (error) {
      console.error("Error fetching members from Google Sheets:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <ChimeraHeader />
      <div className="container mx-auto p-4 sm:p-8">
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black text-sm sm:text-base"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Done" : "Edit"}
          </Button>
        </div>

        {error && <div className="bg-red-500 text-white p-2 mb-4 rounded text-sm">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Card className="h-[150px] sm:h-[200px] flex items-center justify-center cursor-pointer border-dashed border-2 border-gray-700 hover:border-white transition-colors">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-black border border-gray-800 w-[90vw] max-w-lg sm:w-full">
              <DialogHeader>
                <DialogTitle className="text-white text-lg sm:text-xl">Add Tower</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                {towerTypes.map((type, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-white border-gray-700 hover:border-white text-sm sm:text-base"
                    onClick={() => handleAddTower(type)}
                  >
                    {type.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {towers.map((tower) => (
            <Card
              key={tower.id}
              className={`p-3 sm:p-4 bg-black border-gray-800 relative ${editMode ? "animate-wiggle" : ""}`}
              onDoubleClick={() => setSelectedTower(tower.id)}
            >
              {editMode && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 h-8 w-8 sm:h-10 sm:w-10"
                    onClick={() => handleDeleteTower(tower.id)}
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-yellow-500 hover:text-yellow-700 h-8 w-8 sm:h-10 sm:w-10",
                      tower.contest.isContested && "text-red-500 hover:text-red-700",
                    )}
                    onClick={() => openContestDialog(tower)}
                  >
                    <Swords className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base sm:text-lg font-bold text-white">{tower.name}</h3>
                {tower.contest.isContested && (
                  <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-500 border border-red-500/50">
                    Contested
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4">{tower.buff}</p>
              {tower.description && <p className="text-xs text-gray-500 mb-2 sm:mb-4">{tower.description}</p>}

              {tower.contest.isContested && tower.contest.opposingClan && (
                <div className="mb-2 sm:mb-4 p-2 rounded bg-red-500/10 border border-red-500/20">
                  <p className="text-xs sm:text-sm text-red-400">
                    War against: <span className="font-semibold">{tower.contest.opposingClan}</span>
                  </p>
                  {tower.contest.warDateTime && (
                    <p className="text-xs text-red-400/80">War Time: {format(tower.contest.warDateTime, "PPpp")}</p>
                  )}
                </div>
              )}

              <Dialog open={selectedTower === tower.id} onOpenChange={() => setSelectedTower(null)}>
                <DialogContent className="bg-black border border-gray-800 w-[90vw] max-w-lg sm:w-full">
                  <DialogHeader>
                    <DialogTitle className="text-white text-lg sm:text-xl">Add Member to {tower.name}</DialogTitle>
                  </DialogHeader>
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                  <div className="max-h-[50vh] overflow-y-auto">
                    {filteredMembers.map((member) => (
                      <Button
                        key={member.name}
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-gray-800 text-sm sm:text-base py-2 sm:py-3"
                        onClick={() => handleAddMember(tower.id, member.name)}
                      >
                        {member.name}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <div className="mt-2 sm:mt-4">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-1 sm:mb-2">Members:</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {tower.members.map((member) => (
                    <span
                      key={member}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-800 text-white"
                    >
                      {member}
                      {editMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-4 w-4 text-gray-400 hover:text-red-500"
                          onClick={() => handleRemoveMember(tower.id, member)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={contestDialogOpen} onOpenChange={setContestDialogOpen}>
          <DialogContent className="bg-black border border-gray-800 w-[90vw] max-w-lg sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-white text-lg sm:text-xl">Tower Contest Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="contested" className="text-white text-sm sm:text-base">
                  Is Contested?
                </Label>
                <Switch
                  id="contested"
                  checked={contestInfo.isContested}
                  onCheckedChange={(checked) => setContestInfo((prev) => ({ ...prev, isContested: checked }))}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>

              {contestInfo.isContested && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="opposing-clan" className="text-white text-sm sm:text-base">
                      Opposing Clan
                    </Label>
                    <Input
                      id="opposing-clan"
                      value={contestInfo.opposingClan || ""}
                      onChange={(e) => setContestInfo((prev) => ({ ...prev, opposingClan: e.target.value }))}
                      placeholder="Enter clan name"
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm sm:text-base">War Date & Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-sm sm:text-base",
                            !contestInfo.warDateTime && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {contestInfo.warDateTime ? format(contestInfo.warDateTime, "PPpp") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={contestInfo.warDateTime}
                          onSelect={(date) => setContestInfo((prev) => ({ ...prev, warDateTime: date }))}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            onChange={(e) => {
                              if (contestInfo.warDateTime) {
                                const [hours, minutes] = e.target.value.split(":")
                                const newDate = new Date(contestInfo.warDateTime)
                                newDate.setHours(Number.parseInt(hours))
                                newDate.setMinutes(Number.parseInt(minutes))
                                setContestInfo((prev) => ({ ...prev, warDateTime: newDate }))
                              }
                            }}
                            className="text-sm sm:text-base"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setContestDialogOpen(false)
                    setSelectedTowerForContest(null)
                  }}
                  className="text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedTowerForContest && handleUpdateContest(selectedTowerForContest)}
                  className="bg-red-500 hover:bg-red-600 text-sm sm:text-base"
                >
                  Save Contest Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleExportCSV} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
            Export CSV <Download className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={handleExportPNG} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
            Export PNG <Download className="ml-2 h-4 w-4" />
          </Button>
          <label htmlFor="importCSV" className="bg-[#2d3748] text-white hover:bg-[#3a4759] cursor-pointer flex items-center px-4 py-2 rounded-md">
            Import CSV <Upload className="ml-2 h-4 w-4" />
            <input id="importCSV" type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
          <label htmlFor="importPNG" className="bg-[#2d3748] text-white hover:bg-[#3a4759] cursor-pointer flex items-center px-4 py-2 rounded-md">
            Import PNG <Upload className="ml-2 h-4 w-4" />
            <input id="importPNG" type="file" accept=".png" onChange={handleImportPNG} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  )
}
