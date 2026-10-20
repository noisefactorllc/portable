import type { ShaderCraftLanguage } from './library/types.js';
export interface Token {
    kind: 'ident' | 'number' | 'punct' | 'directive';
    text: string;
    /** Offset of the first character in the source. */
    start: number;
    /** Offset just past the last character. */
    end: number;
    /** 1-based line and column of the first character. */
    line: number;
    column: number;
}
/** Tokens of a source, without comments. GLSL preprocessor lines become one `directive` token each. */
export declare function tokenize(source: string, language: ShaderCraftLanguage): Token[];
/** The source with every comment replaced by spaces (line breaks kept), so offsets and lines stay valid. */
export declare function maskComments(source: string, language: ShaderCraftLanguage): string;
export type NumericType = 'int' | 'uint' | 'float';
/** The type of a numeric literal: GLSL and WGSL spell them alike apart from suffixes. */
export declare function literalType(text: string): NumericType;
export declare function literalValue(text: string): number;
export interface Param {
    name: string;
    type: string;
    /** in, out, inout, or a WGSL attribute such as builtin or location. */
    qualifier?: string;
}
export interface Declarator {
    name: string;
    type?: string;
    /** Token range of the initializer, [first, end). */
    init?: [number, number];
}
export interface TopItem {
    kind: 'directive' | 'function' | 'prototype' | 'struct' | 'declaration';
    /** Character offsets: start of the item (attributes included) and just past its end. */
    start: number;
    end: number;
    /** Token range, [first, last] inclusive. */
    first: number;
    last: number;
    /** GLSL preprocessor conditional depth at the item. */
    depth: number;
    name?: string;
    /** Directive name (define, if, ifdef, endif, version, ...). */
    directive?: string;
    /** For #define: the macro body, and the parameters of a function-like macro. */
    macroBody?: string;
    macroParams?: string[];
    returnType?: string;
    params?: Param[];
    /** Token indices of a function body's braces. */
    bodyOpen?: number;
    bodyClose?: number;
    /** WGSL entry point stage. */
    stage?: string;
    /** GLSL: uniform, const, in, out, global, precision, layout. WGSL: const, var, override, alias, enable, ... */
    storage?: string;
    /** WGSL var address space (private, uniform, storage, workgroup, function). */
    addressSpace?: string;
    declarators?: Declarator[];
    /** Struct and interface-block members. */
    members?: Declarator[];
}
/** Splits the token range [first, end) at commas outside brackets. */
export declare function splitTopLevel(tokens: Token[], first: number, end: number): Array<[number, number]>;
/** The top-level items of a program, in source order. */
export declare function scanTopLevel(source: string, language: ShaderCraftLanguage, tokens?: Token[]): TopItem[];
export type Expr = {
    kind: 'number';
    tok: number;
    text: string;
    type: NumericType;
    value: number;
} | {
    kind: 'ident';
    tok: number;
    name: string;
} | {
    kind: 'call';
    tok: number;
    callee: string;
    args: Expr[];
} | {
    kind: 'member';
    tok: number;
    object: Expr;
    name: string;
} | {
    kind: 'index';
    tok: number;
    object: Expr;
    index: Expr;
} | {
    kind: 'unary';
    tok: number;
    op: string;
    arg: Expr;
    postfix: boolean;
} | {
    kind: 'binary';
    tok: number;
    op: string;
    left: Expr;
    right: Expr;
} | {
    kind: 'ternary';
    tok: number;
    cond: Expr;
    then: Expr;
    else: Expr;
} | {
    kind: 'assign';
    tok: number;
    op: string;
    target: Expr;
    value: Expr;
} | {
    kind: 'paren';
    tok: number;
    inner: Expr;
} | {
    kind: 'unknown';
    tok: number;
};
/** Walks every node of an expression tree, parents first. */
export declare function walkExpr(expr: Expr | undefined, visit: (e: Expr) => void): void;
/** Strips parentheses. */
export declare function unparen(expr: Expr): Expr;
/** Parses the expression in the token range [start, end). */
export declare function parseExpression(tokens: Token[], start: number, end: number, language: ShaderCraftLanguage): Expr;
export type Stmt = {
    kind: 'block';
    tok: number;
    body: Stmt[];
} | {
    kind: 'if';
    tok: number;
    cond: Expr;
    then: Stmt;
    else?: Stmt;
} | {
    kind: 'for';
    tok: number;
    init?: Stmt;
    cond?: Expr;
    update: Expr[];
    body: Stmt;
} | {
    kind: 'while';
    tok: number;
    cond: Expr;
    body: Stmt;
    doWhile: boolean;
} | {
    kind: 'loop';
    tok: number;
    body: Stmt;
} | {
    kind: 'switch';
    tok: number;
    selector: Expr;
    cases: Expr[];
    body: Stmt[];
} | {
    kind: 'decl';
    tok: number;
    declarators: Array<{
        name: string;
        type?: string;
        init?: Expr;
        tok: number;
    }>;
} | {
    kind: 'expr';
    tok: number;
    expr: Expr;
} | {
    kind: 'return';
    tok: number;
    value?: Expr;
} | {
    kind: 'breakIf';
    tok: number;
    cond: Expr;
} | {
    kind: 'other';
    tok: number;
};
/** Parses the statements of a function body whose braces are at token indices open and close. */
export declare function parseBody(tokens: Token[], open: number, close: number, language: ShaderCraftLanguage): Stmt[];
/** Parses the expression of a declarator's initializer token range. */
export declare function parseRange(tokens: Token[], range: [number, number], language: ShaderCraftLanguage): Expr;
/** Walks statements depth first, giving each statement its enclosing statements, innermost last. */
export declare function walkStmts(stmts: Stmt[], visit: (stmt: Stmt, parents: Stmt[]) => void, parents?: Stmt[]): void;
export declare function literalSmoothsteps(source: string, language?: ShaderCraftLanguage): Array<{
    call: string;
    ascending: boolean;
    offset: number;
}>;
//# sourceMappingURL=source.d.ts.map