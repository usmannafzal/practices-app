# AI Usage

Being upfront: most of this project's code was AI-generated. I drove the
thinking — understanding the requirements, the architecture choices, reviewing
output, and catching mistakes — and let the AI write most of the implementation.

## 1. Tools and rough mix

- **Cursor (Opus 4.8) — ~70%.** Wrote most of the actual code. I had it plan the
  work in phases and build one phase at a time so I could test before moving on.
- **Claude in the browser — ~25%.** Used before any code was written: to make
  sure I understood the requirements document, find the pieces I'd missed, and
  turn that into a single prompt for Cursor to execute.
- **Hand-written — ~5%.** Small tweaks and fixes I did myself.

## 2. Three prompts that produced something I kept

**Prompt 1 — checking my understanding of the assignment.**
Before writing anything, I wrote out my own understanding of the app and attached
the assignment PDF, then asked the AI to tell me what I'd got wrong or missed:

> I am working on a take home assignment. According to my understanding the
> application has 3 screens. [...] Bottom navigation with Practices and Summary
> tabs; Practices is a stack of List → Detail. Screen 1 fetches practices from
> MSW, uses FlashList for virtualization, has loading/error/empty states,
> pull-to-refresh, and 1 column on phone / 2 columns on tablet. Screen 2 shows
> detail with Mark complete + a 1–5 star rating (first rating applies with just a
> toast, changing a rating shows a confirm modal), with optimistic updates that
> reflect on the list. Screen 3 is the summary with completed count + average
> rating, derived from the dataset, updating immediately on tab switch.
> Architecture: move state logic into custom hooks. State: React Query for
> caching + mutations. Styles: one tokens file for spacing/colors with
> normalization. Testing: data-fetching states plus edge cases (network failure,
> mutating a practice deleted on the server → show error, navigate back, remove
> from list). This is my understanding — let me know if I've missed anything or
> got it wrong.

**Kept it** because it confirmed my reading was mostly right and surfaced a few
gaps before I started, so I built from a correct picture instead of fixing it
later. (It's also where I baked in my own calls — MSW, React Query, custom hooks
— rather than asking the AI to decide them.)

**Prompt 2 — turning that into a phased plan for Cursor.**

> Take your understanding and mine and then generate a prompt for Cursor to make
> a plan to execute all this and proceed in steps. Tell Cursor to let me test
> each step before moving to the next one so that errors are encountered early.

**Kept it** because phase-by-phase delivery with a test gate between phases meant
I caught problems early instead of getting one giant unreviewable diff.

**Prompt 3 — the MSW / Hermes runtime error.**
MSW worked as my mock, but the app crashed because Hermes couldn't parse the
response body. I pasted the actual error and asked for a fix.

**Kept it** because the workaround it suggested let me keep MSW as the mock for
fetching and mutating data while getting around the Hermes limitation, instead of
throwing the whole mock approach away.

## 3. Where AI got it wrong and what I did instead

The first two were in the assignment document, which was in the AI's context the
whole time, and it still missed them. The third was a platform problem it couldn't
work out until I showed it the actual error.

**1. Tablet layout — no 2-column list.**
The document clearly says 1 column on phone, 2 columns on tablet, and I'd written
that into my first prompt too. The generated list rendered a single column on all
screen sizes. **What I did instead:** had it add a responsive-columns hook that
switches to 2 columns past a tablet width breakpoint and reacts to rotation.

**2. Detail screen stuck in portrait.**
The document says the detail screen should work in both orientations. The app was
locked to portrait, so the screen never rotated at all. **What I did instead:**
changed the app orientation config from `portrait` to `default`, and separately
fixed the confirm modal, which was forcing the screen back to portrait every time
it opened (its `supportedOrientations` defaults to portrait-only on iOS).

**3. MSW response not parsing on Hermes.**
I asked it to mock the API with MSW for the running app. It wired MSW up the
standard way, but the app crashed: Hermes (React Native's engine) has no readable
`Response.body` stream, so MSW matched the request but handed back an empty body,
and `response.json()` threw a JSON parse error. The AI couldn't figure out the
cause on its own — its first attempts just shuffled the MSW setup around and the
app kept crashing. It only got unstuck after I copied the actual error message out
of the app and pasted it in. **What I did instead:** once it had the real error,
it landed on the workaround I kept (see Prompt 3 above) — keep real MSW for the
tests (`msw/node`, where response bodies work), and for the app swap in a small
in-memory `fetch` shim that routes through the same resolvers the MSW handlers
use, so the app and the tests share identical behaviour.

The lesson: even with the requirements right there in context, the AI quietly
dropped explicit ones (cases 1 and 2), and on a platform-specific failure (case 3)
it guessed in circles until I fed it the exact error. Either way I couldn't trust
it had covered things — I had to check the output against the document and against
the running app myself.

## 4. What I deliberately did NOT use AI for

- **The architectural decisions.** I picked MSW as the mock server and React
  Query for state management from my own experience, not because the AI suggested
  them.
- **One navigation decision.** I considered pulling the Detail screen out of the
  Practices stack so it would sit at the bottom-tab level instead of inside the
  stack. I went with the stack because the document asks for it — but I'd argue
  the detail screen is better opened over the tabs, not nested inside them.
- **Small tweaks.** Things like hiding a scroll indicator or changing copy I just
  did by hand — not worth spending tokens on.

## 5. One architectural decision I made independently

Using **MSW as the mock server** and **React Query for state management** — both
my own calls, not the AI's.

- **MSW:** it behaves like a real network, so I could simulate latency and real
  error responses and drive the failure-path tests (network failure, 404 on a
  deleted practice) through actual request interception, rather than stubbing
  return values.
- **React Query:** the caching is the point. One cache shared across screens
  means data is available everywhere and a mutation on Detail shows up on the
  List and Summary with no extra wiring — exactly what this app needs for
  cross-tab sync.
