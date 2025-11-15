# 画图数据持久化 (Overlay Persistence)

KLineChart Pro 提供了画图数据持久化功能，支持将用户绘制的图形保存到本地存储，并提供云同步接口。

## 功能特点

- ✅ 自动保存画图数据到 localStorage
- ✅ 按 symbol（交易对）隔离存储
- ✅ 支持云端同步接口
- ✅ 切换 symbol 时自动加载对应的画图数据
- ✅ 完整的序列化/反序列化支持

## 基础用法

### 启用本地持久化

```typescript
import { KLineChartPro } from '@klinecharts/pro'

const chart = new KLineChartPro({
  container: 'chart-container',
  symbol: { ticker: 'AAPL' },
  period: { multiplier: 1, timespan: 'day', text: '1D' },
  datafeed: yourDatafeed,
  // 启用画图持久化
  overlayPersistence: {
    enabled: true
  }
})
```

启用后，用户绘制的所有图形将自动保存到 localStorage，刷新页面后会自动恢复。

## 云端同步

### 实现云同步接口

```typescript
import { CloudSyncProvider, SerializedOverlay } from '@klinecharts/pro'

class MyCloudSyncProvider implements CloudSyncProvider {
  async upload(symbol: string, overlays: SerializedOverlay[]): Promise<void> {
    // 上传到您的后端服务
    await fetch(`https://your-api.com/overlays/${symbol}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overlays)
    })
  }

  async download(symbol: string): Promise<SerializedOverlay[]> {
    // 从您的后端服务下载
    const response = await fetch(`https://your-api.com/overlays/${symbol}`)
    return await response.json()
  }
}

// 使用云同步
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

### 手动触发云同步

```typescript
import { OverlayStorage } from '@klinecharts/pro'

// 创建存储实例
const storage = new OverlayStorage('AAPL', new MyCloudSyncProvider())

// 上传到云端
await storage.syncToCloud()

// 从云端下载并保存到本地
const overlays = await storage.syncFromCloud()
```

## 高级用法

### 直接操作 localStorage

```typescript
import {
  saveOverlaysToLocalStorage,
  loadOverlaysFromLocalStorage,
  clearOverlaysFromLocalStorage,
  SerializedOverlay
} from '@klinecharts/pro'

// 保存
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

// 加载
const loadedOverlays = loadOverlaysFromLocalStorage('AAPL')

// 清除
clearOverlaysFromLocalStorage('AAPL')
```

### 序列化/反序列化

```typescript
import {
  serializeOverlay,
  deserializeOverlay
} from '@klinecharts/pro'

// 从 KLineChart API 获取 overlay
const chart = chartPro.getApi()
const overlay = chart.getOverlayById('overlay_id')

// 序列化
const serialized = serializeOverlay(overlay)

// 反序列化为 OverlayCreate 对象
const overlayCreate = deserializeOverlay(serialized)

// 创建 overlay
chart.createOverlay(overlayCreate)
```

## 数据结构

### SerializedOverlay

```typescript
interface SerializedOverlay {
  id: string                    // 唯一标识
  groupId: string              // 分组 ID
  name: string                 // overlay 名称
  points: Array<{              // 点位数据
    timestamp?: number
    dataIndex?: number
    value?: number
  }>
  lock: boolean                // 是否锁定
  visible: boolean             // 是否可见
  mode: string                 // 模式 (normal, weak_magnet, strong_magnet)
  extendData?: any            // 扩展数据
  styles?: any                // 样式
}
```

### CloudSyncProvider

```typescript
interface CloudSyncProvider {
  // 上传到云端
  upload: (symbol: string, overlays: SerializedOverlay[]) => Promise<void>
  
  // 从云端下载
  download: (symbol: string) => Promise<SerializedOverlay[]>
}
```

## 存储键格式

数据存储在 localStorage 中，键格式为：

```
klinecharts-pro-overlays-{symbol.ticker}
```

例如：
- `klinecharts-pro-overlays-AAPL`
- `klinecharts-pro-overlays-BTCUSDT`

## 注意事项

1. **localStorage 限制**：浏览器 localStorage 通常有 5-10MB 的存储限制，请注意数据量
2. **Symbol 隔离**：不同 symbol 的画图数据是完全隔离的
3. **自动保存**：创建、修改、删除画图时会自动保存
4. **Symbol 切换**：切换 symbol 时会自动清除当前画图并加载新的
5. **云同步**：云同步需要您自己实现后端接口

## 完整示例

```typescript
import { KLineChartPro, CloudSyncProvider, SerializedOverlay } from '@klinecharts/pro'

// 实现云同步（可选）
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

// 创建图表实例
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

// 用户绘制图形后会自动保存
// 切换 symbol 时会自动加载对应的画图数据
chart.setSymbol({ ticker: 'GOOGL', name: 'Alphabet Inc.' })
```
