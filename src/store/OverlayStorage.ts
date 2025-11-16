/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Overlay, OverlayCreate, Nullable } from 'klinecharts'

export interface SerializedOverlay {
  id: string
  groupId: string
  name: string
  points: Array<Partial<{ timestamp?: number, dataIndex?: number, value?: number }>>
  lock: boolean
  visible: boolean
  mode: string
  extendData?: any
  styles?: any
}

export interface CloudSyncProvider {
  /**
   * Upload overlay data to cloud
   * @param symbol Symbol ticker
   * @param overlays Serialized overlay data
   */
  upload: (symbol: string, overlays: SerializedOverlay[]) => Promise<void>

  /**
   * Download overlay data from cloud
   * @param symbol Symbol ticker
   * @returns Serialized overlay data
   */
  download: (symbol: string) => Promise<SerializedOverlay[]>
}

const STORAGE_PREFIX = 'klinecharts-pro-overlays'

function getStorageKey (symbol: string): string {
  return `${STORAGE_PREFIX}-${symbol}`
}

export function serializeOverlay (overlay: Overlay): SerializedOverlay {
  return {
    id: overlay.id,
    groupId: overlay.groupId,
    name: overlay.name,
    points: overlay.points.map(p => {
      // Use spread operator to preserve all point properties
      // This ensures timestamp is always captured when available
      return { ...p }
    }),
    lock: overlay.lock,
    visible: overlay.visible,
    mode: overlay.mode,
    extendData: overlay.extendData,
    styles: overlay.styles
  }
}

export function deserializeOverlay (data: SerializedOverlay): OverlayCreate {
  return {
    id: data.id,
    groupId: data.groupId,
    name: data.name,
    points: data.points,
    lock: data.lock,
    visible: data.visible,
    mode: data.mode as any,
    extendData: data.extendData,
    styles: data.styles
  }
}

export function saveOverlaysToLocalStorage (symbol: string, overlays: SerializedOverlay[]): void {
  try {
    const key = getStorageKey(symbol)
    localStorage.setItem(key, JSON.stringify(overlays))
  } catch (e) {
    console.error('Failed to save overlays to localStorage:', e)
  }
}

export function loadOverlaysFromLocalStorage (symbol: string): SerializedOverlay[] {
  try {
    const key = getStorageKey(symbol)
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load overlays from localStorage:', e)
  }
  return []
}

export function clearOverlaysFromLocalStorage (symbol: string): void {
  try {
    const key = getStorageKey(symbol)
    localStorage.removeItem(key)
  } catch (e) {
    console.error('Failed to clear overlays from localStorage:', e)
  }
}

export class OverlayStorage {
  private symbol: string
  private cloudSyncProvider: Nullable<CloudSyncProvider>

  constructor (symbol: string, cloudSyncProvider?: CloudSyncProvider) {
    this.symbol = symbol
    this.cloudSyncProvider = cloudSyncProvider ?? null
  }

  setSymbol (symbol: string): void {
    this.symbol = symbol
  }

  save (overlays: SerializedOverlay[]): void {
    saveOverlaysToLocalStorage(this.symbol, overlays)
  }

  load (): SerializedOverlay[] {
    return loadOverlaysFromLocalStorage(this.symbol)
  }

  clear (): void {
    clearOverlaysFromLocalStorage(this.symbol)
  }

  async syncToCloud (): Promise<void> {
    if (this.cloudSyncProvider) {
      const overlays = this.load()
      await this.cloudSyncProvider.upload(this.symbol, overlays)
    }
  }

  async syncFromCloud (): Promise<SerializedOverlay[]> {
    if (this.cloudSyncProvider) {
      const overlays = await this.cloudSyncProvider.download(this.symbol)
      this.save(overlays)
      return overlays
    }
    return []
  }
}
