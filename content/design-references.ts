// Design-principle references for the ARKA portfolio site.
// These support INTERFACE and ACCESSIBILITY choices only: not light-health
// intervention targets, which come from the FYP deck citations.
//
// The build agent may use entries with verified: true and may NOT add its own.
// If a claim needs a reference that isn't here, leave it uncited and flag it.

export type DesignReference = {
  id: string;
  claim: string;
  source: string;
  url: string;
  verified: boolean;
};

export const DESIGN_REFERENCES: DesignReference[] = [
  {
    id: "wcag22",
    claim:
      "Level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text, and colour must not be the only means of conveying information.",
    source: "W3C, Web Content Accessibility Guidelines 2.2, Recommendation, 12 December 2024",
    url: "https://www.w3.org/TR/WCAG22/",
    verified: true,
  },
  {
    id: "wcag-target-size",
    claim:
      "WCAG 2.2 Success Criterion 2.5.8 sets a minimum pointer target of 24 by 24 CSS pixels at Level AA, with a stricter enhanced criterion available for important controls.",
    source: "W3C, Understanding SC 2.5.8 Target Size (Minimum)",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
    verified: true,
  },
  {
    id: "older-adults-mhealth",
    claim:
      "A systematic review of mobile health applications for older adults identifies nine elderly-friendly interface design recommendations across perceptual capability, motor coordination, and cognitive and memory function.",
    source: "Liu N, Yin J, Tan SS-L, Ngiam KY, Teo HH. JAMIA, 2021",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8510293/",
    verified: true,
  },
  {
    id: "stroke-uiux",
    claim:
      "Recommendations for digital interventions for young stroke survivors include user-centred and co-design methods, simplified language for people with aphasia, personalisation to post-stroke impairments, and consideration of carers' own accessibility needs.",
    source: "Passey D, Ferdous H, Burns K, et al. npj Digital Medicine, 2025",
    url: "https://www.nature.com/articles/s41746-025-01796-8",
    verified: true,
  },
  {
    id: "aphasia-technology",
    claim:
      "Text-to-speech, picture- and word-based language apps, and word prediction software are described as communication supports for people with aphasia.",
    source: "American Stroke Association, last reviewed April 2024",
    url: "https://www.stroke.org/en/life-after-stroke/recovery/daily-living/technology-for-people-with-aphasia",
    verified: true,
  },

  // --- Below: real papers, but I could not read the full text.
  // --- Open each, confirm the claim, then flip verified to true.

  {
    id: "jitai-mental-health",
    claim:
      "A systematic review and meta-analysis of just-in-time adaptive interventions for mental health and psychological well-being. CHECK: confirm the direction and size of the pooled effect before using this claim.",
    source: "Systematic review and meta-analysis, 2025",
    url: "https://pubmed.ncbi.nlm.nih.gov/41027677/",
    verified: false,
  },
  {
    id: "jitai-receptivity",
    claim:
      "JITAI design distinguishes vulnerability from receptivity: whether support is needed from whether the person is able to act on it. CHECK: confirm this distinction is actually drawn in the text.",
    source: "Teepe GW, et al. Journal of Medical Internet Research, 2021",
    url: "https://www.jmir.org/2021/9/e29412",
    verified: false,
  },
  {
    id: "paediatric-engagement",
    claim:
      "Mobile apps for children commonly use progress tracking, goal setting and rewards to sustain engagement. CHECK: confirm which specific features are reported.",
    source: "JMIR Pediatrics and Parenting, 2022",
    url: "https://pediatrics.jmir.org/2022/1/e34967",
    verified: false,
  },
];

/** Only verified entries may be cited on the site. */
export const VERIFIED_DESIGN_REFERENCES = DESIGN_REFERENCES.filter((r) => r.verified);
