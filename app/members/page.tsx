"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ChimeraHeader } from "@/components/chimera-header"
import { memberData } from "@/lib/data"
import type { Member } from "@/lib/data"

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(memberData)
  const [filter, setFilter] = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const handleReadyToggle = (memberName: string) => {
    setMembers(members.map((member) => (member.name === memberName ? { ...member, isReady: !member.isReady } : member)))
  }

  const filteredMembers = members.filter((member) => {
    const nameMatch = member.name.toLowerCase().includes(filter.toLowerCase())
    const classMatch = classFilter === "all" || member.class === classFilter
    return nameMatch && classMatch
  })

  const uniqueClasses = Array.from(new Set(members.map((member) => member.class)))
  const readyCount = members.filter((member) => member.isReady).length

  return (
    <div className="min-h-screen bg-black">
      <ChimeraHeader />
      <div className="container mx-auto p-8">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Clan Roster</h2>
                <p className="text-gray-400">
                  Ready: {readyCount}/{members.length}
                </p>
              </div>
              <div className="flex gap-4">
                <Input
                  placeholder="Search members..."
                  className="w-[200px]"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {uniqueClasses.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Class</TableHead>
                  <TableHead className="text-white">Ready</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-white">{member.name}</TableCell>
                    <TableCell className="text-white">{member.class}</TableCell>
                    <TableCell>
                      <Switch
                        checked={member.isReady}
                        onCheckedChange={() => handleReadyToggle(member.name)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

