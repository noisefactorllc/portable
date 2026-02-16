import { Page } from 'playwright';

type Backend = 'webgl2' | 'webgpu';

interface ViewerGlobals {
    canvasRenderer: string;
    renderingPipeline: string;
    currentBackend: string;
    currentEffect: string;
    setPaused: string;
    setPausedTime: string;
    frameCount: string;
}
declare const DEFAULT_GLOBALS: ViewerGlobals;
declare function globalsFromPrefix(prefix: string): ViewerGlobals;
interface BrowserSessionOptions {
    backend: Backend;
    headless?: boolean;
    viewerPort?: number;
    viewerRoot?: string;
    viewerPath?: string;
    effectsDir?: string;
    globals?: ViewerGlobals;
}
interface ImageMetrics {
    mean_rgb: [number, number, number];
    mean_alpha: number;
    std_rgb: [number, number, number];
    luma_variance: number;
    unique_sampled_colors: number;
    is_all_zero: boolean;
    is_all_transparent: boolean;
    is_essentially_blank: boolean;
    is_monochrome: boolean;
}
interface CompileResult {
    status: 'ok' | 'error';
    backend: string;
    passes: Array<{
        id: string;
        status: 'ok' | 'error';
        errors?: string[];
    }>;
    message: string;
    console_errors?: string[];
}
interface RenderResult {
    status: 'ok' | 'error';
    backend: string;
    frame?: {
        image_uri?: string;
        width: number;
        height: number;
    };
    metrics?: ImageMetrics;
    console_errors?: string[];
}
interface BenchmarkResult {
    status: 'ok' | 'error';
    backend: string;
    achieved_fps: number;
    meets_target: boolean;
    stats: {
        frame_count: number;
        avg_frame_time_ms: number;
        jitter_ms: number;
        min_frame_time_ms: number;
        max_frame_time_ms: number;
    };
    console_errors?: string[];
}
interface ParityResult {
    status: 'ok' | 'error' | 'mismatch';
    maxDiff: number;
    meanDiff: number;
    mismatchCount: number;
    mismatchPercent: number;
    resolution: [number, number];
    details: string;
    console_errors?: string[];
}

interface ConsoleEntry {
    type: string;
    text: string;
}
declare class BrowserSession {
    private options;
    private viewerPath;
    private browser;
    private context;
    page: Page | null;
    globals: ViewerGlobals;
    private baseUrl;
    private consoleMessages;
    private _isSetup;
    constructor(opts: BrowserSessionOptions);
    setup(): Promise<void>;
    teardown(): Promise<void>;
    setBackend(backend: Backend): Promise<void>;
    clearConsoleMessages(): void;
    getConsoleMessages(): ConsoleEntry[];
    runWithConsoleCapture<T>(fn: () => Promise<T>): Promise<T & {
        console_errors?: string[];
    }>;
    get backend(): Backend;
    selectEffect(effectId: string): Promise<void>;
    getEffectGlobals(): Promise<Record<string, any>>;
    resetUniformsToDefaults(): Promise<void>;
}

export { BrowserSession as B, type CompileResult as C, DEFAULT_GLOBALS as D, type ImageMetrics as I, type ParityResult as P, type RenderResult as R, type ViewerGlobals as V, type BenchmarkResult as a, type BrowserSessionOptions as b, globalsFromPrefix as g };
