import { Chart, DeepPartial, KLineData, Overlay, OverlayCreate, Styles } from 'klinecharts';

export interface SerializedOverlay {
	id: string;
	groupId: string;
	name: string;
	points: Array<Partial<{
		timestamp?: number;
		dataIndex?: number;
		value?: number;
	}>>;
	lock: boolean;
	visible: boolean;
	mode: string;
	extendData?: any;
	styles?: any;
}
export interface CloudSyncProvider {
	/**
	 * Upload overlay data to cloud
	 * @param symbol Symbol ticker
	 * @param overlays Serialized overlay data
	 */
	upload: (symbol: string, overlays: SerializedOverlay[]) => Promise<void>;
	/**
	 * Download overlay data from cloud
	 * @param symbol Symbol ticker
	 * @returns Serialized overlay data
	 */
	download: (symbol: string) => Promise<SerializedOverlay[]>;
}
export declare function serializeOverlay(overlay: Overlay): SerializedOverlay;
export declare function deserializeOverlay(data: SerializedOverlay): OverlayCreate;
export declare function saveOverlaysToLocalStorage(symbol: string, overlays: SerializedOverlay[]): void;
export declare function loadOverlaysFromLocalStorage(symbol: string): SerializedOverlay[];
export declare function clearOverlaysFromLocalStorage(symbol: string): void;
export declare class OverlayStorage {
	private symbol;
	private cloudSyncProvider;
	constructor(symbol: string, cloudSyncProvider?: CloudSyncProvider);
	setSymbol(symbol: string): void;
	save(overlays: SerializedOverlay[]): void;
	load(): SerializedOverlay[];
	clear(): void;
	syncToCloud(): Promise<void>;
	syncFromCloud(): Promise<SerializedOverlay[]>;
}
export interface SymbolInfo {
	ticker: string;
	name?: string;
	shortName?: string;
	exchange?: string;
	market?: string;
	pricePrecision?: number;
	volumePrecision?: number;
	priceCurrency?: string;
	type?: string;
	logo?: string;
}
export interface Period {
	multiplier: number;
	timespan: string;
	text: string;
}
export type DatafeedSubscribeCallback = (data: KLineData) => void;
export interface Datafeed {
	searchSymbols(search?: string): Promise<SymbolInfo[]>;
	getHistoryKLineData(symbol: SymbolInfo, period: Period, from: number, to: number): Promise<KLineData[]>;
	subscribe(symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void;
	unsubscribe(symbol: SymbolInfo, period: Period): void;
}
export interface ChartProOptions {
	container: string | HTMLElement;
	styles?: DeepPartial<Styles>;
	watermark?: string | Node;
	theme?: string;
	locale?: string;
	drawingBarVisible?: boolean;
	symbol: SymbolInfo;
	period: Period;
	periods?: Period[];
	timezone?: string;
	mainIndicators?: string[];
	subIndicators?: string[];
	datafeed: Datafeed;
	overlayPersistence?: {
		enabled?: boolean;
		cloudSyncProvider?: CloudSyncProvider;
	};
}
export interface ChartPro {
	setTheme(theme: string): void;
	getTheme(): string;
	setStyles(styles: DeepPartial<Styles>): void;
	getStyles(): Styles;
	setLocale(locale: string): void;
	getLocale(): string;
	setTimezone(timezone: string): void;
	getTimezone(): string;
	setSymbol(symbol: SymbolInfo): void;
	getSymbol(): SymbolInfo;
	setPeriod(period: Period): void;
	getPeriod(): Period;
	getApi(): Chart;
}
export declare class DefaultDatafeed implements Datafeed {
	constructor(apiKey: string);
	private _apiKey;
	private _prevSymbolMarket?;
	private _ws?;
	searchSymbols(search?: string): Promise<SymbolInfo[]>;
	getHistoryKLineData(symbol: SymbolInfo, period: Period, from: number, to: number): Promise<KLineData[]>;
	subscribe(symbol: SymbolInfo, period: Period, callback: DatafeedSubscribeCallback): void;
	unsubscribe(symbol: SymbolInfo, period: Period): void;
}
export declare class KLineChartPro implements ChartPro {
	constructor(options: ChartProOptions);
	private _container;
	private _chartApi;
	setTheme(theme: string): void;
	getTheme(): string;
	setStyles(styles: DeepPartial<Styles>): void;
	getStyles(): Styles;
	setLocale(locale: string): void;
	getLocale(): string;
	setTimezone(timezone: string): void;
	getTimezone(): string;
	setSymbol(symbol: SymbolInfo): void;
	getSymbol(): SymbolInfo;
	setPeriod(period: Period): void;
	getPeriod(): Period;
	getApi(): Chart;
}
declare function load(key: string, ls: any): void;

export {
	load as loadLocales,
};

export as namespace klinechartspro;

export {};
