// Light-health intervention references. Only references named in the
// project spec (from the vetted FYP deck) appear here. `url` is supplied
// only where the DOI was confidently known at build time; entries with
// `url: null` are listed in the build report as "link not supplied".
//
// Category: "light" = light-health intervention target or mechanism.
// Interface/accessibility references live in design-references.ts.

export type Reference = {
  id: string;
  /** Short in-text form, e.g. "He et al., 2015" */
  short: string;
  /** Full citation line. */
  source: string;
  year: number;
  url: string | null;
  /** What the site uses this reference to support. */
  claim: string;
};

export const REFERENCES: Record<string, Reference> = {
  munch2012: {
    id: "munch2012",
    short: "Münch & Bromundt, 2012",
    source: "Münch M, Bromundt V. Light and chronobiology: implications for health and disease. Dialogues in Clinical Neuroscience, 14(4), 448–453.",
    year: 2012,
    url: "https://doi.org/10.31887/DCNS.2012.14.4/mmunch",
    claim: "Light is the primary environmental time cue for the human circadian system.",
  },
  hannibal2021: {
    id: "hannibal2021",
    short: "Hannibal, 2021",
    source: "Hannibal J. Comparative neurology of circadian photoreception: the retinohypothalamic tract (RHT) in sighted and naturally blind mammals. Frontiers in Neuroscience, 15.",
    year: 2021,
    url: "https://doi.org/10.3389/fnins.2021.640113",
    claim: "Intrinsically photosensitive retinal ganglion cells project to the suprachiasmatic nucleus via the retinohypothalamic tract.",
  },
  berson2002: {
    id: "berson2002",
    short: "Berson et al., 2002",
    source: "Berson DM, Dunn FA, Takao M. Phototransduction by retinal ganglion cells that set the circadian clock. Science, 295(5557), 1070–1073.",
    year: 2002,
    url: "https://doi.org/10.1126/science.1067262",
    claim: "A class of retinal ganglion cells is intrinsically photosensitive and sets the circadian clock.",
  },
  faulkner2020: {
    id: "faulkner2020",
    short: "Faulkner et al., 2020",
    source: "Faulkner SM, et al. (2020). As cited in the project deck.",
    year: 2020,
    url: null,
    claim: "Light interventions often specify what to do, but real-world delivery is weak: monitoring and mobile prompting are under-used and personalisation is rare.",
  },
  nahumshani2016: {
    id: "nahumshani2016",
    short: "Nahum-Shani et al., 2016",
    source: "Nahum-Shani I, Smith SN, Spring BJ, et al. Just-in-time adaptive interventions (JITAIs) in mobile health: key components and design principles for ongoing health behavior support. Annals of Behavioral Medicine, 52(6), 446–462.",
    year: 2016,
    url: "https://doi.org/10.1007/s12160-016-9830-8",
    claim: "Just-in-time adaptive interventions deliver support when a person is both in need and able to receive it.",
  },
  he2015: {
    id: "he2015",
    short: "He et al., 2015",
    source: "He M, Xiang F, Zeng Y, et al. Effect of time spent outdoors at school on the development of myopia among children in China: a randomized clinical trial. JAMA, 314(11), 1142–1148.",
    year: 2015,
    url: "https://doi.org/10.1001/jama.2015.10803",
    claim: "An additional 40 minutes of outdoor time at school reduced incident myopia over three years.",
  },
  xiong2017: {
    id: "xiong2017",
    short: "Xiong et al., 2017",
    source: "Xiong S, Sankaridurg P, Naduvilath T, et al. Time spent in outdoor activities in relation to myopia prevention and control: a meta-analysis and systematic review. Acta Ophthalmologica, 95(6), 551–566.",
    year: 2017,
    url: "https://doi.org/10.1111/aos.13403",
    claim: "Outdoor time is protective against myopia onset.",
  },
  li2022: {
    id: "li2022",
    short: "Li et al., 2022",
    source: "Li, et al. (2022). As cited in the project deck.",
    year: 2022,
    url: null,
    claim: "Prompting parents increases children's outdoor time.",
  },
  rose2008: {
    id: "rose2008",
    short: "Rose et al., 2008",
    source: "Rose KA, Morgan IG, Ip J, et al. Outdoor activity reduces the prevalence of myopia in children. Ophthalmology, 115(8), 1279–1285.",
    year: 2008,
    url: "https://doi.org/10.1016/j.ophtha.2007.12.019",
    claim: "Higher levels of outdoor activity are associated with lower myopia prevalence in children.",
  },
  guggenheim2012: {
    id: "guggenheim2012",
    short: "Guggenheim et al., 2012",
    source: "Guggenheim JA, Northstone K, McMahon G, et al. Time outdoors and physical activity as predictors of incident myopia in childhood: a prospective cohort study. Investigative Ophthalmology & Visual Science, 53(6), 2856–2865.",
    year: 2012,
    url: "https://doi.org/10.1167/iovs.11-9091",
    claim: "Less time outdoors predicts incident myopia in childhood.",
  },
  read2015: {
    id: "read2015",
    short: "Read et al., 2015",
    source: "Read SA, Collins MJ, Vincent SJ. Light exposure and eye growth in childhood. Investigative Ophthalmology & Visual Science, 56(11), 6779–6787.",
    year: 2015,
    url: "https://doi.org/10.1167/iovs.14-15978",
    claim: "Children with lower measured daily light exposure show faster axial eye growth.",
  },
  wu2018: {
    id: "wu2018",
    short: "Wu et al., 2018",
    source: "Wu P-C, Chen C-T, Lin K-K, et al. Myopia prevention and outdoor light intensity in a school-based cluster randomized trial. Ophthalmology, 125(8), 1239–1250.",
    year: 2018,
    url: "https://doi.org/10.1016/j.ophtha.2017.12.011",
    claim: "Outdoor light exposure programmes slow myopic shift and axial elongation.",
  },
  dirani2009: {
    id: "dirani2009",
    short: "Dirani et al., 2009",
    source: "Dirani M, Tong L, Gazzard G, et al. Outdoor activity and myopia in Singapore teenage children. British Journal of Ophthalmology, 93(8), 997–1000.",
    year: 2009,
    url: "https://doi.org/10.1136/bjo.2008.150979",
    claim: "Outdoor activity is associated with less myopia in Singapore teenagers.",
  },
  feigl2011: {
    id: "feigl2011",
    short: "Feigl et al., 2011",
    source: "Feigl B, Mattes D, Thomas R, Zele AJ. Intrinsically photosensitive (melanopsin) retinal ganglion cell function in glaucoma. Investigative Ophthalmology & Visual Science, 52(7), 4362–4367.",
    year: 2011,
    url: "https://doi.org/10.1167/iovs.10-7069",
    claim: "Glaucoma is associated with reduced melanopsin (ipRGC) function.",
  },
  brown2022: {
    id: "brown2022",
    short: "Brown et al., 2022",
    source: "Brown TM, Brainard GC, Cajochen C, et al. Recommendations for daytime, evening, and nighttime indoor light exposure to best support physiology, sleep, and wakefulness in healthy adults. PLoS Biology, 20(3), e3001571.",
    year: 2022,
    url: "https://doi.org/10.1371/journal.pbio.3001571",
    claim: "Expert consensus recommends ≥ 250 melanopic EDI lux during the day, ≤ 10 lux in the three hours before bed and ≤ 1 lux at night.",
  },
  cain2020: {
    id: "cain2020",
    short: "Cain et al., 2020",
    source: "Cain SW, McGlashan EM, Vidafar P, et al. Evening home lighting adversely impacts the circadian system and sleep. Scientific Reports, 10, 19110.",
    year: 2020,
    url: "https://doi.org/10.1038/s41598-020-75622-4",
    claim: "Typical evening home lighting suppresses melatonin and affects sleep.",
  },
  mead2022: {
    id: "mead2022",
    short: "Mead et al., 2022",
    source: "Mead MP, et al. (2022). As cited in the project deck.",
    year: 2022,
    url: null,
    claim: "Light exposure during sleep hours is associated with poorer sleep and health outcomes.",
  },
  kawasaki2021: {
    id: "kawasaki2021",
    short: "Kawasaki et al., 2021",
    source: "Kawasaki A, et al. (2021). As cited in the project deck.",
    year: 2021,
    url: null,
    claim: "Daytime bright-light exposure is a candidate target for people living with glaucoma.",
  },
  buehne2021: {
    id: "buehne2021",
    short: "Buehne et al., 2021",
    source: "Buehne KL, et al. (2021). As cited in the project deck.",
    year: 2021,
    url: null,
    claim: "Eye-drop adherence is a recognised challenge in glaucoma care.",
  },
  leiby2021: {
    id: "leiby2021",
    short: "Leiby et al., 2021",
    source: "Leiby BE, et al. (2021). As cited in the project deck.",
    year: 2021,
    url: null,
    claim: "Follow-up attendance is a recognised challenge in glaucoma care.",
  },
  lam2015: {
    id: "lam2015",
    short: "Lam et al., 2015",
    source: "Lam RW, Levitt AJ, Levitan RD, et al. Efficacy of bright light treatment, fluoxetine, and the combination in patients with nonseasonal major depressive disorder: a randomized clinical trial. JAMA Psychiatry, 73(1), 56–63.",
    year: 2015,
    url: "https://doi.org/10.1001/jamapsychiatry.2015.2235",
    claim: "Morning bright light treatment is effective in nonseasonal major depression.",
  },
  dealmeida2024: {
    id: "dealmeida2024",
    short: "De Almeida et al., 2024",
    source: "De Almeida, et al. (2024). As cited in the project deck.",
    year: 2024,
    url: null,
    claim: "Evening light reduction and stable sleep timing support mood.",
  },
  walker2020: {
    id: "walker2020",
    short: "Walker et al., 2020",
    source: "Walker WH, Walton JC, DeVries AC, Nelson RJ. Circadian rhythm disruption and mental health. Translational Psychiatry, 10, 28.",
    year: 2020,
    url: "https://doi.org/10.1038/s41398-020-0694-0",
    claim: "Circadian disruption is linked to mood disorders.",
  },
  golden2005: {
    id: "golden2005",
    short: "Golden et al., 2005",
    source: "Golden RN, Gaynes BN, Ekstrom RD, et al. The efficacy of light therapy in the treatment of mood disorders: a review and meta-analysis of the evidence. American Journal of Psychiatry, 162(4), 656–662.",
    year: 2005,
    url: "https://doi.org/10.1176/appi.ajp.162.4.656",
    claim: "Bright light therapy is efficacious for mood disorders.",
  },
  burns2021: {
    id: "burns2021",
    short: "Burns et al., 2021",
    source: "Burns AC, Saxena R, Vetter C, et al. Time spent in outdoor light is associated with mood, sleep, and circadian rhythm-related outcomes: a cross-sectional and longitudinal study in over 400,000 UK Biobank participants. Journal of Affective Disorders, 295, 347–352.",
    year: 2021,
    url: "https://doi.org/10.1016/j.jad.2021.08.056",
    claim: "More time in outdoor light is associated with better mood and sleep outcomes.",
  },
  kim2021: {
    id: "kim2021",
    short: "Kim et al., 2021",
    source: "Kim, et al. (2021). As cited in the project deck.",
    year: 2021,
    url: null,
    claim: "Night-time light protection supports sleep after stroke.",
  },
  bernhofer2013: {
    id: "bernhofer2013",
    short: "Bernhofer et al., 2013",
    source: "Bernhofer EI, Higgins PA, Daly BJ, Burant CJ, Hornick TR. Hospital lighting and its association with sleep, mood and pain in medical inpatients. Journal of Advanced Nursing, 70(5), 1164–1173.",
    year: 2013,
    url: "https://doi.org/10.1111/jan.12282",
    claim: "Hospital inpatients are exposed to low daytime light, associated with poorer sleep and mood.",
  },
  west2019: {
    id: "west2019",
    short: "West et al., 2019",
    source: "West A, Simonsen SA, Jennum P, et al. An exploratory investigation of the effect of naturalistic light on depression, anxiety, and cognitive outcomes in stroke patients during admission for rehabilitation. NeuroRehabilitation, 44(3), 341–351.",
    year: 2019,
    url: "https://doi.org/10.3233/NRE-182565",
    claim: "Lighting in stroke rehabilitation wards is typically inadequate and naturalistic light shows benefit.",
  },
  korostovtseva2023: {
    id: "korostovtseva2023",
    short: "Korostovtseva & Kolomeichuk, 2023",
    source: "Korostovtseva L, Kolomeichuk S. (2023). As cited in the project deck.",
    year: 2023,
    url: null,
    claim: "Sleep–wake regulation is commonly disturbed after stroke.",
  },
  hermann2016: {
    id: "hermann2016",
    short: "Hermann & Bassetti, 2016",
    source: "Hermann DM, Bassetti CL. Role of sleep-disordered breathing and sleep-wake disturbances for stroke and stroke recovery. Neurology, 87(13), 1407–1416.",
    year: 2016,
    url: "https://doi.org/10.1212/WNL.0000000000003037",
    claim: "Sleep–wake disturbances affect stroke recovery.",
  },
  baylan2019: {
    id: "baylan2019",
    short: "Baylan et al., 2019",
    source: "Baylan S, Griffiths S, Grant N, et al. Incidence and prevalence of post-stroke insomnia: a systematic review and meta-analysis. Sleep Medicine Reviews, 49, 101222.",
    year: 2019,
    url: "https://doi.org/10.1016/j.smrv.2019.101222",
    claim: "Insomnia is common after stroke.",
  },
  duss2016: {
    id: "duss2016",
    short: "Duss et al., 2016",
    source: "Duss SB, Seiler A, Schmidt MH, et al. The role of sleep in recovery following ischemic stroke: a review of human and animal data. Neurobiology of Sleep and Circadian Rhythms, 2, 94–105.",
    year: 2016,
    url: "https://doi.org/10.1016/j.nbscr.2016.11.003",
    claim: "Sleep supports neuroplasticity and recovery after ischaemic stroke.",
  },
};

export type RefId = keyof typeof REFERENCES;

export function ref(id: string): Reference {
  const r = REFERENCES[id];
  if (!r) throw new Error(`Unknown reference: ${id}`);
  return r;
}

/** References listed without a link — surfaced in the build report. */
export const UNLINKED_REFERENCES = Object.values(REFERENCES).filter((r) => r.url === null);
