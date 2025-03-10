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
import { X, Plus, Edit, Download, Upload, FileText } from "lucide-react"
import { exportMembersToCSV, exportMembersToPNG, importMembersFromCSV, importMembersFromPNG, getMembersFromGoogleSheetsRoster } from "../actions"

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
    <>
      <ChimeraHeader title="Members" />
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Members</h2>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
              Export CSV <Download className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={handleExportPNG} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
              Export PNG <Download className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={handleAddMember} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
              Add Member <Plus className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={handleFetchFromGoogleSheets} className="bg-[#2d3748] text-white hover:bg-[#3a4759]">
              Fetch from Google Sheets <FileText className="ml-2 h-4 w-4" />
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
