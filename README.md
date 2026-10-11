# ✨ GENZ BLING NAVRATRI 2026

> **Pune's Most Hyped Modern Dandiya & Matchmaking Experience**  
> *Garba | Glam | Glow • Live Music • DJ • Secret Partner Matchmaking*  
> **17th October 2026** at **Noupark Turf, Near Premia Society, Narhe, Pune**

---

## 🌟 Leadership & Partnerships
- **Organized By:** **EventWale** — Premier event curation, production, and cultural nightlife experiences.
- **Technology Partner:** [**Webwork Studios LLP**](https://webworksstudios.com/) — Modern web application engineering, ticketing verification, and algorithmic matchmaking platform.

---

## 🪩 Key Features
- **Curated Pass Tiers:**
  - 👤 **Solo Pass (₹299):** Entry for 1 • Eligible for 24-Hour Secret Dandiya Matchmaking.
  - 👫 **Duo Pass (₹549):** Entry for 2 • For couples & dynamic duos.
  - 👥 **Bling Squad (₹1,149):** Entry for 4 • Group fast-track lane.
  - 👨‍👩‍👧‍👦 **Bling Gang (₹2,799):** Entry for 10 • Lowest per-person rate (₹280/p).
- **Official UPI Payment Integration:**
  - Official Google Pay UPI QR code image with 1-click UPI ID copy (`venkateshpuliraj035-2@okhdfcbank`).
  - Seamless screenshot upload & instant verification workflow.
- **Attendee Mobile & Pass Number Login:**
  - Secure pass holder authentication using registered 10-digit mobile number and official GBN Pass Number (e.g. `GBN-0001`).
  - Integrated "Retrieve Pass Number" lookup assistant for attendees.
- **Secret Dandiya Matchmaking:**
  - Participants select their age bracket, dance experience, festival vibe, and preferred partner gender (Male, Female, or Any).
  - Matches remain strictly confidential and locked until 24 hours before the event, unlocking on the attendee dashboard.
- **Attendee Dashboard:**
  - Digital VIP holographic wristband pass with auto-generated GBN Number (e.g. `GBN-0001`).
  - Real-time countdown timer to the match reveal.
  - Partner reveal card with mutual connect options.
- **Admin Management Portal:**
  - Interactive participant registry with live search by name, phone, or GBN pass number.
  - Instant UPI screenshot payment verification & ticket approval.
  - One-click algorithmic matchmaking generator.
  - Event controls & reveal timer configuration.

---

## 📂 Project Organization

```
dandiya-match/
├── prisma/
│   └── schema.prisma          # PostgreSQL schema (Users, Passes, Matches, Settings)
├── public/
│   ├── logo.png               # Official GENZ BLING NAVRATRI artwork
│   ├── genz-bling-logo.png    # High-res festival logo
│   ├── payment-qr.png         # Official Google Pay UPI QR Code (Venkatesh Puliraj)
│   ├── partners/              # Official organizer & tech partner brand assets
│   └── Sponsores/             # Festival sponsors brand assets
├── src/
│   ├── actions/               # Next.js Server Actions
│   │   ├── admin-auth.ts      # Admin session & authentication
│   │   ├── admin-payments.ts  # Ticket approval & rejection workflow
│   │   ├── auth.ts            # Attendee Mobile + Pass Number login & pass lookup
│   │   ├── matchmaking.ts     # Algorithmic partner matching engine
│   │   └── register.ts        # Pass booking & transaction handler
│   ├── app/
│   │   ├── admin/             # Organizer & Admin Portal
│   │   │   ├── event/         # Event metadata & lifecycle settings
│   │   │   ├── login/         # Admin portal authentication
│   │   │   ├── matches/       # Partner pairs & reveal lock controls
│   │   │   ├── matchmaking/   # Algorithmic matchmaking generator
│   │   │   ├── participants/  # Attendee registry & interactive search
│   │   │   └── payments/      # UPI payment screenshot approvals
│   │   ├── dashboard/         # Attendee Pass & Secret Match reveal dashboard
│   │   ├── login/             # Attendee Mobile & Pass Number Login
│   │   ├── register/          # 3-Step Pass Booking Wizard & UPI QR payment
│   │   ├── rules/             # Matchmaking & Community Guidelines
│   │   ├── globals.css        # Luxury GenZ dark mode styling & design tokens
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # High-impact Landing Page
│   ├── components/
│   │   ├── countdown.tsx      # Real-time event countdown timer
│   │   ├── footer.tsx         # Contact helplines, venue map & partner credits
│   │   ├── navbar.tsx         # Floating glassmorphic header
│   │   └── ui/                # Accessible design system components (Radix/shadcn)
│   ├── lib/
│   │   ├── prisma.ts          # Singleton Prisma Client
│   │   └── utils.ts           # Class merger utilities
│   └── types/
│       └── index.ts           # Centralized TypeScript interfaces & domain types
└── package.json
```

---

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router with Turbopack)
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Styling:** Tailwind CSS v4, Vanilla CSS Design System, Glassmorphism
- **Animations:** Framer Motion
- **UI Components:** Radix UI primitives & Lucide Icons
- **Forms & Validation:** React Hook Form + Zod

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dandiya_match?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/dandiya_match?schema=public"
```

### 3. Initialize Database
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📞 Event Enquiries
- **Helpline 1:** +91 7709468117
- **Helpline 2:** +91 8080206737
- **Helpline 3:** +91 9130389407
- **Helpline 4:** +91 9689582000
- **Venue:** Noupark Turf, Near Premia Society, Narhe, Pune
