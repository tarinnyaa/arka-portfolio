// Copy for / (About). Every string the About page renders lives here.

export const ABOUT = {
  title: "ARKA: a research platform for changing how people live with light",

  hero: {
    wordmark: "ARKA",
    subline: "A research platform for changing how people live with light.",
    projectOf: "A project of",
    productShotAlt:
      "The ARKA ecosystem: an ActLumus wrist sensor and a phone showing the ARKA app, in front of an arc that runs from sunrise to night.",
  },

  timeCue: {
    kicker: "Why light",
    heading: "Light is the body's strongest time cue.",
    body: "Specialised cells in the retina report brightness to the brain's master clock. From there, light helps shape when we feel alert, when we sleep and how we feel.",
    chain: [
      { label: "Eye", sub: "Light reaches the retina" },
      { label: "ipRGC", sub: "Intrinsically photosensitive retinal ganglion cells detect light" },
      { label: "SCN", sub: "Suprachiasmatic nucleus, the master clock" },
    ],
    outcomes: [
      { label: "Alertness", sub: "Helps you feel awake and focused" },
      { label: "Mood", sub: "Supports emotional wellbeing" },
      { label: "Sleep", sub: "Helps regulate when you feel sleepy" },
    ],
    sources: "Sources: Münch and Bromundt, 2012; Hannibal, 2021; Berson et al., 2002.",
    refs: ["munch2012", "hannibal2021", "berson2002"],
    diagramAlt:
      "Light enters the eye, is detected by ipRGC cells in the retina and reaches the SCN in the brain, which influences alertness, mood and sleep.",
  },

  sensor: {
    kicker: "The sensor",
    heading: "ActLumus",
    sub: "Research grade sensing, worn on the wrist.",
    streamsLabel: "minute by minute",
    streams: {
      light: { label: "Light", values: ["12", "421", "10,820"], unit: "lux" },
      activity: { label: "Activity" },
      time: { label: "Time", values: ["08:01", "08:02", "08:03"] },
    },
    alt: "The ActLumus wrist-worn light and activity sensor.",
    phoneLabel: "ARKA phone showing the myopia summary: 78 of 120 minutes outdoors.",
    privacy: {
      kicker: "What it does not record",
      heading: "No location.",
      body: "ARKA knows how much light reached the wrist, not where the participant was.",
      tags: ["No GPS", "No map", "No route history"],
      pinAlt: "A location pin, crossed out.",
    },
  },

  meaning: {
    kicker: "From measurement to meaning",
    heading: "From light to something you can act on.",
    body: "ARKA turns minute by minute light measurements into feedback designed for the person using it.",
    rail: ["Sense", "See", "Understand", "Act"],
    readings: [
      { t: "08:01", lux: 12 },
      { t: "08:02", lux: 18 },
      { t: "08:03", lux: 421 },
      { t: "08:04", lux: 10820 },
      { t: "08:05", lux: 11340 },
    ],
    threshold: 10000,
    thresholdLabel: "10,000 lux outdoor threshold",
    periods: [
      { label: "walk to school", from: 8.06, to: 8.36, minutes: 18 },
      { label: "lunch outdoors", from: 12.3, to: 12.8, minutes: 27 },
      { label: "after school play", from: 16.2, to: 16.8, minutes: 33 },
    ],
    minutes: 78,
    target: 120,
    captions: [
      "Light, measured every minute.",
      "A day emerges from thousands of readings.",
      "Thousands of measurements become one useful metric.",
      "For a child, progress does not have to look like data.",
    ],
    minutesLabel: "minutes outdoors",
    today: "Today",
    toBloom: "42 minutes to bloom",
    link: "See the myopia experience",
    chartAlt: "A day's light exposure from 06:00 to 22:00 with three periods above the 10,000 lux outdoor threshold: walk to school, lunch outdoors and after school play.",
  },

  gap: {
    kicker: "The gap",
    heading: "Light health advice should not end at advice.",
    body: "ARKA connects measurement, personal targets and timely intervention in one continuous feedback loop.",
    stages: [
      {
        n: "01",
        title: "Measure",
        before: "Recall",
        beforeSub: "Was I outside enough today?",
        after: "Continuous sensing",
        afterSub: "Minute by minute.",
        readings: [
          { t: "08:41", lux: "420" },
          { t: "08:42", lux: "11,240" },
          { t: "08:43", lux: "10,870" },
        ],
      },
      {
        n: "02",
        title: "Personalise",
        before: "One size fits all",
        beforeSub: "A fixed target may not reflect an individual's schedule.",
        after: "Built around the person",
        afterSub: "Targets move with their schedule.",
        wakes: ["06:00", "07:30", "09:00"],
      },
      {
        n: "03",
        title: "Deliver",
        before: "Nothing in between",
        beforeSub: "Advice at enrolment, feedback at follow up.",
        after: "Act while it matters",
        afterSub: "Feedback arrives while there is still time to act.",
        enrolment: "Enrolment",
        followUp: "Follow up",
        notification: { title: "Morning light", body: "Still time for some daylight today." },
      },
    ],
    loop: {
      kicker: "The loop closes",
      heading: "Sense. Adapt. Act. Learn.",
      body: "Measure what happened, adapt feedback to the person, intervene at a useful moment, then keep measuring what happens next.",
    },
    deliverRef: "nahumshani2016",
  },

  timing: {
    kicker: "Timing matters",
    heading: "Maya has 21 minutes left.",
    body: "It is 11:45. She has had 9 of her 30 minutes of morning bright light.",
    fictional: "Fictional scenario · Illustrative data",
    timeline: { wake: { t: "7:20", label: "Wake" }, now: { t: "11:45", label: "Now" }, close: { t: "12:30", label: "Window closes" } },
    left: "21 min left",
    progress: { done: 9, target: 30, label: "min" },
    ask: "What should happen next?",
    options: [
      { id: "nothing", label: "Do nothing", sub: "No intervention." },
      { id: "tonight", label: "Tell her tonight", sub: "Include it in her evening summary." },
      { id: "now", label: "Nudge her now", sub: "Send a prompt at 11:45." },
    ],
    outcomes: {
      nothing: { title: "The window closed.", body: "No support arrived while there was still time to act." },
      tonight: { title: "Correct information. Wrong moment.", body: "Maya knows what happened, but today's opportunity has already passed." },
      now: { title: "The intervention arrived while action was still possible.", body: "" },
    },
    eveningSummary: "You got 9 of 30 minutes of morning light today.",
    nudge: {
      title: "Morning light",
      body: "You have had 9 minutes so far. A short walk before your morning window closes can still count toward today's goal.",
    },
    chooses: "Maya chooses to go outside.",
    reset: "Try another choice",
    lesson: {
      steps: ["Sense", "Decide", "Act"],
      heading: "Knowing is not doing.",
      bodyBefore: "The same information can have very different value depending on ",
      bodyEmphasis: "when it arrives",
      bodyAfter: ".",
    },
    phoneLabel: "ARKA phone in the simulation",
  },

  configs: {
    kicker: "One platform. Different needs.",
    heading: "The interface should adapt to the person.",
    body: "The same light signal can support different goals, interactions and levels of complexity. ARKA adapts how that information is presented.",
    densityLabel: "Interface density",
    states: [
      { key: "myopia", who: "Child", title: "Growth, not graphs.", body: "Minutes outdoors become something tangible: a plant that grows over time. One number, one visual metaphor, no charts.", tags: ["One number", "Visual reward", "No charts"], density: "low" },
      { key: "healthy", who: "Healthy adult", title: "Depth when it is useful.", body: "A richer view exposes light balance across the day for people who want more detail.", tags: ["Light balance", "Day trace", "Deeper insight"], density: "high" },
      { key: "glaucoma", who: "Older adult", title: "Clarity above density.", body: "Large type, explicit labels and a small number of immediately useful actions. Information never depends on colour alone.", tags: ["Large type", "Explicit labels", "Accessible"], density: "low" },
      { key: "depression", who: "Depression", title: "Support without pressure.", body: "A clear morning light window, a gentle check in and easy access to support, without streaks or punitive gamification.", tags: ["Low friction", "Gentle prompts", "No streaks"], density: "low" },
      { key: "stroke", who: "Stroke", title: "One action at a time.", body: "One instruction, one primary action and optional listening support before progressing.", tags: ["One task", "One action", "Listen option"], density: "minimal" },
    ],
    principle: {
      kicker: "The principle",
      heading: "The sensor can stay the same. The intervention should not.",
      body: "Personalisation is not simply changing the interface. It is deciding what information someone needs, when they need it, and how much complexity helps rather than harms.",
    },
  },

  build: {
    kicker: "Build an intervention",
    heading: "Configure the study once. The participant experience adapts.",
    body: "Set the population, behavioural target and intervention logic. ARKA translates those decisions into the participant experience.",
    laptopLabel: "The ARKA researcher portal at the study configuration screen for the myopia study.",
    phoneLabel: "The participant app for the configured population: the myopia Plant tab.",
    portal: {
      study: "ARKA Myopia",
      code: "MYOPIA26",
      page: "Mobile App Config",
      pageSub: "Pick who this applies to, then set Lumi and the home screen they see.",
      who: "Who is this for?",
      whoSub: "Arm, phase, and which myopia interface they get",
      fields: {
        population: { label: "Study population", value: "Children 7 to 12 (myopia)" },
        behaviour: { label: "Behaviour", value: "Time outdoors" },
        target: { label: "Daily target", value: "120 minutes above 10,000 lux" },
        window: { label: "Intervention window", value: "07:00 to 19:00, while daylight remains" },
        feedback: { label: "Feedback mode", value: "Growing plant (child) and gauge (parent)" },
        interface: { label: "Interface mode", value: "Standard" },
        accessibility: { label: "Accessibility", value: "Default type scale" },
      },
      arm: "Intervention",
      phase: "Default (all phases)",
      preset: "Myopia",
      footer: "Saved settings are active for scoring.",
      save: "Save",
      reset: "Reset",
      discard: "Discard",
    },
  },

  signal: {
    kicker: "One signal · Five experiences",
    heading: "8:14 AM.",
    body: "The same moment of light can call for five very different experiences.",
    phones: [
      { key: "myopia", name: "Myopia", outcome: "Your plant grew" },
      { key: "healthy", name: "Healthy adult", outcome: "Morning light, 34 min" },
      { key: "glaucoma", name: "Glaucoma", outcome: "34 min bright light today" },
      { key: "depression", name: "Depression", outcome: "18 min left in the window" },
      { key: "stroke", name: "Stroke", outcome: "Morning light. Start." },
    ],
    closing: "Same light. Different intervention.",
    convergenceLabel: "One light signal",
    convergenceAlt: "Five phone outlines above one small light source; five thin paths extend from the light to the phones, then resolve into the ARKA sunrise mark.",
  },

  conclusion: {
    brand: "ARKA",
    line: "Measure light. Understand behaviour. Intervene when it matters.",
    sub: "Built for research. Designed around people.",
  },
};
