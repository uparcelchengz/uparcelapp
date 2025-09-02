# uParcel Customer App – Feature Expectations Spec

### 1. Core Booking Flow
- One-tap **“Delivery Request”** entry point on home screen  
- Auto-detect current location (blue dot) with editable address field  
- Google Places auto-complete & postal-code reverse lookup  
- Weight/size slider with live price preview (≤2 kg, 2–5 kg, 5–10 kg …)  
- Service-level toggle: Same-Day vs 3-Hour vs Next-Day  
- Insurance toggle (default $0, $2, 1% of parcel value)  
- “Save as default address” checkbox after first order  
- Multi-stop option (Sender → 1st recipient → 2nd recipient)  

**Enhancements**  
- Delivery type selector (Documents, Food, Fragile, Bulky)  
- Preferred pickup time (schedule in advance, not just ASAP)  
- Eco-friendly option (bike / EV delivery if available)  

---

### 2. Pricing & Payment
- Up-front fare breakdown: base + distance + GST + surcharges  
- Promo-code field with real-time validation  
- Payment methods: PayNow, Visa/Master, Apple Pay, Google Pay  
- Receipt auto-e-mailed as PDF + downloadable in **Order History**  
- Partial refund option if driver cancels  

**Enhancements**  
- Wallet/credits (store value or loyalty points)  
- Transparent surge pricing indicator (during peak demand)  

---

### 3. Tracking & Notifications
- Real-time map of driver location after pickup  
- Push, SMS, and email notifications for key events:  
  - Driver assigned  
  - Picked up  
  - On the way  
  - Delivered  
- Photo Proof of Delivery (POD) in order details  
- ETA updated every 60 seconds  

**Enhancements**  
- Display driver name, vehicle type, and license plate  
- Shareable delivery tracking link for recipients  

---

### 4. Post-Delivery
- One-tap **Re-order** button (pre-fills previous details)  
- Star rating + comment box for driver feedback  
- Downloadable monthly statement for expense claims  
- Address book with contact search  

**Enhancements**  
- Issue reporting (damaged, lost, late delivery)  
- “Did everything go smoothly?” quick survey  

---

### 5. Security & Usability
- Biometric login (Face ID / Fingerprint)  
- 2-factor authentication toggle in settings  
- Offline draft: order form cached for 10 min if connection drops  
- Dark-mode toggle  
- In-app live chat with support (<60 s response during office hours)  

**Enhancements**  
- Multi-language support (English, Chinese, Malay, Tamil)  
- Accessibility options (large text, high contrast mode)  

---

### 6. Edge-case Handling
- Clear error banner if pickup pin falls outside service zone  
- “Reschedule delivery” button before driver arrives  
- Parcel size mismatch warning (declared vs actual after pickup)  
- Clear refund policy link on price screen  

**Enhancements**  
- Split deliveries for parcels exceeding weight/size limits  
- Auto-suggest nearest valid drop-off point if address is invalid  

---
