```markdown
# Design System: Editorial Luxury & Tonal Depth

## 1. Overview & Creative North Star: "The Digital Concierge"
This design system is anchored by the Creative North Star of **"The Digital Concierge."** It rejects the cluttered, utility-first aesthetics of standard enterprise software in favor of a high-end editorial experience. Like a luxury boutique hotel, the interface should feel bespoke, quiet, and anticipatory.

We break the "template" look through **Intentional Asymmetry** and **Tonal Layering**. By utilizing expansive white space (the "Background" `#FFFFFF`) and contrasting it with the precision of "Deep Neutral" (`#222222`) typography, we create an environment where information isn't just displayed—it is curated. The system avoids rigid boxes, opting instead for overlapping elements and soft transitions that guide the eye with sophisticated ease.

---

## 2. Colors & Surface Philosophy
The palette is a study in restrained opulence. We rely on the interplay between metallic warmth and slate-cool neutrals.

### The Color Palette
- **Primary Accent (`#C5A059`):** Our Muted Gold. Use this sparingly for high-intent actions, key iconography, and subtle highlights. It is the "jewelry" of the interface.
- **Deep Neutral (`#222222`):** Used for all `headline` and `title` tokens to provide a rhythmic, authoritative anchor.
- **Secondary Text (`#777777`):** Reserved for `body` and `label` tokens to ensure the interface feels airy and non-aggressive.
- **Surface Tiers:** We utilize a spectrum from `surface_container_lowest` (`#FFFFFF`) to `surface_dim` (`#D9DADB`) to create architectural depth.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts. Use `surface_container_low` (`#F3F4F5`) sections against a `surface` (`#F8F9FA`) background to imply change without visual "noise."

### Glass & Gradient Implementation
To avoid a flat, "out-of-the-box" feel, primary CTAs should utilize a subtle linear gradient: `primary` (`#775A19`) to `primary_container` (`#C5A059`) at a 135-degree angle. This adds a physical "soul" to the button, mimicking the way light hits polished metal.

---

## 3. Typography: The Editorial Voice
Typography is the primary vehicle for the brand’s luxury positioning. We pair the timeless authority of **Noto Serif** with the modern, technical precision of **Manrope**.

*   **Display & Headlines (Noto Serif):** These are our "Hero" elements. Use `display-lg` (3.5rem) with generous tracking to evoke the masthead of a premium fashion journal.
*   **Titles & Body (Manrope):** Manrope provides a clean, legible contrast. Use `body-lg` (1rem) for guest details and `body-md` (0.875rem) for secondary metadata.
*   **Hierarchy:** Always prioritize a high-contrast scale. A `headline-lg` in `#222222` should sit near a `label-md` in `#777777` to create a sophisticated, layered information hierarchy that feels intentional rather than accidental.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is felt, not seen. We move away from traditional shadows toward **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_lowest` (#FFFFFF) card on top of a `surface_container` (#EDEEEF) section. This creates a soft, natural lift that feels like fine stationery on a stone desk.
*   **Ambient Shadows:** If a floating element (like a modal) is required, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(34, 34, 34, 0.06);`. The shadow color is a tinted version of our Deep Neutral, mimicking natural ambient light.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use a "Ghost Border": `outline_variant` (`#D1C5B4`) at **15% opacity**. Never use 100% opaque borders.
*   **Glassmorphism:** For navigation overlays, use `surface_container_low` at 80% opacity with a `backdrop-filter: blur(12px)`. This integrates the UI into the background, preventing a "pasted on" appearance.

---

## 5. Components

### Buttons: The Signature Touch
*   **Primary:** A hard-edged (0px radius) button using the Gold gradient. Text is `on_primary` (`#FFFFFF`), uppercase, `label-md` weight.
*   **Secondary:** Ghost style. No background, `primary` text, with a 1px "Ghost Border" (15% opacity Gold).
*   **Interaction:** On hover, the primary button should shift slightly in tone (to `primary_fixed_dim`), never changing size or border.

### Input Fields: Minimalist Sophistication
*   **Styling:** Remove all four borders. Use a single bottom border (1px) in `outline_variant`.
*   **Focus State:** The bottom border transitions to `primary` (Gold), and the label (Manrope, `label-sm`) floats upward.
*   **Error State:** Use `error` (`#BA1A1A`) only for the helper text; the input line remains neutral to maintain the aesthetic calm.

### Cards & Lists: Architectural Spacing
*   **No Dividers:** Forbid the use of horizontal lines. Use the **Spacing Scale** (specifically `spacing-8` or `2.75rem`) to create "white space dividers."
*   **Luxury Lists:** For hotel room inventories or guest lists, use alternating backgrounds (`surface` to `surface_container_low`) to distinguish rows.

### Signature Component: The "Editorial Quote"
*   A specific component for luxury hotel management: A large-scale typography block using `headline-lg` in Noto Serif, used for "Manager’s Notes" or "VIP Preferences," framed by a 4px vertical Gold line (`primary`) on the left.

---

## 6. Do’s and Don'ts

### Do:
*   **Use 0px Border Radius:** This system is built on "Sharp Sophistication." Roundness is strictly prohibited (`0px` across all tokens) to maintain a high-end, architectural feel.
*   **Embrace Asymmetry:** Align text to the left but allow imagery or Gold accents to sit "off-grid" to create a custom, editorial layout.
*   **White Space as a Feature:** Treat white space as a physical material. It is as important as the text itself.

### Don't:
*   **Don't use "Dark Mode" logic:** This is a light-first, sun-drenched system. Do not invert these colors for a dark theme without a complete re-evaluation of the tonal layering.
*   **Don't use standard icons:** Icons must be ultra-thin (Hairline weight) and always rendered in `primary` (Gold) or `secondary` (Gray).
*   **Don't use drop shadows on buttons:** Buttons should feel like flat, inlaid gold leaf, not floating plastic. 

---

*Director's Final Note: Precision is the difference between "simple" and "minimal." Every pixel in this system must have a reason for existing. If an element doesn't serve the guest's journey or the brand's elegance, remove it.*```