import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default async function EventSettingsPage() {
  const settings = await prisma.eventSettings.findFirst()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">Event Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global configuration for your Dandiya Match event.</p>
      </div>

      <form className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Core details about the event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input defaultValue={settings?.eventName || "GENZ BLING NAVRATRI 2026"} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Input type="date" defaultValue={settings?.eventDate ? new Date(settings.eventDate).toISOString().split('T')[0] : "2026-10-17"} />
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
                <p className="font-medium">Registration Open</p>
                <p className="text-sm text-muted-foreground">Allow new participants to register.</p>
              </div>
              <input type="checkbox" defaultChecked={settings?.registrationOpen ?? true} className="w-5 h-5 text-primary rounded" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <p className="font-medium">Match Pool Open</p>
                <p className="text-sm text-muted-foreground">Allow participants to opt-in to matchmaking.</p>
              </div>
              <input type="checkbox" defaultChecked={settings?.matchPoolOpen ?? true} className="w-5 h-5 text-primary rounded" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button">Discard Changes</Button>
          <Button type="button" disabled>Save Settings</Button>
        </div>
      </form>
    </div>
  )
}
