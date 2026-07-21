# dairyside-admin-frontend
Dairy Side Admin Panel Frontend 

============================================ Delivery Slot in Admin ================================================================
Functionality of Delivery Slot module :

What is a Cutoff Time?
A Cutoff Time is the daily deadline by which customers must create, modify, pause, or skip their subscription deliveries for that change to take effect for a specific delivery slot. Once the cutoff time passes, the schedule locks, and changes are no longer allowed for that upcoming delivery.

How Cutoff Times Work in DairySide
In a fresh dairy subscription model, deliveries are split into morning and evening routes. The logistics team needs time to compile packing lists, load delivery vehicles, and plan routes. Cutoff times enforce this process:

Morning Shift (e.g., "Before 7 AM" slot)

Cutoff Time: 9:00 PM (21:00:00) the previous day.
Example: If a customer wants to skip their delivery for tomorrow morning, they must mark it as skipped in their app by 9:00 PM tonight. At 9:00 PM, the system locks that slot for tomorrow.
Evening Shift (e.g., "6 PM – 9 PM" slot)

Cutoff Time: 2:00 PM (14:00:00) the same day.
Example: If a customer wants to change their quantity for this evening, they must do so by 2:00 PM today. At 2:00 PM, the system locks today's evening slot.
No Cutoff (indicated by — / null)

If a slot has no cutoff time configured, there is no pre-set daily deadline, meaning the system only applies global rules (e.g., locking same-day or past deliveries).
How It Is Used in the System
Preventing User Modifications (Client-Side & API Guarding)

The customer application checks the target date and delivery slot. If the cutoff time has passed, the calendar disables actions like "Skip" or "Quantity Override".
If a user tries to bypass the UI and make an API request, the backend controller checks isDateLocked() and blocks the edit:
"Cutoff time has passed. Same-day or past deliveries cannot be modified."

Nightly Order Generation (Cron Job)

The backend's nightly cron job processes subscriptions shortly after cutoff times. It converts upcoming active schedules into finalized orders in the orders database table so the packing staff can pack the milk crates and delivery agents can start their morning shifts.
Inventory & Dispatch Planning

Pre-set cutoff times allow managers to export accurate dispatch manifests, knowing exactly how many liters of milk/packets of curd need to be bottled and loaded, eliminating product waste.


====================================================================================================================================