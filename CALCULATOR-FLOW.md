# Befach Air Freight Calculator — Complete UI Flow & Reference

This document describes everything you need to build a new UI for the calculator. The logic lives in `../core/` and `../storage/` — this doc covers the **user flow, form fields, layout, formulas, and visual components**.

---

## 1. Calculator Overview

There are two calculator pages:

### Cost Calculator (Trade Type Selector)
A 2-step selector that routes the user to the correct calculator:
- **Step 1**: Choose trade type → Import or Export (Export = "Coming Soon")
- **Step 2**: Choose shipping mode → Air Freight or Sea Freight (Sea = "Coming Soon")
- Selecting Import + Air routes to the **Air Freight Calculator**

### Air Freight Calculator (Main Calculator)
A **3-step wizard** with a results panel:
```
Step 1: Route & Currency → Step 2: HSN & Duties → Step 3: Package Details → [Calculate] → Results
```

---

## 2. Wizard Steps — Detailed Form Fields

### Step 1: Route & Currency

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| Origin Country | Searchable dropdown | Yes | — | 190+ countries from `countryZones` in `dhlRates.ts`. Shows country code + name. |
| Currency | Select dropdown | No | `USD` | Options: USD, EUR, GBP, CNY, INR |
| Exchange Rate | Number input | If currency != INR | `85` | INR per 1 unit of selected currency. Hidden when currency = INR. |

**Validation**: Can advance when country is selected AND (currency is INR OR exchange rate > 0).

### Step 2: HSN & Duties

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| HSN Code | Searchable dropdown | No | — | Uses `searchHSNCodes()` from `calculatorUtils.ts`. Auto-populates duty rates when selected. Shows: code, description, BCD%, GST%. |
| Custom Duty (BCD) % | Number input | Yes | — | Basic Customs Duty percentage. Auto-filled from HSN lookup. |
| GST / IGST % | Number input | Yes | — | Goods & Services Tax. Auto-filled from HSN lookup. |

**Extra**: Link to ICEGATE (Indian customs portal) for HSN verification.

**Validation**: Can advance when both BCD% and GST% have values.

### Step 3: Package Details

**Product section:**

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| Product Name | Text input | No | — | Free text, e.g. "GNSS Receiver" |
| Price per Unit | Number input | Yes | — | In selected currency |
| Quantity | Number input | No | `1` | Number of units |
| Total Value | Readonly display | — | Calculated | price x quantity |

**Dimensions section** (uses `PackageDimensions` component):

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Length (cm) | Number | 0 | Per-box dimension |
| Width (cm) | Number | 0 | Per-box dimension |
| Height (cm) | Number | 0 | Per-box dimension |
| Weight per box (kg) | Number | 0 | Actual physical weight |
| No. of Packages | Number | 1 | Multiple identical boxes |

**Computed values shown inline:**
- **CBM** = L x W x H x packages / 1,000,000
- **Volumetric Weight** = L x W x H / 5000 per box x packages
- **Gross Weight** = weight per box x packages
- **Chargeable Weight** = max(gross, volumetric), rounded up to 0.5 kg

**Inland Shipping section** (optional toggle):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Include Inland Delivery | Checkbox toggle | No | Enables the section below |
| Clearance Port | Select dropdown | Yes (if toggled on) | 6 ports: Mumbai, Delhi, Chennai, Bangalore, Hyderabad, Kolkata |
| Destination City | Searchable dropdown | Yes (if toggled on) | 50+ Indian cities from `inlandRates.ts`. Auto-resolves delivery zone. |
| Manual Zone Selection | 5-option grid | Fallback | If city not found. Zones A-E with labels and distance ranges. |

**Validation**: Can calculate when product value > 0 AND chargeable weight > 0 AND (no inland OR inland zone + port selected).

---

## 3. Calculation Formulas

Constants (hidden margins applied on top of rates):
```
MARGIN_FREIGHT     = 5%   (on DHL transportation)
MARGIN_FUEL        = 3%   (on fuel surcharge)
MARGIN_PROCESSING  = 2%   (customs processing fee)
```

### Core Formula
```
1. DHL Base Freight = getDHLFreight(chargeableWeight, zone)    // from dhlRates.ts
2. Transportation   = DHL Base Freight x 1.05                  // +5% margin
3. Fuel Surcharge   = DHL Base Freight x 30.5% x 1.03          // +3% margin

4. CIF Value        = Product Value + Transportation (in currency)

5. BCD              = CIF x customDutyPercent                   // Basic Customs Duty
6. SWS              = BCD x 10%                                 // Social Welfare Surcharge
7. IGST             = (CIF + BCD + SWS) x gstPercent           // Integrated GST

8. Customs Processing = (BCD + SWS + IGST) x 2%                // processing margin

9. Total = Product Value + Transportation + Fuel Surcharge + BCD + SWS + IGST + Customs Processing
```

