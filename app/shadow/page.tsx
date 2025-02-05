"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { ChimeraHeader } from "@/components/chimera-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { memberData, type Member } from "@/lib/data"
import { initialShadowWarData, type ShadowWar } from "@/lib/shadowWarData"
import { X, Clock, Download, History, Save } from "lucide-react"
import { differenceInSeconds, format } from "date-fns"
import html2canvas from "html2canvas"
import { useToast } from "@/components/ui/use-toast"
import {
  saveShadowWarSnapshot,
  getShadowWarSnapshotByDate,
  updateShadowWar,
  updatePlayerReadyStatus,
  getLatestShadowWarSnapshot,
} from "../actions"

export default function ShadowWarPage() {
  const [shadowWar, setShadowWar] = useState<ShadowWar>(initialShadowWarData)
  const [editMode, setEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [countdown, setCountdown] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportConfirmDialogOpen, setExportConfirmDialogOpen] = useState(false)
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const shadowWarRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const initializeData = async () => {
      try {
        const latestSnapshot = await getLatestShadowWarSnapshot()
        if (latestSnapshot) {
          setShadowWar(latestSnapshot)
        }
      } catch (error) {
        console.error("Error initializing data:", error)
      }
    }
    initializeData()
  }, [])

  const updateCountdown = useCallback(() => {
    if (shadowWar.warTime) {
      const now = new Date()
      const warTime = new Date(shadowWar.warTime)
      const diff = differenceInSeconds(warTime, now)
      if (diff > 0) {
        const hours = Math.floor(diff / 3600)
        const minutes = Math.floor((diff % 3600) / 60)
        const seconds = diff % 60
        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`,
        )
      } else {
        setCountdown("War has started!")
      }
    } else {
      setCountdown(null)
    }
  }, [shadowWar.warTime])

  useEffect(() => {
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [updateCountdown])

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return

      const sourceWarTypeIndex = Number.parseInt(result.source.droppableId.split("-")[0])
      const sourceMatchIndex = Number.parseInt(result.source.droppableId.split("-")[1])
      const destWarTypeIndex = Number.parseInt(result.destination.droppableId.split("-")[0])
      const destMatchIndex = Number.parseInt(result.destination.droppableId.split("-")[1])

      const newShadowWar = { ...shadowWar }
      const [removed] = newShadowWar.warTypes[sourceWarTypeIndex].matches[sourceMatchIndex].players.splice(
        result.source.index,
        1,
      )
      newShadowWar.warTypes[destWarTypeIndex].matches[destMatchIndex].players.splice(
        result.destination.index,
        0,
        removed,
      )

      setShadowWar(newShadowWar)
    },
    [shadowWar],
  )

  const handleAddPlayer = (warTypeIndex: number, matchIndex: number, player: Member) => {
    const newShadowWar = { ...shadowWar }
    newShadowWar.warTypes[warTypeIndex].matches[matchIndex].players.push(player)
    setShadowWar(newShadowWar)
    setDialogOpen(false)
  }

  const handleRemovePlayer = (warTypeIndex: number, matchIndex: number, playerIndex: number) => {
    const newShadowWar = { ...shadowWar }
    newShadowWar.warTypes[warTypeIndex].matches[matchIndex].players.splice(playerIndex, 1)
    setShadowWar(newShadowWar)
  }

  const handleToggleReady = async (warTypeIndex: number, matchIndex: number, playerIndex: number) => {
    try {
      const player = shadowWar.warTypes[warTypeIndex].matches[matchIndex].players[playerIndex]
      const updatedSnapshot = await updatePlayerReadyStatus(warTypeIndex, matchIndex, playerIndex, !player.isReady)
      setShadowWar(updatedSnapshot)
    } catch (error) {
      console.error("Error toggling player ready status:", error)
    }
  }

  const handleSetWarTime = (dateTimeString: string) => {
    const newShadowWar = { ...shadowWar }
    newShadowWar.warTime = new Date(dateTimeString)
    setShadowWar(newShadowWar)
  }

  const filteredMembers = memberData.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleExportPNG = async () => {
    if (!shadowWarRef.current) return

    const allPlayersReady = shadowWar.warTypes.every((warType) =>
      warType.matches.every((match) => match.players.every((player) => player.isReady)),
    )

    if (!allPlayersReady) {
      setExportConfirmDialogOpen(true)
      return
    }

    await exportPNG()
  }

  const exportPNG = async () => {
    if (!shadowWarRef.current) return

    // Temporarily remove max-height and overflow from ScrollArea
    const scrollAreas = shadowWarRef.current.querySelectorAll(".scroll-area")
    scrollAreas.forEach((area) => {
      area.classList.remove("h-48")
      area.classList.add("h-auto")
    })

    const canvas = await html2canvas(shadowWarRef.current, {
      backgroundColor: "#000000",
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
    })

    // Restore ScrollArea styles
    scrollAreas.forEach((area) => {
      area.classList.add("h-48")
      area.classList.remove("h-auto")
    })

    const dataURL = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = "shadow-war-roster.png"
    link.href = dataURL
    link.click()

    setExportDialogOpen(false)
    setExportConfirmDialogOpen(false)
  }

  const handleSaveSnapshot = async () => {
    setIsLoading(true)
    try {
      await saveShadowWarSnapshot(shadowWar)
      toast({
        title: "Success",
        description: "Shadow War data saved successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving snapshot:", error)
      toast({
        title: "Error",
        description: "Failed to save Shadow War data.",
        duration: 3000,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRollback = async () => {
    setIsLoading(true)
    try {
      const lastWeekSnapshot = await getShadowWarSnapshotByDate(new Date("2025-01-30"))
      if (lastWeekSnapshot) {
        await updateShadowWar(lastWeekSnapshot)
        setShadowWar(lastWeekSnapshot)
        toast({
          title: "Success",
          description: "Rolled back to last week's roster.",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error rolling back:", error)
      toast({
        title: "Error",
        description: "Failed to rollback to last week's roster.",
        duration: 3000,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setRollbackDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <ChimeraHeader />
      <div className="container mx-auto p-8 bg-black">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Shadow War</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-white" />
              <Input
                type="datetime-local"
                value={shadowWar.warTime ? format(new Date(shadowWar.warTime), "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) => handleSetWarTime(e.target.value)}
                className="bg-gray-900 text-white border-gray-800"
              />
            </div>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Done" : "Edit"}
            </Button>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
              onClick={handleExportPNG}
            >
              <Download className="mr-2 h-4 w-4" /> Export PNG
            </Button>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
              onClick={() => setRollbackDialogOpen(true)}
            >
              <History className="mr-2 h-4 w-4" /> Use Last Week's Roster
            </Button>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
              onClick={handleSaveSnapshot}
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        {countdown && (
          <Card className="mb-6 bg-gray-900 border-gray-800">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-4xl font-bold text-white">{countdown}</div>
            </CardContent>
          </Card>
        )}

        <div ref={shadowWarRef}>
          <DragDropContext onDragEnd={handleDragEnd}>
            {shadowWar.warTypes.map((warType, warTypeIndex) => (
              <Card key={warType.name} className="mb-6 bg-black border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    {warType.name} ({warType.points} points)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {warType.matches.map((match, matchIndex) => (
                      <Droppable key={match.id} droppableId={`${warTypeIndex}-${matchIndex}`}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="bg-[#111] p-4 rounded-lg"
                          >
                            <h3 className="text-lg font-semibold text-white mb-2">{match.name}</h3>
                            <ScrollArea className="scroll-area h-48 w-full">
                              {match.players.map((player, playerIndex) => (
                                <Draggable
                                  key={player.name}
                                  draggableId={`${match.id}-${player.name}`}
                                  index={playerIndex}
                                  isDragDisabled={!editMode || player.isReady}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center justify-between bg-black p-2 mb-2 rounded border border-gray-800"
                                    >
                                      <span className="text-white">
                                        {player.name} - {player.class}
                                      </span>
                                      <div className="flex items-center">
                                        <Switch
                                          checked={player.isReady}
                                          onCheckedChange={() =>
                                            handleToggleReady(warTypeIndex, matchIndex, playerIndex)
                                          }
                                          className="mr-2"
                                        />
                                        {editMode && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemovePlayer(warTypeIndex, matchIndex, playerIndex)}
                                          >
                                            <X className="h-4 w-4 text-red-500" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </ScrollArea>
                            {editMode && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full text-white border-gray-700 hover:bg-gray-600"
                                onClick={() => {
                                  setSelectedMatch(`${warTypeIndex}-${matchIndex}`)
                                  setDialogOpen(true)
                                }}
                              >
                                Add Player
                              </Button>
                            )}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </DragDropContext>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add Player</DialogTitle>
              <DialogDescription className="text-gray-400">
                Search and select a player to add to the match.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-white border-gray-700"
              />
              <ScrollArea className="h-64">
                {filteredMembers.map((member) => (
                  <Button
                    key={member.name}
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-gray-800"
                    onClick={() => {
                      if (selectedMatch) {
                        const [warTypeIndex, matchIndex] = selectedMatch.split("-").map(Number)
                        handleAddPlayer(warTypeIndex, matchIndex, member)
                      }
                    }}
                  >
                    {member.name} - {member.class}
                  </Button>
                ))}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={exportConfirmDialogOpen} onOpenChange={setExportConfirmDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Confirm Export</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to export even if all users are not ready?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setExportConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={exportPNG}>Yes, Export</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Use Last Week's Roster?</DialogTitle>
              <DialogDescription className="text-gray-400">
                This will load the roster from 1/30/2025. Any unsaved changes will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRollbackDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleRollback} disabled={isLoading}>
                {isLoading ? "Loading..." : "Yes, Use Last Week's Roster"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

