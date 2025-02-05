"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ChimeraHeader } from "@/components/chimera-header"
import { memberData } from "@/lib/data"
import type { Member } from "@/lib/types"
import { X, Plus, Edit } from "lucide-react"

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(memberData)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null)
  const [newMember, setNewMember] = useState({
    name: "",
    class: "",
    cr: 0,
    resonance: 0,
    level: 0,
  })
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const uniqueClasses = [...new Set(members.map((member) => member.class))]

  const handleEditMember = (member: Member) => {
    setMemberToEdit(member)
    setEditDialogOpen(true)
  }

  const confirmEditMember = () => {
    if (memberToEdit) {
      const updatedMembers = members.map((member) => (member.id === memberToEdit.id ? memberToEdit : member))
      setMembers(updatedMembers)
      setEditDialogOpen(false)
      setMemberToEdit(null)
    }
  }

  const handleAddMember = () => {
    setAddDialogOpen(true)
  }

  const confirmAddMember = () => {
    if (newMember.name.trim() !== "") {
      const newMemberId = members.length > 0 ? Math.max(...members.map((member) => member.id)) + 1 : 1
      const newMemberWithId = { ...newMember, id: newMemberId }
      setMembers([...members, newMemberWithId])
      setNewMember({ name: "", class: "", cr: 0, resonance: 0, level: 0 })
      setAddDialogOpen(false)
    }
  }

  const handleRemoveMember = (id: number) => {
    const updatedMembers = members.filter((member) => member.id !== id)
    setMembers(updatedMembers)
  }

  return (
    <>
      <ChimeraHeader title="Members" />
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Members</h2>
          <Button onClick={handleAddMember} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
            Add Member <Plus className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>CR</TableCell>
                <TableCell>Resonance</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.class}</TableCell>
                  <TableCell>{member.cr}</TableCell>
                  <TableCell>{member.resonance}</TableCell>
                  <TableCell>{member.level}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => handleEditMember(member)}
                      className="bg-[#2d3748] text-white hover:bg-[#3a4759]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleRemoveMember(member.id)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-[#1a202c] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Add Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newMemberName" className="text-white">
                Name
              </Label>
              <Input
                id="newMemberName"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="bg-[#131B2C] text-white border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="newMemberClass" className="text-white">
                Class
              </Label>
              <Select value={newMember.class} onValueChange={(value) => setNewMember({ ...newMember, class: value })}>
                <SelectTrigger id="newMemberClass" className="bg-[#131B2C] text-white border-gray-800">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a202c] border-gray-800">
                  {uniqueClasses.map((className) => (
                    <SelectItem
                      key={className}
                      value={className}
                      className="text-white hover:bg-[#2d3748] focus:bg-[#2d3748]"
                    >
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newMemberCR" className="text-white">
                CR
              </Label>
              <Input
                id="newMemberCR"
                type="number"
                value={newMember.cr}
                onChange={(e) => setNewMember({ ...newMember, cr: Number(e.target.value) })}
                className="bg-[#131B2C] text-white border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="newMemberResonance" className="text-white">
                Resonance
              </Label>
              <Input
                id="newMemberResonance"
                type="number"
                value={newMember.resonance}
                onChange={(e) => setNewMember({ ...newMember, resonance: Number(e.target.value) })}
                className="bg-[#131B2C] text-white border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="newMemberLevel" className="text-white">
                Level
              </Label>
              <Input
                id="newMemberLevel"
                type="number"
                value={newMember.level}
                onChange={(e) => setNewMember({ ...newMember, level: Number(e.target.value) })}
                className="bg-[#131B2C] text-white border-gray-800"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setAddDialogOpen(false)} className="text-white hover:bg-[#2d3748]">
              Cancel
            </Button>
            <Button onClick={confirmAddMember} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#1a202c] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editMemberName" className="text-white">
                Name
              </Label>
              <Input
                id="editMemberName"
                value={memberToEdit?.name || ""}
                onChange={(e) => setMemberToEdit(memberToEdit ? { ...memberToEdit, name: e.target.value } : null)}
                className="bg-[#131B2C] text-white border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="editMemberClass" className="text-white">
                Class
              </Label>
              <Select
                value={memberToEdit?.class || ""}
                onValueChange={(value) => setMemberToEdit(memberToEdit ? { ...memberToEdit, class: value } : null)}
              >
                <SelectTrigger id="editMemberClass" className="bg-[#131B2C] text-white border-gray-800">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a202c] border-gray-800">
                  {uniqueClasses.map((className) => (
                    <SelectItem
                      key={className}
                      value={className}
                      className="text-white hover:bg-[#2d3748] focus:bg-[#2d3748]"
                    >
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editMemberCR" className="text-white">
                CR
              </Label>
              <Input
                id="editMemberCR"
                type="number"
                value={memberToEdit?.cr || ""}
                onChange={(e) => setMemberToEdit(memberToEdit ? { ...memberToEdit, cr: Number(e.target.value) } : null)}
                className="bg-[#131B2C] text-white border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="editMemberResonance" className="text-white">
                Resonance
              </Label>
              <Input
                id="editMemberResonance"
                type="number"
                value={memberToEdit?.resonance || ""}
                onChange={(e) =>
                  setMemberToEdit(memberToEdit ? { ...memberToEdit, resonance: Number(e.target.value) } : null)
                }
                className="bg-[#131B2C] text-white border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="editMemberLevel" className="text-white">
                Level
              </Label>
              <Input
                id="editMemberLevel"
                type="number"
                value={memberToEdit?.level || ""}
                onChange={(e) =>
                  setMemberToEdit(memberToEdit ? { ...memberToEdit, level: Number(e.target.value) } : null)
                }
                className="bg-[#131B2C] text-white border-gray-800"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)} className="text-white hover:bg-[#2d3748]">
              Cancel
            </Button>
            <Button onClick={confirmEditMember} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