### Optional Inland Addition
```
If includeInland:
  Inland Cost = getInlandShippingCost(chargeableWeight, zone, port)  // from inlandRates.ts
  Grand Total = Total + Inland Cost
```

### Currency Handling
- All DHL rates are in INR
- If user selects USD with exchange rate 85: `transportationCurrency = transportationINR / 85`
- Results show both currency and INR amounts

---

## 4. Layout Structure

### Desktop (>768px): Two-Column Split
```
┌──────────────────────────────────────────────────────────────┐
│                     Page Header (Plane icon + title)          │
├────────────────────────────┬─────────────────────────────────┤
│         LEFT (50%)         │        RIGHT (50%, sticky)       │
│                            │                                  │
│  ┌──────────────────────┐  │  ┌────────────────────────────┐  │
│  │    Stepper Bar        │  │  │  Total Landed Cost         │  │
│  │  [1]──[2]──[3]       │  │  │  $533.29 (₹45,329)        │  │
│  └──────────────────────┘  │  └────────────────────────────┘  │
│                            │                                  │
│  ┌──────────────────────┐  │  ┌──────────┬─────────────────┐  │
│  │    Form Card          │  │  │ Route    │ Chargeable Wt   │  │
│  │    (current step)     │  │  ├──────────┼─────────────────┤  │
│  │                       │  │  │ Gross Wt │ CBM             │  │
│  │    [Next / Calculate] │  │  └──────────┴─────────────────┘  │
│  └──────────────────────┘  │                                  │
│                            │  ┌────────────────────────────┐  │
│                            │  │  Cost Breakdown             │  │
│                            │  │  Product Value    $100.00   │  │
│                            │  │  Air Freight      $175.72   │  │
│                            │  │  Fuel Surcharge    $43.38   │  │
│                            │  │  ────── CIF ──────────────  │  │
│                            │  │  BCD (7.5%)        $23.93   │  │
│                            │  │  SWS (10%)          $2.39   │  │
│                            │  │  IGST (18%)        $62.18   │  │
│                            │  │  Processing         $8.29   │  │
│                            │  │  ═══════════════════════════ │  │
│                            │  │  TOTAL            $533.29   │  │
│                            │  └────────────────────────────┘  │
│                            │                                  │
│                            │  [Download PDF] [New Calculation] │
└────────────────────────────┴─────────────────────────────────┘
```

### Mobile (<768px): Single Column
```
┌──────────────────────────┐
│ Header                   │
│ Stepper Bar (icons only) │
│ Form Card                │
│ [Next / Calculate]       │
│                          │
│ (Results appear below    │
│  after calculation)      │
│                          │
│ Total Landed Cost card   │
│ Metric cards (2x2)       │
│ Cost Breakdown           │
│ [Download] [New Calc]    │
│                          │
│ (80px bottom padding     │
│  for mobile nav bar)     │
└──────────────────────────┘
```

### Responsive Breakpoints
| Breakpoint | Changes |
|------------|---------|
| **1024px** | App sidebar hidden, mobile drawer takes over |
| **768px** | Single column layout. Form grids collapse to 1 column. Stepper font smaller. Header subtitle hidden. Bottom padding 100px. |
| **480px** | Stepper labels hidden (icons only). All grids single column. Inputs min-height 44px for touch. |

---

## 5. Component Catalog

### Stepper Bar
- **3 steps** with icons: Globe (Route), FileText (HSN), Package (Details)
- **3 states per step**: Inactive (gray circle), Active (orange border, icon visible), Complete (green circle with checkmark)
- **Connecting lines** between steps: gray when inactive, green when step is complete
- **Mobile**: Short labels ("Route" instead of "Route & Currency"), hidden entirely at 480px

