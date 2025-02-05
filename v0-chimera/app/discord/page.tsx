"use client"

import { useState } from "react"
import { ChimeraHeader } from "@/components/chimera-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { submitApplication } from "../actions"

const classes = ["Barbarian", "Blood Knight", "Crusader", "Demon Hunter", "Monk", "Necromancer", "Tempest", "Wizard"]

export default function DiscordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await submitApplication(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Application Submitted",
        description: result.message,
        duration: 5000,
      })
      // Reset form here if needed
    } else {
      toast({
        title: "Submission Failed",
        description: result.message,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ChimeraHeader />
      <div className="container mx-auto p-8">
        <Card className="max-w-2xl mx-auto bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Join Chimera</CardTitle>
            <CardDescription className="text-gray-400">
              Fill out this application form to join our clan. Your application will be sent to our leadership team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">
                    Character Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    className="bg-input text-foreground border-border"
                    placeholder="Your in-game character name"
                  />
                </div>

                <div>
                  <Label htmlFor="battleTag" className="text-white">
                    Battle Tag
                  </Label>
                  <Input
                    id="battleTag"
                    name="battleTag"
                    required
                    className="bg-input text-foreground border-border"
                    placeholder="YourName#1234"
                  />
                </div>

                <div>
                  <Label htmlFor="class" className="text-white">
                    Class
                  </Label>
                  <Select name="class" required>
                    <SelectTrigger id="class" className="bg-input text-foreground border-border">
                      <SelectValue placeholder="Select your class" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {classes.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cr" className="text-white">
                    Combat Rating (CR)
                  </Label>
                  <Input
                    id="cr"
                    name="cr"
                    type="number"
                    required
                    className="bg-input text-foreground border-border"
                    placeholder="Your current CR"
                  />
                </div>

                <div>
                  <Label htmlFor="resonance" className="text-white">
                    Resonance
                  </Label>
                  <Input
                    id="resonance"
                    name="resonance"
                    type="number"
                    required
                    className="bg-input text-foreground border-border"
                    placeholder="Your current Resonance"
                  />
                </div>

                <div>
                  <Label htmlFor="level" className="text-white">
                    Level
                  </Label>
                  <Input
                    id="level"
                    name="level"
                    type="number"
                    required
                    className="bg-input text-foreground border-border"
                    placeholder="Your current Level"
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-white">
                    Previous Clan Experience
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    required
                    className="bg-input text-foreground border-border"
                    placeholder="Tell us about your previous clan experience"
                  />
                </div>

                <div>
                  <Label htmlFor="availability" className="text-white">
                    Availability for Clan Activities
                  </Label>
                  <Input
                    id="availability"
                    name="availability"
                    required
                    className="bg-input text-foreground border-border"
                    placeholder="What times are you usually available?"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

