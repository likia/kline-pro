import type { Datafeed, SymbolInfo, Period, DatafeedSubscribeCallback } from '../src'

type Candle = Awaited<ReturnType<Datafeed['getHistoryKLineData']>>[number]

interface SymbolConfig extends SymbolInfo {
  basePrice: number
  volatility: number
}

const SYMBOLS: SymbolConfig[] = [
  { ticker: 'AAPL', shortName: 'Apple', name: 'Apple Inc.', priceCurrency: 'USD', exchange: 'NASDAQ', market: 'stocks', basePrice: 185, volatility: 0.8, pricePrecision: 2, volumePrecision: 0 },
  { ticker: 'TSLA', shortName: 'Tesla', name: 'Tesla Motors', priceCurrency: 'USD', exchange: 'NASDAQ', market: 'stocks', basePrice: 250, volatility: 1.4, pricePrecision: 2, volumePrecision: 0 },
  { ticker: 'BTCUSD', shortName: 'Bitcoin', name: 'Bitcoin / USD', priceCurrency: 'USD', exchange: 'Crypto', market: 'crypto', basePrice: 45000, volatility: 2.4, pricePrecision: 2, volumePrecision: 0 }
]

const TIMES_IN_MS: Record<string, number> = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
}

function periodToMs (period: Period): number {
  return (TIMES_IN_MS[period.timespan] ?? TIMES_IN_MS.minute) * period.multiplier
}

function round (value: number, precision = 2): number {
  const power = Math.pow(10, precision)
  return Math.round(value * power) / power
}

function generateSeries (symbol: SymbolConfig, period: Period, size = 400): Candle[] {
  const step = periodToMs(period)
  const start = Date.now() - size * step
  let lastClose = symbol.basePrice
  return Array.from({ length: size }).map((_, index) => {
    const timestamp = start + index * step
    const drift = symbol.volatility * (Math.random() - 0.5)
    const open = lastClose
    const close = round(open * (1 + drift / 100), symbol.pricePrecision ?? 2)
    const high = round(Math.max(open, close) * (1 + Math.random() * 0.01), symbol.pricePrecision ?? 2)
    const low = round(Math.min(open, close) * (1 - Math.random() * 0.01), symbol.pricePrecision ?? 2)
    const volume = Math.max(100, Math.round(Math.abs(close - open) * 800 + Math.random() * 1000))
    lastClose = close
    return {
      timestamp,
      open,
      high,
      low,
      close,
      volume,
      turnover: round(volume * close, 2)
    }
  })
}

function createNextBar (prev: Candle, symbol: SymbolConfig, period: Period): Candle {
  const step = periodToMs(period)
  const drift = symbol.volatility * (Math.random() - 0.5)
  const open = prev.close
  const close = round(open * (1 + drift / 120), symbol.pricePrecision ?? 2)
  const high = round(Math.max(open, close) * (1 + Math.random() * 0.01), symbol.pricePrecision ?? 2)
  const low = round(Math.min(open, close) * (1 - Math.random() * 0.01), symbol.pricePrecision ?? 2)
  const volume = Math.max(100, Math.round(Math.abs(close - open) * 1200 + Math.random() * 600))
  return {
    timestamp: prev.timestamp + step,
    open,
    high,
    low,
    close,
    volume,
    turnover: round(volume * close, 2)
  }
}

export default class MockDatafeed implements Datafeed {
  private _series = new Map<string, Candle[]>()

  private _subscriptions = new Map<string, number>()

  private _key (symbol: SymbolInfo, period: Period): string {
    return `${symbol.ticker}-${period.multiplier}-${period.timespan}`
  }

  private _getSymbolConfig (ticker: string): SymbolConfig {
    const config = SYMBOLS.find(item => item.ticker === ticker)
    if (!config) {
      return SYMBOLS[0]
    }
    return config
  }

  private _ensureSeries (symbol: SymbolInfo, period: Period): Candle[] {
    const key = this._key(symbol, period)
    if (!this._series.has(key)) {
      const config = this._getSymbolConfig(symbol.ticker)
      this._series.set(key, generateSeries(config, period))
    }
    return this._series.get(key)!
  }

  async searchSymbols (search = ''): Promise<SymbolInfo[]> {
    const query = search.trim().toLowerCase()
    return SYMBOLS
      .filter(item => {
        if (!query) { return true }
        return item.ticker.toLowerCase().includes(query) || (item.name?.toLowerCase() ?? '').includes(query)
      })
      .map(item => ({
        ticker: item.ticker,
        shortName: item.shortName,
        name: item.name,
        market: item.market,
        exchange: item.exchange,
        priceCurrency: item.priceCurrency,
        pricePrecision: item.pricePrecision,
        volumePrecision: item.volumePrecision,
        logo: item.logo
      }))
  }

  async getHistoryKLineData (symbol: SymbolInfo, period: Period, from: number, to: number): Promise<Candle[]> {
    const series = this._ensureSeries(symbol, period)
    return series.filter(item => item.timestamp >= from && item.timestamp <= to)
  }

  subscribe (symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void {
    const key = this._key(symbol, period)
    this.unsubscribe(symbol, period)
    const config = this._getSymbolConfig(symbol.ticker)
    const timer = window.setInterval(() => {
      const series = this._ensureSeries(symbol, period)
      const last = series[series.length - 1]
      const next = createNextBar(last, config, period)
      series.push(next)
      callback(next)
    }, 3000)
    this._subscriptions.set(key, timer)
  }

  unsubscribe (symbol: SymbolInfo, period: Period): void {
    const key = this._key(symbol, period)
    const timer = this._subscriptions.get(key)
    if (timer) {
      window.clearInterval(timer)
      this._subscriptions.delete(key)
    }
  }
}
