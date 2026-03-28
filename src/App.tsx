import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import clsx from 'clsx'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { z } from 'zod'
import { affiliateCards, explainerSections, faqs, legalPageCopy, siteMeta } from './content/site'
import { calculateCreditCardPlan, defaultInputs, type CalculatorInputs, type RepaymentStrategy } from './lib/creditCard'

const inputSchema = z.object({
  balance: z.number().min(100, 'Balance must be at least $100.').max(250000, 'Balance must be $250,000 or below.'),
  apr: z.number().min(0, 'APR cannot be negative.').max(50, 'APR must be 50% or below.'),
  minimumPayment: z.number().min(0, 'Minimum payment cannot be negative.').max(20000, 'Minimum payment is too large.'),
  monthlyPayment: z.number().min(0, 'Payment cannot be negative.').max(20000, 'Monthly payment is too large.'),
  additionalMonthlyPayment: z.number().min(0, 'Additional payment cannot be negative.').max(20000, 'Additional payment is too large.'),
  strategy: z.union([z.literal('minimum-plus'), z.literal('fixed-payment'), z.literal('target-date')]),
  targetMonths: z.number().min(1, 'Target months must be at least 1.').max(600, 'Target months must be 600 or below.'),
})

type FieldErrors = Partial<Record<keyof CalculatorInputs, string>>

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function App() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<LegalPage page={legalPageCopy.about} eyebrow="Methodology" />} />
        <Route path="/privacy" element={<LegalPage page={legalPageCopy.privacy} eyebrow="Privacy" />} />
        <Route path="/terms" element={<LegalPage page={legalPageCopy.terms} eyebrow="Terms" />} />
        <Route path="/disclosure" element={<LegalPage page={legalPageCopy.disclosure} eyebrow="Disclosure" />} />
      </Routes>
    </div>
  )
}

