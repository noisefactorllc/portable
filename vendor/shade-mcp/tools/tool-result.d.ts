export type ToolResult = {
    content: [{
        type: 'text';
        text: string;
    }, ...Array<{
        type: 'image';
        data: string;
        mimeType: string;
    }>];
    isError?: true;
};
/**
 * The common domain outcome every tool result carries in `outcome`.
 *
 * - `ok`: the check ran and passed, or the query returned its answer.
 * - `fail`: the check ran and its verdict is negative — a parity `mismatch`,
 *   a `passthrough` filter, `divergent` algorithms, `meets_target: false`.
 * - `warning`: the check ran and reported findings to review (structure
 *   issues, branching opportunities).
 * - `skipped`: nothing was testable.
 * - `error`: the call could not produce a verdict.
 *
 * Verb-specific fields (`status`, `mismatchPercent`, `meets_target`, …) stay
 * as they are; `outcome` is the one field a client can gate on without
 * knowing each verb.
 */
export type Outcome = 'ok' | 'fail' | 'warning' | 'skipped' | 'error';
export declare function classifyOutcome(entry: unknown): Outcome;
/**
 * Wraps a tool payload as MCP content in the shared result envelope.
 *
 * Every text payload is JSON. A single result gains a top-level `outcome`.
 * A batch (an array payload) becomes `{ outcome, summary, results }`: each
 * entry gains its own `outcome`, `summary` counts the entries per outcome, and
 * the batch outcome is `error` when every entry is an `error`, `fail` when any
 * entry is a `fail` or an `error`, `warning` when any is a `warning`,
 * `skipped` when every entry is `skipped`, and `ok` otherwise.
 *
 * `isError` marks a call that failed as a whole: a single `error` result, or
 * a batch in which every entry is an `error`. A negative verdict (`fail`) is
 * a successful call and is reported through `outcome`, not `isError`.
 */
export declare function toolResult(payload: unknown, images?: Array<{
    data: string;
    mimeType: string;
}>): ToolResult;
/**
 * Routes every tool result on `server` through the envelope, so a client can
 * parse every result text as JSON with an `outcome`:
 *
 * - errors thrown before a handler reaches its own per-effect try block (for
 *   example an unresolvable effect selector);
 * - calls the MCP SDK rejects before any handler runs: an argument that fails
 *   the tool's input schema, or an unknown tool.
 *
 * Without this the SDK turns both into bare-text errors. Apply it before
 * registering any tool: the SDK installs its `tools/call` handler on the
 * first registration, and that is where the SDK's own errors are wrapped.
 * This module does not import the SDK, because the vendored harness bundles
 * it (scripts/check-dist-externals.mjs).
 */
export declare function guardToolErrors<S extends {
    tool: (...args: any[]) => any;
}>(server: S): S;
//# sourceMappingURL=tool-result.d.ts.map