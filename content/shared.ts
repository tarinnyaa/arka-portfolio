// Copy shared across pages: chrome, footer, brand.

export const BRAND = {
  name: "ARKA",
  tagline: "A research platform for changing how people live with light.",
  lab: "Eye N' Brain",
  school: "NUS Yong Loo Lin School of Medicine",
  labUrl: "https://medicine.nus.edu.sg/",
  labSiteUrl: "https://eyenbrain.com/",
  preparedBy: "Prepared by Tarinnya Ramaravikumar, supervised by Dr Raymond P. Najjar",
  year: "2026",
};

export const ASSETS = {
  logo: "assets/brand/logo.svg",
  heroEcosystem: "assets/brand/hero-ecosystem.webp",
  actlumus: "assets/brand/actlumus.png",
  eyeNBrain: "assets/brand/eye-n-brain.png",
  nusMedicine: "assets/brand/nus-medicine.png",
  brandIcon: "assets/illustrations/brand-icon.webp",
  illustrations: {
    healthy: "assets/illustrations/healthy.webp",
    myopia: "assets/illustrations/myopia.webp",
    glaucoma: "assets/illustrations/glaucoma.webp",
    depression: "assets/illustrations/depression.webp",
    stroke: "assets/illustrations/stroke.webp",
    researcher: "assets/illustrations/researcher.webp",
    twoAudiences: "assets/illustrations/two-audiences.webp",
  },
  screenshots: {
    homePartial: "assets/screenshots/01-home-partial.png",
    homeExceeded: "assets/screenshots/02-home-exceeded.png",
    plantPartial: "assets/screenshots/03-plant-partial.png",
    plantBloom: "assets/screenshots/04-plant-bloom.png",
    insightsWeek: "assets/screenshots/05-insights-week.png",
    inboxList: "assets/screenshots/06-inbox-list.png",
    inboxReply: "assets/screenshots/07-inbox-reply.png",
    onboarding: "assets/screenshots/08-onboarding.png",
  },
};

export const NAV = {
  modeToggleLabel: "Site mode",
  explore: "Explore",
  research: "Research",
  exploreHint: "Clean storytelling without citation markers.",
  researchHint: "Shows evidence markers. Click a marker to see the claim, source and link.",
  menu: "Menu",
  bottomLabel: "Explore the platform",
};

export const FOOTER = {
  line1: "Eye N' Brain, NUS Yong Loo Lin School of Medicine",
  line2: BRAND.preparedBy,
  illustrative: "All charts on this site show illustrative data. The site never reports a study result.",
};

export const STATUS = {
  live: "Live study",
  designed: "Proposed configuration",
  liveHint: "This configuration has been running with participants since 2026.",
  designedHint: "This configuration is designed and awaiting a study. Nothing here is validated.",
};

export const CHART = {
  illustrative: "Illustrative data",
};

export const NEXT_LINKS: Record<string, { path: string; label: string }> = {
  about: { path: "/myopia", label: "Start with the live study: Myopia" },
  myopia: { path: "/healthy", label: "Next configuration: Healthy adults" },
  healthy: { path: "/glaucoma", label: "Next configuration: Glaucoma" },
  glaucoma: { path: "/depression", label: "Next configuration: Depression" },
  depression: { path: "/stroke", label: "Next configuration: Stroke" },
  stroke: { path: "/", label: "Back to the platform overview" },
};
