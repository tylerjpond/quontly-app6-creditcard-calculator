export interface AffiliateCardContent {
  title: string
  badge: string
  description: string
  highlights: string[]
  ctaLabel: string
  href: string
  disclosureTag: string
}

export interface ContentSection {
  eyebrow: string
  title: string
  paragraphs: string[]
}

export interface LegalPageContent {
  title: string
  description: string
  sections: Array<{
    heading: string
    paragraphs: string[]
  }>
}

export const siteMeta = {
  siteName: 'Credit Card Payoff Calculator',
  adsEnabled: false,
  disclosure:
    'This site may earn a commission from affiliate links. Compensation never changes calculator logic or ranking criteria.',
}

export const affiliateCards: AffiliateCardContent[] = [
  /**{
    title: 'Debt payoff spreadsheet bundle',
    badge: 'Template',
    description:
      'Use structured templates to track balances, payment cadence, and milestones alongside this calculator output.',
    highlights: [
      'Visual monthly debt progress tracking',
      'Useful for multi-card planning',
      'Simple way to compare payoff scenarios',
    ],
    ctaLabel: 'Get templates',
    href: 'https://gumroad.com/',
    disclosureTag: 'Affiliate Link',
  },**/
  {
    title: 'Budgeting app recommendations',
    badge: 'Budgeting',
    description:
      'Pair your payoff plan with category budgeting to protect your monthly payment consistency.',
    highlights: [
      'Track spend leaks that slow payoff',
      'Build stable monthly payment behavior',
      'Useful for emergency buffer planning',
    ],
    ctaLabel: 'Explore budget apps',
    href: 'https://www.ynab.com/',
    disclosureTag: 'Affiliate Link',
  },
  {
    title: 'Credit monitoring basics',
    badge: 'Monitoring',
    description:
      'Monitoring tools help you observe utilization trends while you execute your payoff timeline.',
    highlights: [
      'Watch utilization movement over time',
      'Spot reporting changes quickly',
      'Keeps payoff strategy tied to credit goals',
    ],
    ctaLabel: 'View options',
    href: 'https://www.experian.com/',
    disclosureTag: 'Affiliate Link',
  },
]

export const explainerSections: ContentSection[] = [
  {
    eyebrow: 'How to use it',
    title: 'Start with one balance and one strategy, then iterate monthly',
    paragraphs: [
      'Use fixed payment mode when you already know what you can pay each month. Use target-date mode when you need a required payment to hit a deadline.',
      'After each month, update the balance and re-run. Real payoff planning improves when you refresh with real statement data instead of assuming static outcomes.',
    ],
  },
  {
    eyebrow: 'Formula',
    title: 'Interest is applied monthly, then payment reduces principal',
    paragraphs: [
      'The model converts APR into a monthly rate and applies it to the current balance each cycle. Remaining payment amount goes to principal reduction.',
      'When payment is too close to interest, payoff time extends materially. Increasing payment by even a small amount can reduce total interest significantly.',
    ],
  },
  {
    eyebrow: 'Practical guidance',
    title: 'Consistency and cash-flow stability matter more than perfect precision',
    paragraphs: [
      'This calculator is an estimate engine. Use it to choose realistic payment behavior that can be maintained across normal monthly variability.',
      'If payoff drifts, focus first on budget reliability and payment automation before increasing payment intensity.',
    ],
  },
]

export const faqs = [
  {
    question: 'How accurate is this credit card payoff calculator?',
    answer:
      'It provides planning estimates based on APR and monthly compounding assumptions. Actual issuer calculations and fees may differ slightly.',
  },
  {
    question: 'Why is payoff so slow near minimum payments?',
    answer:
      'When payment is only slightly above monthly interest, principal reduction is small. That extends payoff and increases total interest cost.',
  },
  {
    question: 'What does target-date mode do?',
    answer:
      'It estimates the monthly payment required to reach zero balance by your selected number of months.',
  },
  {
    question: 'Can this replace financial advice?',
    answer:
      'No. This is an educational planning tool and does not provide legal, tax, or personalized financial advice.',
  },
]

export const legalPageCopy: Record<string, LegalPageContent> = {
  about: {
    title: 'About this calculator',
    description:
      'Methodology, assumptions, and intended use for credit card payoff planning outputs.',
    sections: [
      {
        heading: 'Methodology',
        paragraphs: [
          'This calculator uses APR-to-monthly-rate conversion and month-by-month amortization style projections to estimate payoff timeline and total interest.',
          'Outputs are estimates and may differ from issuer-specific posting order, fee handling, or statement cycle details.',
        ],
      },
      {
        heading: 'Intended use',
        paragraphs: [
          'This tool is for educational planning and scenario comparison.',
          'If you need personalized recommendations, consult a qualified financial professional.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    description: 'How data, analytics, advertising, and affiliate links are handled on this website.',
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'The calculator runs in-browser and does not require account creation in this version.',
          'Standard analytics or advertising tooling may collect aggregate usage metrics.',
        ],
      },
      {
        heading: 'Third-party services',
        paragraphs: [
          'Affiliate, analytics, and ad providers may process data according to their own policies.',
          'Please review those provider policies for details.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    description: 'Terms that apply to your use of the calculator and related content.',
    sections: [
      {
        heading: 'Educational information only',
        paragraphs: [
          'This tool provides general estimates and does not constitute financial advice.',
          'You remain responsible for financial decisions and outcomes.',
        ],
      },
      {
        heading: 'No warranty',
        paragraphs: [
          'The calculator is provided as-is without guarantees of uninterrupted service or perfect accuracy.',
          'By using this tool, you acknowledge that outputs are estimates for planning purposes.',
        ],
      },
    ],
  },
  disclosure: {
    title: 'Affiliate disclosure',
    description: 'How affiliate relationships work and how they relate to recommendations on this page.',
    sections: [
      {
        heading: 'How affiliate links work',
        paragraphs: [
          'Some outbound links may generate commission from qualifying actions.',
          'Affiliate relationships do not influence calculator math or recommendation logic.',
        ],
      },
      {
        heading: 'Placement approach',
        paragraphs: [
          'Disclosure is visible near recommendations and in the footer.',
          'Offers are selected for utility and fit, not by commission rate alone.',
        ],
      },
    ],
  },
}
