// Copy for / (About). Every string the About page renders lives here.

export const ABOUT = {
  title: "ARKA — A research platform for changing how people live with light",

  hero: {
    wordmark: "ARKA",
    subline: "A research platform for changing how people live with light.",
    projectOf: "A project of",
    hint: "Move your cursor to reveal. Scroll to raise the sun.",
    productShotAlt:
      "The ARKA ecosystem: an ActLumus wrist sensor and a phone showing the ARKA app, in front of an arc that runs from sunrise to night.",
  },

  timeCue: {
    kicker: "Why light",
    heading: "Light is the body's strongest time cue.",
    body: "Specialised cells in the retina report brightness to the brain's master clock. From there, light shapes when we feel alert, when we sleep and how we feel.",
    chain: [
      { label: "Eye", sub: "light reaches the retina" },
      { label: "ipRGC", sub: "intrinsically photosensitive retinal ganglion cells" },
      { label: "SCN", sub: "suprachiasmatic nucleus — the master clock" },
      { label: "Mood · Sleep · Alertness", sub: "downstream rhythms" },
    ],
    refs: ["munch2012", "hannibal2021", "berson2002"],
  },

  judge: {
    kicker: "And we're bad at judging it",
    heading: "Where do you think you're getting more light?",
    body: "Two ordinary scenes. Drag the slider to where you think the balance sits, then reveal the measurement.",
    sliderLabel: "Your guess: which scene has more light, and by how much?",
    left: { name: "A bright office", lux: 500, alt: "A person working at a desk by a large window in a bright office." },
    right: { name: "Outdoors, shade included", lux: 10000, alt: "A person outdoors on a bright day." },
    reveal: "Reveal the measurement",
    result: "About twenty times more light outdoors.",
    resultBody: "An office that feels bright sits around 500 lux. A cloudy day outside is often 10,000 lux or more. The second circle is drawn to twenty times the area of the first.",
    punch: "Your eyes adapt. A sensor doesn't.",
    guessFeedback: (guess: number) =>
      guess < 0.4
        ? "You guessed the office. Most people do — indoor light feels brighter than it is."
        : guess < 0.6
          ? "You guessed roughly equal. The measured gap is about twenty to one."
          : "You guessed outdoors. Right direction — the gap is larger than it looks.",
    note: "Typical values. The exact numbers depend on weather, time of day and where the sensor is worn.",
  },

  signal: {
    kicker: "From raw signal to human meaning",
    heading: "Four beats: sensor → signal → interpretation → behaviour.",
    body: "The sensor produces numbers every minute. The platform turns those numbers into a day, the day into a target and the target into something a child understands.",
    readings: [
      { t: "08:01", lux: 12 },
      { t: "08:02", lux: 18 },
      { t: "08:03", lux: 421 },
      { t: "08:04", lux: 9820 },
      { t: "08:05", lux: 11340 },
      { t: "08:06", lux: 10870 },
      { t: "08:07", lux: 8410 },
      { t: "08:08", lux: 640 },
    ],
    beats: [
      { label: "Sensor", text: "A wrist-worn light and activity logger records once a minute." },
      { label: "Signal", text: "A day's trace: dim indoors, a walk to school, a bright lunchtime." },
      { label: "Interpretation", text: "Minutes above the outdoor threshold — 78 today, against a target of 120." },
      { label: "Behaviour", text: "For the child, 78 minutes is a stem and three leaves. Full bloom is 120." },
    ],
    minutesLabel: "78 min outside",
  },

  sensor: {
    kicker: "The sensor",
    heading: "ActLumus",
    body: "A research-grade wrist logger. It records light, movement and time, minute by minute, and syncs to the participant's phone.",
    labels: ["Light", "Activity", "Time"],
    noLocation: "No location.",
    noLocationBody: "The sensor knows how much light reached the wrist, not where the wrist was.",
    alt: "The ActLumus wrist-worn light and activity sensor.",
    missingLabel: "brand/actlumus.png",
  },

  delivery: {
    kicker: "Targets exist. Delivery is weak.",
    quote:
      "Light interventions often specify what to do, but real-world delivery is still weak: monitoring and mobile prompting are under-used and personalisation is rare.",
    quoteRef: "faulkner2020",
    columns: [
      {
        title: "Measure",
        limitation: "Diaries and recall. People misjudge light by an order of magnitude.",
        answer: "Continuous wearable measurement, minute by minute.",
      },
      {
        title: "Personalise",
        limitation: "One target for everyone, regardless of when they wake or what their day looks like.",
        answer: "Targets adapted to the individual's schedule — a morning window is relative to their wake time.",
      },
      {
        title: "Deliver",
        limitation: "Advice at enrolment, feedback at follow-up. Nothing in between.",
        answer: "Just-in-time adaptive prompts, sent while the window is still open.",
        ref: "nahumshani2016",
      },
    ],
    flipHint: "Scroll to flip each column from its limitation to ARKA's answer.",
  },

  knowing: {
    kicker: "Knowing isn't doing",
    heading: "A short simulation.",
    setup: "Maya woke at 7:20. It's 11:45. She's had very little bright light.",
    fictional: "Maya is fictional. The trace is illustrative.",
    options: [
      { id: "nothing", label: "Do nothing" },
      { id: "tonight", label: "Tell her tonight" },
      { id: "now", label: "Nudge her now" },
    ],
    outcomes: {
      nothing: {
        title: "The trace stays flat.",
        body: "Nobody measured, nobody said anything. The day's window closed at dusk.",
      },
      tonight: {
        title: "The feedback arrives after the window closed.",
        body: "She learns at 9 pm that she should have gone outside at noon. Useful next week, perhaps. Not today.",
      },
      now: {
        title: "She steps outside.",
        body: "A prompt at 11:45, a twenty-minute walk at 12:10. The trace rises while it still counts.",
      },
    },
    nudge: {
      title: "Morning light",
      body: "You've had 9 minutes of bright light so far. A walk before 2 pm would still count today.",
    },
    reset: "Try another choice",
  },

  engine: {
    kicker: "The decision engine",
    heading: "Should we act?",
    body: "Four inputs feed one question. The answer is either an intervention or a reason to wait.",
    inputs: ["Light", "Activity", "Time", "Study rules"],
    centre: "ARKA",
    question: "Should we act?",
    yes: "Yes → intervention",
    no: "Not now",
    proposed: "Proposed",
    proposedBody:
      "The deployed engine uses rules and windows. Receptivity sensing — asking whether the person can act right now — is a design hypothesis, not a deployed feature.",
    controls: {
      time: "Time of day",
      light: "Bright-light minutes so far",
      target: "Daily target",
      remaining: "Minutes left in the window",
    },
    verdicts: {
      nudge: "Nudge now",
      wait: "Not now",
    },
    rules: {
      met: "Rule: target already met — nothing to prompt.",
      closed: "Rule: window has closed — feedback would arrive too late.",
      early: "Rule: too early in the window — give the day a chance first.",
      short: "Rule: not enough time left to reach the target — a prompt would only add pressure.",
      go: "Rule: behind target, window open, enough time to act.",
    },
  },

  morph: {
    kicker: "One platform should not mean one interface",
    heading: "The same phone. Five configurations.",
    steps: [
      { key: "myopia", who: "Child", arrow: "growth", text: "A plant that grows with minutes outside. Big type, one number, no charts." },
      { key: "healthy", who: "Healthy adult", arrow: "data", text: "A score, three arcs, a full day of light. The densest interface on the platform." },
      { key: "glaucoma", who: "Older adult", arrow: "clarity", text: "Three things on screen. Large type, text with every icon, nothing that is colour alone." },
      { key: "depression", who: "Depression", arrow: "low-friction support", text: "A morning window, a gentle check-in, support pinned to the header. No streaks." },
      { key: "stroke", who: "Stroke", arrow: "one task at a time", text: "One instruction, one button, a listen control. The next task replaces the screen." },
    ],
    closing: "The sensor can be the same. The intervention shouldn't be.",
  },

  configurator: {
    kicker: "Build an intervention",
    heading: "A researcher panel on the left. A participant phone on the right.",
    body: "Change the population and the phone reconfigures. Everything here is a setting a researcher would set once, at study start.",
    populationLabel: "Population",
    populations: [
      { id: "myopia", label: "Children 7–12" },
      { id: "healthy", label: "Healthy adults" },
      { id: "glaucoma", label: "Older adults" },
      { id: "depression", label: "Depression" },
      { id: "stroke", label: "Stroke rehabilitation" },
    ],
    behaviourLabel: "Behaviour",
    targetLabel: "Daily target",
    windowLabel: "Intervention window",
    feedbackLabel: "Feedback",
    feedback: [
      { id: "plant", label: "Growing plant" },
      { id: "score", label: "Light score" },
      { id: "lumi", label: "Lumi chat" },
      { id: "mood", label: "Mood check-in" },
      { id: "caregiver", label: "Caregiver sharing" },
    ],
    modeLabel: "Interface mode",
    modes: [
      { id: "standard", label: "Standard" },
      { id: "large", label: "Large text" },
      { id: "single", label: "One task" },
    ],
    closing: "New study. Same platform.",
    changeLog: "Changes applied to the participant phone",
  },

  eightFourteen: {
    kicker: "8:14 AM",
    heading: "Five phones. One timestamp.",
    phones: [
      { key: "healthy", line: "Morning light 34 min ✓" },
      { key: "myopia", line: "🌱 Your plant grew" },
      { key: "glaucoma", line: "Bright light today · 34 min" },
      { key: "depression", line: "Morning window · 18 min remaining" },
      { key: "stroke", line: "☀️ Morning light · START" },
    ],
    closing: "Same light. Different intervention.",
  },

  closing: {
    heading: "ARKA",
    line: "Measure light. Understand behaviour. Intervene when it matters.",
    sub: "Built for research. Designed around people.",
    status:
      "The myopia study has been live with participants since 2026. The other four configurations are designed and awaiting studies.",
  },
};
