// Copy for /healthy. Designed configuration: nothing here is deployed.

export const HEALTHY = {
  title: "ARKA · Healthy adults",
  header: {
    title: "Healthy adults",
    cohort: "Working-age adults",
    status: "designed" as const,
    illustrationAlt: "An adult in a bright home, morning light coming through a window.",
    ribbonLabel: "Light ribbon: a 24-hour lux profile with three target bands",
    lede: "Deliberately the densest interface on the platform: the visual opposite of Glaucoma and Stroke.",
  },
  goals: [
    { value: "≥ 250 mEDI", label: "daytime", refs: ["brown2022"] },
    { value: "≤ 10 mEDI", label: "evening, 3 hours before bed", refs: ["brown2022"] },
    { value: "≤ 1 mEDI", label: "night", refs: ["brown2022"] },
  ],
  reality: {
    kicker: "Targets vs reality",
    heading: "Three ways a normal day misses the targets.",
    columns: [
      {
        title: "Insufficient daylight",
        problem: "Indoor days rarely reach 250 mEDI. A bright office feels bright and measures dim.",
        answer: "Day arc of the score: minutes at or above 250 mEDI, with a nudge if the morning is dim.",
        refs: ["brown2022"],
      },
      {
        title: "Excessive evening brightness",
        problem: "Ordinary home lighting after dinner sits well above 10 mEDI.",
        answer: "Evening arc: exposure in the three hours before bed, with a dim-the-lights nudge two hours out.",
        refs: ["cain2020", "brown2022"],
      },
      {
        title: "Light during sleep hours",
        problem: "Street light, standby LEDs and a phone at 23:00 keep the night above 1 mEDI.",
        answer: "Night arc: the sensor records the bedroom; the score shows where the night was disturbed.",
        refs: ["mead2022", "brown2022"],
      },
    ],
  },
  score: {
    kicker: "The Light Balance Score",
    heading: "One ring, three arcs.",
    body: "A 0-100 score with a segment for day, evening and night. Each segment's status is written in words next to its colour.",
    today: 71,
    segments: [
      { key: "day", label: "Day", status: "On track", value: "312 mEDI avg", score: 32, max: 40 },
      { key: "evening", label: "Evening", status: "Needs attention", value: "40 mEDI at 23:10", score: 19, max: 35 },
      { key: "night", label: "Night", status: "On track", value: "< 1 mEDI", score: 20, max: 25 },
    ],
    callouts: [
      "Ring: today's score, drawn from 0 to 71.",
      "Three arcs: day, evening, night: with status in text as well as colour.",
      "Evening is the segment that pulled the score down.",
    ],
    tabs: ["Home", "Insights", "Lumi", "Inbox", "Diary"],
    greeting: "Good afternoon, Sam",
    date: "Thursday 17 Sep",
  },
  day: {
    kicker: "A day of light",
    heading: "Twenty-four hours, log scale.",
    body: "The trace draws left to right: a dim indoor morning, a lunchtime peak, a low evening, then a spike at 23:00.",
    chartTitle: "Melanopic EDI across one day",
    summary:
      "Line chart of melanopic equivalent daylight illuminance across 24 hours on a logarithmic axis, with shaded target bands: day at or above 250, evening at or below 10, night at or below 1. The trace stays around 100-200 through the indoor morning, peaks near 5,000 at lunchtime, falls to around 20 in the evening, then spikes to about 40 at 23:00 before dropping below 1 overnight.",
    annotation: "This is where the evening score dropped.",
    bands: [
      { label: "Day ≥ 250", from: 7, to: 19, low: 250, high: 100000 },
      { label: "Evening ≤ 10", from: 20, to: 23, low: 0.1, high: 10 },
      { label: "Night ≤ 1", from: 23, to: 31, low: 0.1, high: 1 },
    ],
    followLabel: "Move across the chart to read the value at any hour.",
  },
  lumi: {
    kicker: "Lumi",
    heading: "A conversation that never guesses the source.",
    body: "Lumi can read the sensor. It cannot see the room. So it reports the measurement and asks.",
    turns: [
      { who: "user", text: "Why was my evening score low?" },
      {
        who: "lumi",
        text: "Your evening exposure rose around 23:10: your sensor recorded about 40 lux, above the 10-lux evening target. Was that a screen, or room lighting?",
      },
      { who: "options", options: ["A screen", "Room lighting"] },
    ],
    followups: {
      "A screen": "Thanks. Screens in the last hour before bed are a common source. Night mode helps a little; distance and brightness help more.",
      "Room lighting": "Thanks. Overhead lights are usually the brightest thing in a room after dark. A lamp at eye level or below is often enough.",
    },
  },
  nudges: {
    kicker: "Nudges",
    heading: "Two windows, two prompts.",
    items: [
      { time: "11:40", title: "Morning light", body: "You've had 12 minutes of bright light today: a walk before 2pm would help." },
      { time: "21:30", title: "Wind-down", body: "Two hours to bed. Time to dim the lights." },
    ],
  },
  config: {
    study: "ARKA Healthy Adults",
    cohort: "Healthy adults",
    tabs: [
      { label: "Home", on: true },
      { label: "Insights", on: true },
      { label: "Lumi", on: true },
      { label: "Inbox", on: true },
      { label: "Diary", on: true },
    ],
    targets: ["Day ≥ 250 mEDI", "Evening ≤ 10 mEDI", "Night ≤ 1 mEDI"],
    windows: ["2 h after wake", "3 h before bed"],
    lumi: true,
    typeScale: "1.0",
    arms: ["Single arm (designed)"],
  },
  decision: {
    n: 2,
    label: "Design decision",
    title: "Density is a choice, not a default.",
    lines: [
      "This configuration is designed for adults who want the data, so the home screen shows it: a score, three arcs and a full day.",
      "Every other configuration on the platform removes something from this screen.",
    ],
  },
  rationale: {
    button: "Design rationale",
    title: "Why this page is dense",
    paragraphs: [
      "Healthy adults in a light study are typically curious about their own data. The score, the arcs and the full-day chart give them something to explore.",
      "Density is still bounded: three arcs, not ten metrics; one chart, not a dashboard. Every number carries a status in words.",
      "Lumi is enabled here because the audience can carry a conversation about their day and correct the sensor's blind spots: it never sees the room.",
      "This is a designed configuration. Nothing on this page has run with participants.",
    ],
  },
  closing: "The data is the intervention here. Elsewhere, it isn't.",
};
