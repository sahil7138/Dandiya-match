"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface EventSettingsFormProps {
  settings: {
    eventName?: string | null
    eventDate?: Date | string | null
    eventTime?: string | null
    venue?: string | null
    eventDescription?: string | null
    registrationOpen?: boolean | null
    matchPoolOpen?: boolean | null
  } | null
}

export function EventSettingsForm({ settings }: EventSettingsFormProps) {
  const formattedDate = settings?.eventDate
    ? new Date(settings.eventDate).toISOString().split("T")[0]
    : "2026-10-17"

  return (
    <form className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Core details about the festival.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Event Name</Label>
            <Input defaultValue={settings?.eventName || "GENZ BLING NAVRATRI 2026"} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Date</Label>
              <Input type="date" defaultValue={formattedDate} />
            </div>
            <div className="space-y-2">
              <Label>Event Time</Label>
              <Input type="time" defaultValue={settings?.eventTime || "18:00"} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Venue</Label>
            <Input defaultValue={settings?.venue || ""} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea defaultValue={settings?.eventDescription || ""} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Event Lifecycle</CardTitle>
          <CardDescription>Control registration and matchmaking phases.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <p className="font-medium text-sm">Registration Open</p>
              <p className="text-xs text-muted-foreground">Allow new participants to register for passes.</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={settings?.registrationOpen ?? true}
              className="w-5 h-5 accent-primary rounded"
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <p className="font-medium text-sm">Match Pool Open</p>
              <p className="text-xs text-muted-foreground">Allow attendees to opt in to matchmaking.</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={settings?.matchPoolOpen ?? true}
              className="w-5 h-5 accent-primary rounded"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button">Discard Changes</Button>
        <Button type="button" disabled>Save Settings</Button>
      </div>
    </form>
  )
}
