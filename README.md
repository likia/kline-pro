<h1 align="center">KLineChart Pro</h1>
<p align="center">Financial chart built out of the box based on KLineChart.</p>

<div align="center">

[![Version](https://badgen.net/npm/v/@klinecharts/pro)](https://www.npmjs.com/package/@klinecharts/pro)
[![Size](https://badgen.net/bundlephobia/minzip/@klinecharts/pro@latest)](https://bundlephobia.com/package/@klinecharts/pro@latest)
[![Typescript](https://badgen.net/npm/types/@klinecharts/pro)](dist/index.d.ts)
[![LICENSE](https://badgen.net/github/license/klinecharts/pro)](LICENSE)

</div>

## Install
### Using npm or yarn
```bash
# using npm
npm install @klinecharts/pro --save

# using yarn
yarn add @klinecharts/pro
```

### Using unpkg or jsDelivr
```html
<!-- using unpkg -->
<script src="https://unpkg.com/@klinecharts/pro/dist/klinecharts-pro.umd.js"></script>

<!-- using jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/@klinecharts/pro/dist/klinecharts-pro.umd.js"></script>
```

## Docs
+ [中文](https://pro.klinecharts.com)
+ [English](https://pro.klinecharts.com/en-US)

## Features
+ 📈 Built on [KLineChart](https://github.com/klinecharts/KLineChart) - powerful and flexible
+ 🎨 Drawing tools with persistence support - save and restore user drawings
+ 💾 localStorage + Cloud sync - drawings persist across sessions with symbol isolation
+ 🌐 Internationalization (i18n) support
+ 🎯 TypeScript support
+ 📱 Responsive design

## Quick Example
```typescript
import { KLineChartPro } from '@klinecharts/pro'

const chart = new KLineChartPro({
  container: 'chart',
  symbol: { ticker: 'AAPL' },
  period: { multiplier: 1, timespan: 'day', text: '1D' },
  datafeed: yourDatafeed,
  // Enable drawing persistence
  overlayPersistence: {
    enabled: true
  }
})
```

For more details, see [Overlay Persistence Documentation](docs/overlay-persistence.md).

## ©️ License
KLineChart Pro is available under the Apache License V2.
