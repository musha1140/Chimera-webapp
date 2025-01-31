"use client"

import { useState, useCallback, useEffect } from "react"
import { ChimeraHeader } from "@/components/chimera-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { memberData, type Member } from "@/lib/data"
import { initialShadowWarData, type ShadowWar } from "@/lib/shadowWarData"
import { X, Clock } from "lucide-react"
import { format, differenceInSeconds } from "date-fns"

export default function ShadowWarPage() {
  const [shadowWar, setShadowWar] = useState<ShadowWar>(initialShadowWarData)
  const [editMode, setEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [countdown, setCountdown] = useState<string | null>(null)

  const updateCountdown = useCallback(() => {
    if (shadowWar.warTime) {
      const diff = differenceInSeconds(shadowWar.warTime, new Date())
      if (diff > 0) {
        const hours = Math.floor(diff / 3600)
        const minutes = Math.floor((diff % 3600) / 60)
        const seconds = diff % 60
        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
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

  const handleToggleReady = (warTypeIndex: number, matchIndex: number, playerIndex: number) => {
    const newShadowWar = { ...shadowWar }
    const player = newShadowWar.warTypes[warTypeIndex].matches[matchIndex].players[playerIndex]
    player.isReady = !player.isReady
    setShadowWar(newShadowWar)
  }

  const handleSetWarTime = (dateTimeString: string) => {
    const newShadowWar = { ...shadowWar }
    newShadowWar.warTime = new Date(dateTimeString)
    setShadowWar(newShadowWar)
  }

  const filteredMembers = memberData.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
                value={shadowWar.warTime ? format(shadowWar.warTime, "yyyy-MM-dd'T'HH:mm") : ""}
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
          </div>
        </div>

        {countdown && (
          <Card className="mb-6 bg-gray-900 border-gray-800">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-4xl font-bold text-white">{countdown}</div>
            </CardContent>
          </Card>
        )}

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
                        <div ref={provided.innerRef} {...provided.droppableProps} className="bg-[#111] p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">{match.name}</h3>
                          <ScrollArea className="h-48 w-full">
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
                                    <span className="text-white">{player.name}</span>
                                    <div className="flex items-center">
                                      <Switch
                                        checked={player.isReady}
                                        onCheckedChange={() => handleToggleReady(warTypeIndex, matchIndex, playerIndex)}
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add Player</DialogTitle>
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
                    {member.name}
                  </Button>
                ))}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

