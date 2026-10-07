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
 * Routes every tool registered on `server` through the envelope, including
 * errors thrown before a handler reaches its own per-effect try block (for
 * example an unresolvable effect selector). Without this the MCP SDK turns
 * such a throw into a bare-text error a client cannot parse as JSON.
 */
export declare function guardToolErrors<S extends {
    tool: (...args: any[]) => any;
}>(server: S): S;
//# sourceMappingURL=tool-result.d.ts.map