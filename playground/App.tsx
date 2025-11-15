import { createEffect, createSignal, onCleanup, onMount, type Component } from 'solid-js'

import { KLineChartPro, type ChartPro, type SymbolInfo, type Period } from '../src'

import MockDatafeed from './MockDatafeed'

const SYMBOL_OPTIONS: SymbolInfo[] = [
  { ticker: 'AAPL', shortName: 'Apple', name: 'Apple Inc.', exchange: 'NASDAQ', market: 'stocks', priceCurrency: 'USD', pricePrecision: 2, volumePrecision: 0 },
  { ticker: 'TSLA', shortName: 'Tesla', name: 'Tesla Motors', exchange: 'NASDAQ', market: 'stocks', priceCurrency: 'USD', pricePrecision: 2, volumePrecision: 0 },
  { ticker: 'BTCUSD', shortName: 'Bitcoin', name: 'Bitcoin / USD', exchange: 'Crypto', market: 'crypto', priceCurrency: 'USD', pricePrecision: 2, volumePrecision: 3 }
]

const PERIOD_OPTIONS: Period[] = [
  { multiplier: 1, timespan: 'minute', text: '1m' },
  { multiplier: 5, timespan: 'minute', text: '5m' },
  { multiplier: 15, timespan: 'minute', text: '15m' },
  { multiplier: 1, timespan: 'hour', text: '1H' },
  { multiplier: 4, timespan: 'hour', text: '4H' },
  { multiplier: 1, timespan: 'day', text: '1D' },
  { multiplier: 1, timespan: 'week', text: '1W' },
  { multiplier: 1, timespan: 'month', text: '1M' }
]

const TIMEZONE_OPTIONS = ['UTC', 'Asia/Shanghai', 'America/New_York']
const LOCALE_OPTIONS = ['zh-CN', 'en-US'] as const

type LocaleOption = typeof LOCALE_OPTIONS[number]
type ThemeOption = 'light' | 'dark'

const App: Component = () => {
  let container!: HTMLDivElement
  let chart: ChartPro | undefined
  const datafeed = new MockDatafeed()

  const [symbol, setSymbol] = createSignal<SymbolInfo>(SYMBOL_OPTIONS[0])
  const [period, setPeriod] = createSignal<Period>(PERIOD_OPTIONS[5])
  const [timezone, setTimezone] = createSignal(TIMEZONE_OPTIONS[0])
  const [locale, setLocale] = createSignal<LocaleOption>('zh-CN')
  const [theme, setTheme] = createSignal<ThemeOption>('light')

  onMount(() => {
    chart = new KLineChartPro({
      container,
      symbol: symbol(),
      period: period(),
      periods: PERIOD_OPTIONS,
      timezone: timezone(),
      locale: locale(),
      theme: theme(),
      datafeed
    })
  })

  createEffect(() => {
    if (chart) {
      chart.setSymbol(symbol())
    }
  })

  createEffect(() => {
    if (chart) {
      chart.setPeriod(period())
    }
  })

  createEffect(() => {
    if (chart) {
      chart.setTheme(theme())
    }
  })

  createEffect(() => {
    if (chart) {
      chart.setLocale(locale())
    }
  })

  createEffect(() => {
    if (chart) {
      chart.setTimezone(timezone())
    }
  })

  onCleanup(() => {
    chart = undefined
  })

  const handleSymbolChange = (event: Event) => {
    const value = (event.currentTarget as HTMLSelectElement).value
    const next = SYMBOL_OPTIONS.find(option => option.ticker === value)
    if (next) {
      setSymbol(next)
    }
  }

  const handlePeriodChange = (event: Event) => {
    const value = (event.currentTarget as HTMLSelectElement).value
    const next = PERIOD_OPTIONS.find(option => option.text === value)
    if (next) {
      setPeriod(next)
    }
  }

  const handleLocaleChange = (event: Event) => {
    const value = (event.currentTarget as HTMLSelectElement).value as LocaleOption
    setLocale(value)
  }

  const handleTimezoneChange = (event: Event) => {
    const value = (event.currentTarget as HTMLSelectElement).value
    setTimezone(value)
  }

  const toggleTheme = () => {
    setTheme(theme() === 'light' ? 'dark' : 'light')
  }

  return (
    <div class="playground">
      <header class="playground__toolbar">
        <h1>Chart Playground</h1>
        <select value={symbol().ticker} onInput={handleSymbolChange}>
          {SYMBOL_OPTIONS.map(option => (
            <option value={option.ticker}>{option.shortName ?? option.ticker}</option>
          ))}
        </select>
        <select value={period().text} onInput={handlePeriodChange}>
          {PERIOD_OPTIONS.map(option => (
            <option value={option.text}>{option.text}</option>
          ))}
        </select>
        <select value={timezone()} onInput={handleTimezoneChange}>
          {TIMEZONE_OPTIONS.map(option => (
            <option value={option}>{option}</option>
          ))}
        </select>
        <select value={locale()} onInput={handleLocaleChange}>
          {LOCALE_OPTIONS.map(option => (
            <option value={option}>{option}</option>
          ))}
        </select>
        <button type="button" onClick={toggleTheme}>
          {theme() === 'light' ? 'Switch Dark' : 'Switch Light'}
        </button>
      </header>
      <main class="playground__content">
        <div class="playground__panel">
          <div ref={container} class="playground__chart" />
        </div>
      </main>
    </div>
  )
}

export default App
