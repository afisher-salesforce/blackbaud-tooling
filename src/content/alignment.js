/**
 * The 6-way alignment taxonomy.
 *
 * This REPLACES Christa's binary "Covered / Not Covered / Inconclusive" draft.
 * The point for the Enterprise Architecture audience is that "alignment" is a
 * spectrum, not a yes/no — the canonical example is LinkedIn Sales Navigator,
 * which is neither "covered" nor "a gap": Salesforce surfaces it in-platform
 * (Sales Navigator app for Salesforce) AND can unify its signal via Data 360,
 * so the honest answer is "integrates / Data 360", a conversation, not a verdict.
 *
 * Every per-capability `alignment` value is one of these keys. The whole column
 * is labeled as Salesforce's PRELIMINARY point of view for discussion — never a
 * commitment, and explicitly "may be too black-and-white" vs. Christa's draft.
 */

export const ALIGNMENT = {
  native: {
    key: 'native',
    label: 'Native',
    short: 'Native',
    description: 'Salesforce delivers this capability out-of-the-box on licenses Blackbaud already owns or can light up.',
    // Tailwind utility fragments; AlignmentChip composes them.
    chip: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    chipDark: 'dark:text-emerald-400',
    dot: 'bg-emerald-500',
    order: 1,
  },
  integrates: {
    key: 'integrates',
    label: 'Integrates',
    short: 'Integrates',
    description: 'Salesforce does not replace the tool, but surfaces it inside the platform (packaged app / API) so the work happens in one place.',
    chip: 'bg-sky-500/15 text-sky-600 border-sky-500/25',
    chipDark: 'dark:text-sky-400',
    dot: 'bg-sky-500',
    order: 2,
  },
  data360: {
    key: 'data360',
    label: 'Data 360',
    short: 'Data 360',
    description: 'Keep the tool; unify and activate its data through Data 360 (Data Cloud) so the signal lands on the customer record and in agents.',
    chip: 'bg-violet-500/15 text-violet-600 border-violet-500/25',
    chipDark: 'dark:text-violet-400',
    dot: 'bg-violet-500',
    order: 3,
  },
  partial: {
    key: 'partial',
    label: 'Partial',
    short: 'Partial',
    description: 'Salesforce covers some of the jobs-to-be-done but not all; a reduced-scope consolidation or a hybrid is the realistic story.',
    chip: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
    chipDark: 'dark:text-amber-400',
    dot: 'bg-amber-500',
    order: 4,
  },
  gap: {
    key: 'gap',
    label: 'Gap',
    short: 'Gap',
    description: 'Salesforce genuinely does not play here. Naming these honestly is what makes the rest of the map credible to Enterprise Architecture.',
    chip: 'bg-slate-500/15 text-slate-600 border-slate-500/25',
    chipDark: 'dark:text-slate-300',
    dot: 'bg-slate-400',
    order: 5,
  },
  discuss: {
    key: 'discuss',
    label: 'Discuss',
    short: 'Discuss',
    description: 'Needs Blackbaud input before we can place it — depends on how the tool is actually used, integrated, or valued internally.',
    chip: 'bg-rose-500/15 text-rose-600 border-rose-500/25',
    chipDark: 'dark:text-rose-400',
    dot: 'bg-rose-500',
    order: 6,
  },
};

export const ALIGNMENT_ORDER = Object.values(ALIGNMENT)
  .sort((a, b) => a.order - b.order)
  .map((a) => a.key);

export function alignmentMeta(key) {
  return ALIGNMENT[key] || ALIGNMENT.discuss;
}

// The honest disclaimer applied to the whole alignment column, shown on the
// Overview banner and echoed on every capability detail page.
export const ALIGNMENT_DISCLAIMER =
  'Alignment is Salesforce’s preliminary point of view for discussion — not a commitment, and not validated with Blackbaud yet. ' +
  'It starts from Christa’s draft analysis (assembled quickly, partly with Gemini) and may be too black-and-white; the goal of this session is to replace these placeholders with Blackbaud’s own view.';
