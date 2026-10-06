import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, Github, Loader2 } from 'lucide-react'
import { authApi, type AuthConfig } from '../api'
import { AuthForm, type AuthMode } from '../features/auth/AuthForm'
import { useDemoLogin } from '../features/auth/useDemoLogin'
import { AUTHOR_NAME, GITHUB_URL } from '../shared/config'
import { Logo } from '../shared/ui/Logo'
import { Modal } from '../shared/ui/Modal'
import { ThemeToggle } from '../shared/ui/ThemeToggle'
import dashboardLight from '../assets/dashboard-light.jpg'
import dashboardDark from '../assets/dashboard-dark.jpg'

const STEPS = [
  {
    title: 'Записуйте',
    text: 'Нотатку, симптом, ліки чи фото — за кілька секунд прямо з головної. Вагу — окремим зважуванням, щоб бачити динаміку.',
  },
  {
    title: 'Стежте',
    text: 'План на день з нагадуваннями, графік ваги та оцінка стану від 0 до 100, яка підсвічує тривожні симптоми й пропущені ліки.',
  },
  {
    title: 'Показуйте лікарю',
    text: 'Паспорт здоров’я — одна сторінка PDF: алергії, щеплення, вага та спостереження за останній місяць.',
  },
]

const DETAILS: [string, string][] = [
  ['Кілька улюбленців', 'окрема картка для кожного'],
  ['Push-нагадування', 'про ліки та процедури'],
  ['Тижневий звіт', 'на пошту, раз на тиждень'],
  ['Серія днів', 'скільки днів поспіль без пропусків'],
  ['Вхід через Google', 'або email і пароль'],
  ['Телефон і темна тема', 'зручно ввечері біля миски'],
]

// Opening the page with #/login or #/signup (e.g. from the demo banner) opens the form.
function modeFromHash(): AuthMode | null {
  if (location.hash === '#/login') return 'login'
  if (location.hash === '#/signup') return 'register'
  return null
}

export function LandingPage() {
  const [config, setConfig] = useState<AuthConfig | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode | null>(modeFromHash)
  const demo = useDemoLogin()

  useEffect(() => {
    authApi.config().then(setConfig).catch(() => setConfig({ googleClientId: '', demoEnabled: false }))
    if (location.hash) history.replaceState(null, '', location.pathname)
  }, [])

  const demoEnabled = config?.demoEnabled ?? true

  return (
    <div className="min-h-screen bg-paper text-ink overflow-x-hidden">
      <header className="max-w-6xl mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Logo className="text-lg" />
        <nav className="flex items-center gap-1 sm:gap-3">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-ink/70 hover:text-ink transition-colors">
            <Github size={16} /> Код
          </a>
          <ThemeToggle className="w-9 h-9 justify-center rounded-full hover:bg-ink/5" />
          <button onClick={() => setAuthMode('login')}
            className="ml-1 px-4 py-2 text-sm font-medium rounded-full border border-ink/20 hover:border-ink/50 transition-colors">
            Увійти
          </button>
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 lg:pt-20 grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-14 items-center">
          <div>
            <p className="text-sm font-medium text-teal-700 mb-5">Щоденник здоров’я для котів і собак</p>
            <h1 className="font-serif text-[2.5rem] leading-[1.08] sm:text-6xl sm:leading-[1.05] tracking-tight">
              Коли Сніжку востаннє <em className="text-teal-700">робили щеплення?</em>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink/70 max-w-lg">
              WhiskersWatch пам’ятає це за вас. Вага, ліки, симптоми та візити до лікаря зберігаються
              в одній картці, а перед прийомом усе збирається в PDF для ветеринара.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              {demoEnabled && (
                <button onClick={demo.start} disabled={demo.loading}
                  className="group inline-flex items-center gap-2 bg-ink text-paper pl-6 pr-5 py-3.5 rounded-full font-medium hover:bg-ink/85 disabled:opacity-70 transition-colors">
                  {demo.loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {demo.loading ? 'Готую демо…' : 'Відкрити демо'}
                  {!demo.loading && <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />}
                </button>
              )}
              <button onClick={() => setAuthMode('register')}
                className="font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink transition-colors">
                Створити акаунт
              </button>
            </div>
            {demoEnabled && (
              <p className="mt-4 text-sm text-ink/50">Без реєстрації: окремий акаунт з двома улюбленцями та історією за пів року.</p>
            )}
          </div>

          <figure className="xl:-mr-24">
            <div className="rounded-2xl border border-ink/10 bg-paper-deep p-1.5 sm:p-2 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)]">
              <img src={dashboardLight} alt="Головна сторінка WhiskersWatch" width={1920} height={1200}
                className="dark:hidden w-full h-auto rounded-xl border border-ink/5" />
              <img src={dashboardDark} alt="Головна сторінка WhiskersWatch у темній темі" width={1920} height={1200}
                className="hidden dark:block w-full h-auto rounded-xl border border-ink/5" />
            </div>
            <figcaption className="mt-3 text-sm text-ink/50">Головна: план на день, оцінка стану та останні записи.</figcaption>
          </figure>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-24 sm:mt-32">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight max-w-xl">Три звички, які замінюють папку з довідками</h2>
          <ol className="mt-12 grid md:grid-cols-3 gap-10 md:gap-12">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t border-ink/15 pt-6">
                <span className="font-serif text-teal-700 text-lg">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Smaller details ──────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-24 sm:mt-32 grid lg:grid-cols-[1fr_1.6fr] gap-10">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">І ще дрібниці</h2>
            <p className="mt-4 text-ink/70 max-w-sm leading-relaxed">
              Те, що робить застосунок зручним щодня, а не лише перед візитом до клініки.
            </p>
          </div>
          <ul className="border-t border-ink/15">
            {DETAILS.map(([name, note]) => (
              <li key={name} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-4 border-b border-ink/15">
                <span className="font-medium">{name}</span>
                <span className="text-ink/60 sm:text-right">{note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Closing call to action ───────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-24 sm:mt-32">
          <div className="rounded-3xl bg-paper-deep px-6 py-12 sm:px-12 sm:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight max-w-md">
              Подивіться, як виглядає картка з історією за пів року
            </h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 shrink-0">
              {demoEnabled && (
                <button onClick={demo.start} disabled={demo.loading}
                  className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3.5 rounded-full font-medium hover:bg-ink/85 disabled:opacity-70 transition-colors">
                  Відкрити демо <ArrowRight size={18} />
                </button>
              )}
              <button onClick={() => setAuthMode('login')} className="font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                У мене вже є акаунт
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-5 sm:px-8 mt-20">
        <div className="py-8 border-t border-ink/15 flex flex-col sm:flex-row justify-between gap-3 text-sm text-ink/60">
          <p>WhiskersWatch — пет-проєкт, автор {AUTHOR_NAME}, {new Date().getFullYear()}</p>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-ink transition-colors">
            React · TypeScript · Bun · PostgreSQL <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>

      {authMode && (
        <Modal title={authMode === 'login' ? 'З поверненням' : 'Новий акаунт'} onClose={() => setAuthMode(null)}>
          <AuthForm mode={authMode} onModeChange={setAuthMode} googleClientId={config?.googleClientId} />
        </Modal>
      )}
    </div>
  )
}