function HomePage() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs)

  const validation = useMemo(() => inputSchema.safeParse(inputs), [inputs])
  const fieldErrors = useMemo(() => collectErrors(validation.success ? null : validation.error), [validation])
  const result = useMemo(() => (validation.success ? calculateCreditCardPlan(inputs) : null), [inputs, validation])

  const strategyComparison = useMemo(() => {
    const scenarios: Array<{ key: RepaymentStrategy; label: string; scenarioInputs: CalculatorInputs }> = [
      { key: 'fixed-payment', label: 'Fixed payment', scenarioInputs: { ...inputs, strategy: 'fixed-payment' } },
      { key: 'minimum-plus', label: 'Minimum + extra', scenarioInputs: { ...inputs, strategy: 'minimum-plus' } },
      { key: 'target-date', label: 'Target date', scenarioInputs: { ...inputs, strategy: 'target-date' } },
    ]

    return scenarios.map((scenario) => {
      const scenarioResult = calculateCreditCardPlan(scenario.scenarioInputs)
      const scenarioPayment =
        scenario.key === 'fixed-payment'
          ? scenario.scenarioInputs.monthlyPayment
          : scenario.key === 'minimum-plus'
            ? scenario.scenarioInputs.minimumPayment + scenario.scenarioInputs.additionalMonthlyPayment
            : scenarioResult.requiredPaymentForTarget ?? 0

      return {
        key: scenario.key,
        label: scenario.label,
        payment: scenarioPayment,
        monthsToPayoff: scenarioResult.monthsToPayoff,
        totalInterest: scenarioResult.totalInterest,
      }
    })
  }, [inputs])

  const chartData = useMemo(
    () =>
      result
        ? result.amortizationSchedule.map((row) => ({
            month: row.month,
            principal: row.principal,
            interest: row.interest,
          }))
        : [],
    [result],
  )

  const setNumberField =
    (field: keyof Pick<CalculatorInputs, 'balance' | 'apr' | 'minimumPayment' | 'monthlyPayment' | 'additionalMonthlyPayment' | 'targetMonths'>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value)
      setInputs((current) => ({ ...current, [field]: Number.isFinite(value) ? value : 0 }))
    }

  const setValueField =
    (field: keyof Pick<CalculatorInputs, 'balance' | 'apr' | 'minimumPayment' | 'monthlyPayment' | 'additionalMonthlyPayment' | 'targetMonths'>) =>
    (value: number) => {
      setInputs((current) => ({ ...current, [field]: value }))
    }

  const setStrategy = (value: RepaymentStrategy) => {
    setInputs((current) => ({ ...current, strategy: value }))
  }

  const exportAmortizationCsv = () => {
    if (!result?.amortizationSchedule.length) {
      return
    }

    const headers = ['Month', 'Starting Balance', 'Payment', 'Interest', 'Principal', 'Ending Balance']
    const rows = result.amortizationSchedule.map((row) => [
      row.month,
      row.startingBalance,
      row.payment,
      row.interest,
      row.principal,
      row.endingBalance,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.map(csvCell).join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `amortization-schedule-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <AppHeader />
      <main>
        <section className="relative isolate overflow-hidden border-b border-base-300 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.2),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.15),transparent_30%),linear-gradient(180deg,#f8fffd_0%,#f8fafc_60%,#e8fffb_100%)]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-6 lg:py-24">
            <div className="space-y-6">
              <div className="badge badge-outline border-primary/30 bg-white/70 px-4 py-3 text-primary">Credit Card Payoff Calculator</div>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight text-slate-900 sm:text-6xl">
                  Build a debt payoff plan with timeline and interest clarity.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  Estimate payoff date, required payment, and total interest using fixed payment, minimum-plus, or target-date strategy modes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a className="btn btn-primary btn-lg" href="#calculator">
                  Build my plan
                </a>
                <a className="btn btn-ghost btn-lg text-slate-700" href="#how-it-works">
                  See assumptions
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <TrustPoint label="Core outputs" value="Timeline + interest" />
                <TrustPoint label="Repayment modes" value="3 strategy options" />
                <TrustPoint label="Validation" value="Real-time checks" />
              </div>
            </div>

            <div className="card border border-primary/10 bg-white/90 shadow-xl shadow-primary/5">
              <div className="card-body gap-5">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Quick snapshot</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Estimated payoff</p>
                    <p className="text-4xl font-semibold text-slate-900">{result?.payoffDateLabel ?? 'N/A'}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SnapshotCard label="Total interest" value={result ? formatMoney(result.totalInterest) : '$0'} />
                    <SnapshotCard label="Monthly rate" value={result ? `${decimal.format(result.effectiveMonthlyRate * 100)}%` : '0.00%'} />
                  </div>
                </div>
                <p className="rounded-none bg-base-200 p-4 text-sm leading-6 text-slate-600">
                  Educational estimate only. Verify details against your issuer statements before making repayment commitments.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="calculator" className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
          <SectionHeading
            eyebrow="Calculator"
            title="Set your debt profile and repayment strategy"
            description="Use slider + number controls for fast scenario tuning, then compare payoff timeline and total interest impact."
          />

          <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
            <div className="space-y-6">
              <ControlPanel eyebrow="Debt profile" title="Current card details" description="Enter your current balance, APR, and minimum payment baseline.">
                <SliderNumberField
                  label="Current balance"
                  hint="Outstanding debt"
                  min={100}
                  max={250000}
                  step={50}
                  suffix="$"
                  value={inputs.balance}
                  error={fieldErrors.balance}
                  onChange={setNumberField('balance')}
                  onValueChange={setValueField('balance')}
                />

                <div className="grid gap-6 lg:grid-cols-2">
                  <SliderNumberField
                    label="APR"
                    hint="Annual percentage rate"
                    min={0}
                    max={50}
                    step={0.1}
                    suffix="%"
                    value={inputs.apr}
                    error={fieldErrors.apr}
                    onChange={setNumberField('apr')}
                    onValueChange={setValueField('apr')}
                  />
                  <SliderNumberField
                    label="Minimum payment"
                    hint="Monthly floor"
                    min={0}
                    max={20000}
                    step={10}
                    suffix="$"
                    value={inputs.minimumPayment}
                    error={fieldErrors.minimumPayment}
                    onChange={setNumberField('minimumPayment')}
                    onValueChange={setValueField('minimumPayment')}
                  />
                </div>
              </ControlPanel>

              <ControlPanel eyebrow="Strategy" title="Choose repayment mode" description="Switch between fixed payment, minimum-plus, and target-date strategies.">
                <TernaryChoiceField<RepaymentStrategy>
                  label="Repayment strategy"
                  hint="Planning mode"
                  value={inputs.strategy}
                  options={[
                    { value: 'fixed-payment', label: 'Fixed payment' },
                    { value: 'minimum-plus', label: 'Minimum + extra' },
                    { value: 'target-date', label: 'Target date' },
                  ]}
                  onChange={setStrategy}
                />

                {inputs.strategy === 'fixed-payment' ? (
                  <SliderNumberField
                    label="Monthly payment"
                    hint="Your planned payment"
                    min={0}
                    max={20000}
                    step={10}
                    suffix="$"
                    value={inputs.monthlyPayment}
                    error={fieldErrors.monthlyPayment}
                    onChange={setNumberField('monthlyPayment')}
                    onValueChange={setValueField('monthlyPayment')}
                  />
                ) : null}

                {inputs.strategy === 'minimum-plus' ? (
                  <SliderNumberField
                    label="Extra over minimum"
                    hint="Added each month"
                    min={0}
                    max={20000}
                    step={10}
                    suffix="$"
                    value={inputs.additionalMonthlyPayment}
                    error={fieldErrors.additionalMonthlyPayment}
                    onChange={setNumberField('additionalMonthlyPayment')}
                    onValueChange={setValueField('additionalMonthlyPayment')}
                  />
                ) : null}

                {inputs.strategy === 'target-date' ? (
                  <SliderNumberField
                    label="Target payoff window"
                    hint="Months to zero balance"
                    min={1}
                    max={600}
                    step={1}
                    suffix="mo"
                    value={inputs.targetMonths}
                    error={fieldErrors.targetMonths}
                    onChange={setNumberField('targetMonths')}
                    onValueChange={setValueField('targetMonths')}
                  />
                ) : null}
              </ControlPanel>
            </div>

            <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <div className="grid gap-4 sm:grid-cols-2">
                <ResultCard
                  tone="primary"
                  label="Months to payoff"
                  value={result?.monthsToPayoff ? `${result.monthsToPayoff} mo` : 'N/A'}
                  detail={result?.payoffDateLabel ? `Estimated completion ${result.payoffDateLabel}` : 'Set valid inputs to calculate.'}
                />
                <ResultCard
                  label="Required payment"
                  value={result?.requiredPaymentForTarget ? formatMoney(result.requiredPaymentForTarget) : 'N/A'}
                  detail={inputs.strategy === 'target-date' ? 'Needed to hit target window' : 'Only shown in target-date mode'}
                />
                <ResultCard
                  label="Total interest"
                  value={result ? formatMoney(result.totalInterest) : '$0'}
                  detail={result ? `Total paid ${formatMoney(result.totalPaid)}` : 'Projected over full payoff horizon'}
                />
                <ResultCard
                  label="Principal repaid"
                  value={result ? formatMoney(result.totalPrincipalPaid) : '$0'}
                  detail="Modeled principal reduction"
                />
              </div>

              <div className="card overflow-hidden border border-base-300 bg-base-100 shadow-[0_18px_55px_-30px_rgba(15,23,42,0.35)]">
                <div className="card-body gap-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Scenario comparison</p>
                      <h2 className="text-2xl font-semibold text-slate-900">Side-by-side strategy outcomes</h2>
                    </div>
                    <p className="text-sm text-slate-500">Compare monthly burden vs payoff speed</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {strategyComparison.map((scenario) => (
                      <article key={scenario.key} className="border border-base-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{scenario.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{formatMoney(scenario.payment)}</p>
                        <p className="mt-2 text-sm text-slate-600">
                          {scenario.monthsToPayoff ? `${scenario.monthsToPayoff} months` : 'No payoff'}
                        </p>
                        <p className="text-sm text-slate-600">Interest: {formatMoney(scenario.totalInterest)}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card overflow-hidden border border-base-300 bg-base-100 shadow-[0_18px_55px_-30px_rgba(15,23,42,0.35)]">
                <div className="card-body gap-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Payment composition</p>
                      <h2 className="text-2xl font-semibold text-slate-900">Principal vs interest</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-500">Monthly breakdown across repayment horizon</p>
                      <button type="button" className="btn btn-sm btn-outline" onClick={exportAmortizationCsv} disabled={!result?.amortizationSchedule.length}>
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#dbe1ea" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                        <Tooltip formatter={(value) => formatMoney(Number(value ?? 0))} />
                        <Legend />
                        <Area type="monotone" dataKey="principal" name="Principal" stackId="1" stroke="#0f766e" fill="#14b8a6" />
                        <Area type="monotone" dataKey="interest" name="Interest" stackId="1" stroke="#f59e0b" fill="#fbbf24" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {result ? (
                    <div className="rounded-none bg-base-200 p-4 text-sm leading-6 text-slate-600">
                      <p className="font-semibold text-slate-800">Interpretation</p>
                      <p>
                        This plan projects payoff in {result.monthsToPayoff ?? 'N/A'} months with total interest of {formatMoney(result.totalInterest)}. Use this as a baseline and re-run after each statement cycle.
                      </p>
                    </div>
                  ) : null}

                  {result?.warnings.length ? (
                    <div className="alert alert-warning">
                      <span>{result.warnings.join(' ')}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="offers" className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
          <SectionHeading
            eyebrow="Affiliate offers"
            title="Tools to execute your payoff plan"
            description="Recommendations are selected for planning support. Calculator outputs are independent from affiliate relationships."
          />
          <div className="alert mt-8 border border-primary/15 bg-primary/5 text-sm text-slate-700">
            <span>{siteMeta.disclosure}</span>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {affiliateCards.map((card) => (
              <article key={card.title} className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">{card.disclosureTag}</p>
                    </div>
                    <span className="badge badge-primary badge-outline">{card.badge}</span>
                  </div>
                  <p className="leading-7 text-slate-600">{card.description}</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {card.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-none bg-primary" aria-hidden="true" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="card-actions mt-auto justify-between">
                    <a className="btn btn-primary" href={card.href} target="_blank" rel="noreferrer">
                      {card.ctaLabel}
                    </a>
                    <span className="text-xs text-slate-500">FTC disclosure applies</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-t border-base-300 bg-base-200/50">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
            <SectionHeading
              eyebrow="Guide"
              title="How this credit card payoff calculator works"
              description="Understand assumptions, repayment mechanics, and practical interpretation of your output."
            />

            <div className="mt-10 grid gap-6 xl:grid-cols-3">
              {explainerSections.map((section) => (
                <article key={section.title} className="card border border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{section.eyebrow}</p>
                    <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
                    <div className="space-y-4 leading-7 text-slate-600">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 grid gap-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="collapse-arrow collapse border border-base-300 bg-base-100">
                  <input type="checkbox" />
                  <div className="collapse-title text-lg font-semibold text-slate-900">{faq.question}</div>
                  <div className="collapse-content leading-7 text-slate-600">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </>
  )
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/85 backdrop-blur">
      <div className="navbar mx-auto max-w-7xl px-4 lg:px-6">
        <div className="navbar-start gap-3">
          <a href="/" className="flex items-center gap-3 text-slate-900">
            <span className="grid h-11 w-11 place-items-center rounded-none bg-primary text-lg font-bold text-primary-content">CC</span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">QUONTLY</p>
              <p className="text-lg font-semibold text-slate-900">
                Credit Card <span className="font-mono italic text-primary">Payoff Calculator</span>
              </p>
            </div>
          </a>
        </div>
        <div className="navbar-end hidden gap-2 lg:flex">
          <HeaderLink to="/">Calculator</HeaderLink>
          <HeaderLink to="/about">About</HeaderLink>
          <HeaderLink to="/privacy">Privacy</HeaderLink>
          <HeaderLink to="/terms">Terms</HeaderLink>
          <HeaderLink to="/disclosure">Disclosure</HeaderLink>
          <a className="btn btn-primary ml-2" href="#calculator">
            Start now
          </a>
        </div>
      </div>
    </header>
  )
}

function HeaderLink({ to, children }: { to: string; children: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => clsx('btn btn-ghost text-sm font-medium', isActive && 'bg-primary/10 text-primary')}>
      {children}
    </NavLink>
  )
}

function AppFooter() {
  return (
    <footer className="border-t border-base-300 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-6">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Credit Card Payoff Calculator</p>
          <p className="max-w-2xl leading-7 text-slate-300">
            Educational estimate only. This tool helps with debt planning but is not legal, tax, or personalized financial advice.
          </p>
          <p className="text-sm text-slate-400">{siteMeta.disclosure}</p>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <NavLink className="link link-hover" to="/about">
            About and methodology
          </NavLink>
          <NavLink className="link link-hover" to="/privacy">
            Privacy policy
          </NavLink>
          <NavLink className="link link-hover" to="/terms">
            Terms of use
          </NavLink>
          <NavLink className="link link-hover" to="/disclosure">
            Affiliate disclosure
          </NavLink>
        </div>
      </div>
    </footer>
  )
}

function LegalPage({ eyebrow, page }: { eyebrow: string; page: (typeof legalPageCopy)[keyof typeof legalPageCopy] }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 lg:px-6">
        <SectionHeading eyebrow={eyebrow} title={page.title} description={page.description} />
        <div className="mt-10 grid gap-6">
          {page.sections.map((section) => (
            <article key={section.heading} className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body gap-4">
                <h2 className="text-2xl font-semibold text-slate-900">{section.heading}</h2>
                <div className="space-y-4 leading-7 text-slate-600">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <AppFooter />
    </>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{title}</h2>
      <p className="text-lg leading-8 text-slate-600">{description}</p>
    </div>
  )
}

function TrustPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-none border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function SnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-none border border-base-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 min-w-0 whitespace-nowrap text-[clamp(1.35rem,3vw,2rem)] font-semibold leading-none tracking-tight text-slate-900">{value}</p>
    </div>
  )
}

function ResultCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone?: 'primary' }) {
  return (
    <article
      className={clsx(
        'card overflow-hidden border border-base-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_16px_40px_-32px_rgba(15,23,42,0.45)]',
        tone === 'primary' && 'border-primary/20 bg-[linear-gradient(180deg,rgba(15,118,110,0.12)_0%,rgba(255,255,255,0.98)_100%)]',
      )}
    >
      <div className="card-body relative gap-2">
        <span className={clsx('absolute inset-x-0 top-0 h-1 bg-base-300/60', tone === 'primary' && 'bg-primary/70')} aria-hidden="true" />
        <p className="pt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="min-w-0 whitespace-nowrap text-[clamp(1.45rem,2.5vw,2.35rem)] font-semibold leading-none tracking-tight text-slate-900">{value}</p>
        <p className="text-sm leading-6 text-slate-600">{detail}</p>
      </div>
    </article>
  )
}

function ControlPanel({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-none border border-base-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.96)_100%)] p-5 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.38)] ring-1 ring-white/70 md:p-6">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-none bg-primary/6 blur-2xl" aria-hidden="true" />
      <div className="relative space-y-2 border-b border-base-300/80 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.7rem]">{title}</h3>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="relative mt-5 space-y-6">{children}</div>
    </section>
  )
}

function SliderNumberField({
  label,
  hint,
  value,
  onChange,
  onValueChange,
  min,
  max,
  step,
  suffix,
  error,
}: {
  label: string
  hint: string
  value: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onValueChange: (value: number) => void
  min: number
  max: number
  step: number
  suffix?: string
  error?: string
}) {
  const decrement = () => onValueChange(roundToStep(Math.max(min, value - step), step))
  const increment = () => onValueChange(roundToStep(Math.min(max, value + step), step))

  return (
    <label className="form-control w-full gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="label-text font-semibold text-slate-800">{label}</span>
        <span className="text-xs text-slate-500">{hint}</span>
      </div>
      <input className="range range-primary calc-slider block h-3 w-full" type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
      <div className="mt-2 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3">
        <button type="button" className="btn h-11 min-h-0 w-11 rounded-none border-primary/20 bg-[linear-gradient(180deg,rgba(15,118,110,0.12)_0%,rgba(15,118,110,0.04)_100%)] text-lg font-semibold text-primary shadow-sm transition hover:scale-105 hover:bg-primary hover:text-primary-content" onClick={decrement} aria-label={`Decrease ${label}`}>
          -
        </button>
        <label className={clsx('flex h-12 w-full items-center justify-center gap-3 rounded-none border-2 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition', error ? 'border-error/60 bg-error/5' : 'border-primary/20 ring-1 ring-primary/8')}>
          <input className="no-spinner w-full bg-transparent text-center text-lg font-semibold text-slate-900 outline-none" type="number" min={min} max={max} step={step} value={value} onChange={onChange} />
          {suffix ? <span className="shrink-0 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{suffix}</span> : null}
        </label>
        <button type="button" className="btn h-11 min-h-0 w-11 rounded-none border-primary/30 bg-[linear-gradient(180deg,#0f766e_0%,#115e59_100%)] text-lg font-semibold text-primary-content shadow-md transition hover:scale-105 hover:brightness-110" onClick={increment} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          Range {min.toLocaleString()} to {max.toLocaleString()}
          {suffix ? ` ${suffix}` : ''}
        </span>
        {error ? <span className="text-xs text-error">{error}</span> : null}
      </div>
    </label>
  )
}

interface ChoiceFieldProps<T extends string> {
  label: string
  hint: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}

function TernaryChoiceField<T extends string>(props: ChoiceFieldProps<T>) {
  const { label, hint, value, options, onChange } = props

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="label-text font-semibold text-slate-800">{label}</span>
        <span className="text-xs text-slate-500">{hint}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={clsx(
              'btn h-auto min-h-0 w-full rounded-none border-2 px-4 py-3 text-left text-sm font-semibold normal-case shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 justify-between',
              value === option.value
                ? 'border-primary bg-[linear-gradient(180deg,#0f766e_0%,#115e59_100%)] text-primary-content shadow-lg ring-2 ring-primary/20'
                : 'border-base-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-700',
            )}
            onClick={() => onChange(option.value)}
          >
            <span className="leading-5">{option.label}</span>
            <span className={clsx('grid h-5 w-5 place-items-center rounded-none border text-[10px] font-bold shadow-sm', value === option.value ? 'border-white/60 bg-white/20 text-white' : 'border-primary/25 bg-primary/5 text-primary')}>
              {value === option.value ? '✓' : ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function collectErrors(error: z.ZodError<CalculatorInputs> | null): FieldErrors {
  if (!error) {
    return {}
  }

  return error.issues.reduce<FieldErrors>((errors, issue) => {
    const field = issue.path[0] as keyof CalculatorInputs | undefined
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
    return errors
  }, {})
}

function roundToStep(value: number, step: number) {
  if (step >= 1) {
    return Math.round(value)
  }
  const precision = String(step).split('.')[1]?.length ?? 0
  return Number(value.toFixed(precision))
}

function formatMoney(value: number) {
  return currency.format(Number.isFinite(value) ? value : 0)
}

function csvCell(value: string | number) {
  const text = String(value)
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

export default App
