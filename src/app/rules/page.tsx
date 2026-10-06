import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden pt-12 pb-24 px-4">
      <div className="absolute inset-0 -z-10 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      
      <div className="w-full max-w-3xl mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">← Back to Home</Link>
      </div>

      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold font-outfit text-primary">Matchmaking Rules</h1>
        <p className="text-xl text-muted-foreground">Please read these rules carefully before participating in the Random Dandiya Partner matchmaking.</p>

        <Card className="p-8 space-y-6 bg-card border-border">
          <ul className="space-y-6 list-none p-0 m-0">
            <li className="flex gap-4">
              <span className="text-2xl font-bold text-primary opacity-50 font-outfit">01</span>
              <div>
                <h3 className="text-xl font-bold mb-1">Eligibility</h3>
                <p className="text-muted-foreground">Random partner matching is available ONLY for eligible Single Ticket participants. Couple Entry and Group Entry cannot participate in Random Partner matching.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl font-bold text-primary opacity-50 font-outfit">02</span>
              <div>
                <h3 className="text-xl font-bold mb-1">It's Truly Random</h3>
                <p className="text-muted-foreground">Matching is entirely random. While we ask for age, experience, and vibe to potentially balance the pool, you are not guaranteed a partner that matches those exact preferences. The spirit of the event is to meet someone new and have fun!</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl font-bold text-primary opacity-50 font-outfit">03</span>
              <div>
                <h3 className="text-xl font-bold mb-1">The 24-Hour Reveal</h3>
                <p className="text-muted-foreground">Match results remain hidden until the configured reveal time (typically 24 hours before the event starts). You cannot see your partner before the countdown ends.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl font-bold text-primary opacity-50 font-outfit">04</span>
              <div>
                <h3 className="text-xl font-bold mb-1">Privacy First</h3>
                <p className="text-muted-foreground">Partner contact information (phone number, email) is NOT automatically shared. You will only see your partner's name and basic Dandiya preferences. You must meet up at the venue or use mutual consent to share contact info.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl font-bold text-primary opacity-50 font-outfit">05</span>
              <div>
                <h3 className="text-xl font-bold mb-1">Not a Dating App</h3>
                <p className="text-muted-foreground">Matchmaking is for the Dandiya event experience and is NOT a dating or matrimonial service. Keep it respectful, fun, and purely about the dance!</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl font-bold text-primary opacity-50 font-outfit">06</span>
              <div>
                <h3 className="text-xl font-bold mb-1">Respect & Conduct</h3>
                <p className="text-muted-foreground">Participants must behave respectfully at all times. Event admins reserve the right to remove or block participants who violate event rules or make others uncomfortable.</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
