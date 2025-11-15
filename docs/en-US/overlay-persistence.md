# Overlay Persistence

KLineChart Pro provides overlay persistence functionality, supporting saving user-drawn graphics to local storage and providing cloud sync interface.

## Features

- ✅ Auto-save drawing data to localStorage
- ✅ Symbol-based storage isolation
- ✅ Cloud sync interface support
- ✅ Auto-load overlays when switching symbols
- ✅ Complete serialization/deserialization support

## Basic Usage

### Enable Local Persistence

```typescript
import { KLineChartPro } from '@klinecharts/pro'

const chart = new KLineChartPro({
  container: 'chart-container',
  symbol: { ticker: 'AAPL' },
  period: { multiplier: 1, timespan: 'day', text: '1D' },
  datafeed: yourDatafeed,
  // Enable overlay persistence
  overlayPersistence: {
    enabled: true
  }
})
```

Once enabled, all user-drawn overlays will be automatically saved to localStorage and restored after page refresh.

## Cloud Sync

### Implement Cloud Sync Interface

```typescript
import { CloudSyncProvider, SerializedOverlay } from '@klinecharts/pro'

class MyCloudSyncProvider implements CloudSyncProvider {
  async upload(symbol: string, overlays: SerializedOverlay[]): Promise<void> {
    // Upload to your backend service
    await fetch(`https://your-api.com/overlays/${symbol}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overlays)
    })
  }

  async download(symbol: string): Promise<SerializedOverlay[]> {
    // Download from your backend service
    const response = await fetch(`https://your-api.com/overlays/${symbol}`)
    return await response.json()
  }
}

// Use cloud sync
const chart = new KLineChartPro({
  container: 'chart-container',
  symbol: { ticker: 'AAPL' },
  period: { multiplier: 1, timespan: 'day', text: '1D' },
  datafeed: yourDatafeed,
  overlayPersistence: {
    enabled: true,
    cloudSyncProvider: new MyCloudSyncProvider()
  }
})
```

### Manually Trigger Cloud Sync

```typescript
import { OverlayStorage } from '@klinecharts/pro'

// Create storage instance
const storage = new OverlayStorage('AAPL', new MyCloudSyncProvider())

// Upload to cloud
await storage.syncToCloud()

// Download from cloud and save to local
const overlays = await storage.syncFromCloud()
```

## Advanced Usage

### Direct localStorage Operations

```typescript
import {
  saveOverlaysToLocalStorage,
  loadOverlaysFromLocalStorage,
  clearOverlaysFromLocalStorage,
  SerializedOverlay
} from '@klinecharts/pro'

// Save
const overlays: SerializedOverlay[] = [
  {
    id: 'overlay_1',
    groupId: 'drawing_tools',
    name: 'horizontalStraightLine',
    points: [
      { timestamp: 1234567890000, value: 100 }
    ],
    lock: false,
    visible: true,
    mode: 'normal'
  }
]
saveOverlaysToLocalStorage('AAPL', overlays)

// Load
const loadedOverlays = loadOverlaysFromLocalStorage('AAPL')

// Clear
clearOverlaysFromLocalStorage('AAPL')
```

### Serialization/Deserialization

```typescript
import {
  serializeOverlay,
  deserializeOverlay
} from '@klinecharts/pro'

// Get overlay from KLineChart API
const chart = chartPro.getApi()
const overlay = chart.getOverlayById('overlay_id')

// Serialize
const serialized = serializeOverlay(overlay)

// Deserialize to OverlayCreate object
const overlayCreate = deserializeOverlay(serialized)

// Create overlay
chart.createOverlay(overlayCreate)
```

## Data Structure

### SerializedOverlay

```typescript
interface SerializedOverlay {
  id: string                    // Unique identifier
  groupId: string              // Group ID
  name: string                 // Overlay name
  points: Array<{              // Point data
    timestamp?: number
    dataIndex?: number
    value?: number
  }>
  lock: boolean                // Whether locked
  visible: boolean             // Whether visible
  mode: string                 // Mode (normal, weak_magnet, strong_magnet)
  extendData?: any            // Extended data
  styles?: any                // Styles
}
```

### CloudSyncProvider

```typescript
interface CloudSyncProvider {
  // Upload to cloud
  upload: (symbol: string, overlays: SerializedOverlay[]) => Promise<void>
  
  // Download from cloud
  download: (symbol: string) => Promise<SerializedOverlay[]>
}
```

## Storage Key Format

Data is stored in localStorage with key format:

```
klinecharts-pro-overlays-{symbol.ticker}
```

Examples:
- `klinecharts-pro-overlays-AAPL`
- `klinecharts-pro-overlays-BTCUSDT`

## Notes

1. **localStorage Limits**: Browser localStorage typically has 5-10MB storage limit, watch your data size
2. **Symbol Isolation**: Drawing data for different symbols is completely isolated
3. **Auto-save**: Overlays are automatically saved when created, modified, or removed
4. **Symbol Switching**: Current overlays are cleared and new ones are loaded when switching symbols
5. **Cloud Sync**: You need to implement your own backend interface for cloud sync

## Complete Example

```typescript
import { KLineChartPro, CloudSyncProvider, SerializedOverlay } from '@klinecharts/pro'

// Implement cloud sync (optional)
class MyCloudSync implements CloudSyncProvider {
  async upload(symbol: string, overlays: SerializedOverlay[]) {
    const token = localStorage.getItem('auth_token')
    await fetch(`/api/overlays/${symbol}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(overlays)
    })
  }

  async download(symbol: string) {
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`/api/overlays/${symbol}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return await res.json()
  }
}

// Create chart instance
const chart = new KLineChartPro({
  container: 'chart',
  symbol: { ticker: 'AAPL', name: 'Apple Inc.' },
  period: { multiplier: 1, timespan: 'day', text: '1D' },
  datafeed: myDatafeed,
  overlayPersistence: {
    enabled: true,
    cloudSyncProvider: new MyCloudSync()
  }
})

// User-drawn overlays are automatically saved
// When switching symbols, corresponding overlays are automatically loaded
chart.setSymbol({ ticker: 'GOOGL', name: 'Alphabet Inc.' })
```
