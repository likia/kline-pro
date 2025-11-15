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

import { registerOverlay } from 'klinecharts'

import overlays from './extension'

import DefaultDatafeed from './DefaultDatafeed'
import KLineChartPro from './KLineChartPro'

import { load } from './i18n'

import { Datafeed, SymbolInfo, Period, DatafeedSubscribeCallback, ChartProOptions, ChartPro } from './types'

import {
  OverlayStorage,
  serializeOverlay,
  deserializeOverlay,
  saveOverlaysToLocalStorage,
  loadOverlaysFromLocalStorage,
  clearOverlaysFromLocalStorage
} from './store'

import type { SerializedOverlay, CloudSyncProvider } from './store'

import './index.less'

overlays.forEach(o => { registerOverlay(o) })

export {
  DefaultDatafeed,
  KLineChartPro,
  load as loadLocales,
  OverlayStorage,
  serializeOverlay,
  deserializeOverlay,
  saveOverlaysToLocalStorage,
  loadOverlaysFromLocalStorage,
  clearOverlaysFromLocalStorage
}

export type {
  Datafeed, SymbolInfo, Period, DatafeedSubscribeCallback, ChartProOptions, ChartPro,
  SerializedOverlay, CloudSyncProvider
}