### PackageDimensions Component (from `components/PackageDimensions.tsx`)
- **3D animated box**: CSS 3D with 6 faces, perspective 500px, isometric rotation (-20deg X, -30deg Y)
- **Box faces**: Orange borders (#f97316) with varying opacity per face (top=15%, left=12%, front=8%, etc.)
- **Framer Motion**: Spring animation (stiffness: 200, damping: 20) when dimensions change
- **Inline badges**: CBM (indigo), Volumetric Weight (orange when used), Gross Weight (orange when used)
- **Chargeable weight display**: Green bordered card showing the billing weight
- **Package count badge**: "x3" overlay on box when multiple packages

### Result Summary Cards
- **Primary card**: Orange gradient (linear-gradient 135deg, #f97316 → #ea580c), white text, total amount large
- **Secondary cards**: White background, subtle border, 2x2 grid (Route, Chargeable Wt, Gross Wt, CBM)

### Cost Breakdown Table
- **Itemized rows**: Component name (left) + Amount (right)
- **CIF separator**: Dashed border-top, bold text
- **Total row**: Thick solid border-top, larger font, bold
- **Inland section** (if enabled): Separate card with light orange/amber background (#fffbeb), orange border

### PDF Export
- Uses `jspdf` + `jspdf-autotable`
- **Header**: Logo + "Air Freight Landed Cost Estimate" + Quote ID (BF-001, BF-002...) + Date
- **Shipment details**: 2-column key-value pairs
- **Cost breakdown table**: Orange header, alternating row colors, bold total footer
- **Summary box**: Orange gradient with large total amount
- **Footer**: Disclaimers + "Befach International"
- **Filename**: `befach-air-freight-BF-001-{timestamp}.pdf`

---


**The actual production implementation** uses a horizontal 3-step stepper (closest to V5/V7 hybrid) with Framer Motion step transitions.

---

## 7. State Variables

All state for the Air Freight Calculator (all `useState` hooks):

```typescript
// Navigation
currentStep: number                    // 1, 2, or 3
direction: number                      // 1 (forward) or -1 (backward), for animation

// Step 1: Route & Currency
originCountry: string                  // Country code, e.g. "US"
countrySearch: string                  // Search text for country dropdown
showCountryDropdown: boolean
currency: string                       // "USD", "EUR", "GBP", "CNY", "INR"
exchangeRate: string                   // e.g. "85" (INR per 1 unit)

// Step 2: HSN & Duties
hsnCode: string                        // e.g. "84710000"
customDutyPercent: string              // e.g. "7.5"
gstPercent: string                     // e.g. "18"
hsnSuggestions: array                  // Search results from searchHSNCodes()
showHsnDropdown: boolean

// Step 3: Product
productName: string
pricePerUnit: string                   // In selected currency
quantity: string                       // Default "1"

// Step 3: Dimensions (numbers, not strings)
lengthCm: number
widthCm: number
heightCm: number
actualWeight: number                   // kg per box
numPackages: number                    // default 1

// Step 3: Inland Shipping (optional)
includeInland: boolean                 // toggle
inlandZone: InlandZone | ''            // 'A' | 'B' | 'C' | 'D' | 'E' | ''
clearancePort: ClearancePort | ''      // 'Mumbai' | 'Delhi' | ... | ''
destinationCity: string
citySearch: string
showCityDropdown: boolean
showManualZone: boolean                // fallback zone picker
citySuggestions: IndianCity[]

// Result
result: AirFreightResult | null        // null until calculated
```

### Computed Values (useMemo / inline)
```typescript
// From country selection
selectedCountry = countryZones[originCountry]  // { name, zone }

// From dimensions
volumetricWeight = getVolumetricWeight(L, W, H) * numPackages
grossWeight = actualWeight * numPackages
chargeableWeight = getChargeableWeight(grossWeight, volumetricWeight)
cbm = (L * W * H * numPackages) / 1_000_000

// Validation gates
canAdvanceStep1 = !!selectedCountry && (currency === 'INR' || exchangeRate > 0)
canAdvanceStep2 = customDutyPercent !== '' && gstPercent !== ''
canCalculate = canAdvanceStep1 && productValue > 0 && chargeableWeight > 0
               && (!includeInland || (inlandZone && clearancePort))
```

---

## 8. Dependencies

### Core Logic (zero npm deps)
- `calculatorUtils.ts` — pure math functions
- `dhlRates.ts` — data tables + lookup functions
- `inlandRates.ts` — data tables + lookup functions

### UI Components
- `framer-motion` — step transitions + 3D box animation
- `lucide-react` — icons (Plane, Globe, Package, FileText, Search, Check, Download, RotateCcw, Info, ExternalLink, ChevronRight, ChevronLeft, Truck)

### PDF Export
- `jspdf` — PDF generation
- `jspdf-autotable` — table rendering in PDF

### Storage (optional)
- Browser `localStorage` via `safeStorage.ts`
- Backend API via `calculatorService.ts` (with localStorage fallback)
