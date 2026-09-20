// Copy for /depression. Designed configuration. Tone: support without
// pressure. No streaks, no missed-day language, no red, no failure states.

export const DEPRESSION = {
  title: "ARKA · Depression — adults",
  header: {
    title: "Depression",
    cohort: "Adults",
    status: "designed" as const,
    illustrationAlt: "An adult sitting quietly in soft morning light.",
    ribbonLabel: "Light ribbon: a morning opportunity window in the two hours after waking",
    lede: "The page's own pace changes here. Fewer elements at once. More room. Nothing celebrates.",
  },
  goals: [
    { text: "Morning bright light routine", refs: ["lam2015"] },
    { text: "Evening light reduction and stable sleep timing", refs: ["dealmeida2024"] },
  ],
  loop: {
    kicker: "The loop",
    heading: "Light, rhythm, mood.",
    nodes: [
      { label: "Insufficient light", refs: ["burns2021"] },
      { label: "Circadian misalignment and hormonal imbalance", refs: ["walker2020"] },
      { label: "Symptoms worsen", refs: ["golden2005"] },
    ],
    body: "Morning light is one of the few levers that acts on the rhythm directly. The configuration is designed to make that lever easy to reach on a hard morning.",
  },
  home: {
    kicker: "Home",
    heading: "Good morning.",
    body: "Your morning light window, a bar, the minutes left, one action. A check-in with five faces and one tap. One card for tonight. That is everything above the fold.",
    greeting: "Good morning.",
    support: "Need support?",
    windowLabel: "Your morning light window",
    done: 24,
    target: 30,
    remaining: "6 min remaining",
    action: "Continue morning light",
    moodLabel: "How are you feeling?",
    moods: ["Very low", "Low", "Okay", "Good", "Very good"],
    tonight: { label: "Tonight", text: "Wind-down starts at 9:30 PM" },
    rules: [
      "No streaks.",
      "No missed-day language.",
      "No red.",
      "No failure states.",
      "Every day resets cleanly.",
    ],
    tabs: ["Home", "Insights", "Lumi", "Inbox", "Diary"],
  },
  window: {
    kicker: "The opportunity window",
    heading: "Three checks before a prompt.",
    body: "A sunrise crosses the bar from wake to two hours after. The window is softly lit. A prompt appears only after all three checks resolve.",
    start: "WAKE",
    end: "+2 HOURS",
    checks: [
      { text: "Is intervention useful?", detail: "Measured morning light is below the 30-minute target." },
      { text: "Is it still actionable?", detail: "At 7:40 the window is open for another 100 minutes." },
      { text: "Is this an appropriate moment?", detail: "The participant has not marked themselves unavailable." },
    ],
    notification: {
      title: "Morning light",
      body: "You're at 8 minutes so far. If it suits you, there's still time in today's window.",
    },
    stepperLabel: "Opportunity window — step through the checks",
  },
  decision2: {
    kicker: "The decision, two ways",
    heading: "Same participant. Same morning.",
    toggleLabel: "Participant availability",
    options: [
      { id: "available", label: "Available" },
      { id: "unavailable", label: "Marked unavailable" },
    ],
    available: {
      time: "7:40 AM",
      state: "Low measured morning light",
      notification: {
        title: "Morning light",
        body: "You're at 8 minutes so far. If it suits you, there's still time in today's window.",
      },
      note: "The copy states a measurement and a window. It makes no clinical recommendation. The protocol owns the target.",
    },
    unavailable: {
      time: "7:40 AM",
      state: "Participant marked unavailable",
      result: "No notification sent.",
      rule: "Suppressed by rule: participant availability = unavailable. Re-evaluated at the next check, 8:10 AM, if the window is still open.",
    },
    proposed: "Proposed",
    proposedBody:
      "Adaptive timing that asks whether a prompt is useful and whether the person can act on it, rather than broadcasting on a schedule.",
  },
  config: {
    study: "ARKA Depression",
    cohort: "Adults",
    tabs: [
      { label: "Home", on: true },
      { label: "Insights", on: true },
      { label: "Lumi", on: true, note: "supportive tone" },
      { label: "Inbox", on: true },
      { label: "Diary", on: true },
      { label: "Mood check-in", on: true },
    ],
    targets: ["30 min bright light within 2 h of wake"],
    windows: ["Wake → +2 h"],
    lumi: true,
    typeScale: "1.0 · gentle tone",
    arms: ["Single arm (designed)"],
    extra: "Support resources pinned to every screen.",
  },
  decision: {
    n: 4,
    label: "Design decision",
    title: "No streaks.",
    lines: [
      "Missed days don't become persistent failure states.",
      "A streak counter turns one hard morning into a visible loss; this configuration has nothing that can be lost.",
    ],
  },
  rationale: {
    button: "Design rationale",
    title: "Why the interface is quiet",
    paragraphs: [
      "On a low morning, a screen that asks for effort is a screen that gets closed. The home shows one window, one action and one question.",
      "There is no red anywhere in the configuration and no state that names a failure. A day that did not go well is simply followed by a new day.",
      "The prompt copy reports a measurement and a window. It does not tell the participant what they should do; the study protocol owns the target and the clinician owns the advice.",
      "Support resources sit in the header of every screen so they are never more than one tap away.",
    ],
  },
  closing: "Support without pressure.",
};
