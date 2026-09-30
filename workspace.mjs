// Versioned workspace envelope. Shader compilation/rendering is a separate gate:
// a valid envelope is not evidence that its composition or shaders can render.
const FORMAT = 'noisefactor-workspace';
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function require(condition, message) {
    if (!condition) throw new TypeError(message);
}

function record(value, label) {
    require(value !== null && typeof value === 'object' && !Array.isArray(value)
        && [Object.prototype, null].includes(Object.getPrototypeOf(value)), `${label} must be an object`);
}

function shape(value, fields, label) {
    record(value, label);
    require(Object.keys(value).every(key => fields.includes(key)), `${label} has an unsupported field`);
    require(fields.every(key => Object.hasOwn(value, key)), `${label} is missing a required field`);
}

function validId(value, label) {
    require(typeof value === 'string' && ID.test(value), `${label} must be a stable identifier`);
}

function fileMap(files, label) {
    record(files, label);
    for (const [path, file] of Object.entries(files)) {
        require(path.length > 0 && !/[\\:\u0000-\u001f\u007f]/.test(path)
            && path.split('/').every(part => part && !['.', '..', '__proto__', 'prototype', 'constructor'].includes(part)),
        `${label} has an unsafe path`);
        shape(file, ['encoding', 'data'], `${label}/${path}`);
        require(typeof file.data === 'string', `${label}/${path} data must be a string`);
        require(file.encoding === 'utf8' || file.encoding === 'base64', `${label}/${path} encoding must be utf8 or base64`);
        if (file.encoding === 'base64') {
            require(BASE64.test(file.data) && btoa(atob(file.data)) === file.data, `${label}/${path} has invalid base64`);
        }
    }
}

function functionName(files) {
    const file = Object.hasOwn(files, 'definition.json') ? files['definition.json'] : undefined;
    require(file?.encoding === 'utf8', 'definition.json must be a UTF-8 file');
    let definition;
    try { definition = JSON.parse(file.data); } catch { throw new TypeError('definition.json must contain valid JSON'); }
    record(definition, 'definition.json');
    const func = definition.func ?? definition.name;
    require(typeof func === 'string' && IDENTIFIER.test(func), 'definition.json needs a valid function identity');
    require(definition.namespace === undefined || definition.namespace === 'user', 'portable effects register in the user namespace');
    require(Object.entries(files).some(([path, file]) =>
        /^(glsl\/.+\.glsl|wgsl\/.+\.wgsl)$/.test(path) && file.encoding === 'utf8' && file.data.trim()),
    'effect needs at least one nonempty UTF-8 shader file');
    return func;
}

function validate(workspace) {
    shape(workspace, ['format', 'version', 'id', 'revision', 'effects', 'assets', 'composition'], 'workspace');
    require(workspace.format === FORMAT && workspace.version === 1, 'unsupported workspace format or version');
    validId(workspace.id, 'workspace.id');
    require(Number.isSafeInteger(workspace.revision) && workspace.revision >= 0, 'workspace.revision must be a nonnegative safe integer');
    require(Array.isArray(workspace.effects), 'workspace.effects must be an array');
    const ids = new Set();
    const functions = new Set();
    for (const effect of workspace.effects) {
        shape(effect, ['id', 'files'], 'effect');
        validId(effect.id, 'effect.id');
        require(!ids.has(effect.id), 'duplicate effect.id');
        ids.add(effect.id);
        fileMap(effect.files, `effect ${effect.id}`);
        const func = functionName(effect.files);
        require(!functions.has(func), 'duplicate effect function identity');
        functions.add(func);
    }
    fileMap(workspace.assets, 'assets');
    shape(workspace.composition, ['dsl', 'effectIds'], 'composition');
    require(typeof workspace.composition.dsl === 'string' && workspace.composition.dsl.trim(), 'composition.dsl must be nonempty');
    const dependencies = workspace.composition.effectIds;
    require(Array.isArray(dependencies) && dependencies.every(id => ids.has(id))
        && new Set(dependencies).size === dependencies.length, 'composition.effectIds must reference unique existing effects');
    return workspace;
}

export function parseWorkspace(json) {
    require(typeof json === 'string', 'workspace input must be JSON text');
    return validate(JSON.parse(json));
}

export function serializeWorkspace(workspace) {
    return JSON.stringify(validate(workspace), null, 2) + '\n';
}

export function importSingleEffect(files, { workspaceId, effectId, dsl } = {}) {
    record(files, 'legacy files');
    const encoded = Object.fromEntries(Object.entries(files).map(([path, data]) => {
        require(typeof data === 'string', 'legacy files must contain UTF-8 strings');
        return [path, { encoding: 'utf8', data }];
    }));
    fileMap(encoded, 'legacy files');
    functionName(encoded);
    const definition = JSON.parse(encoded['definition.json'].data);
    return validate({
        format: FORMAT, version: 1, id: workspaceId, revision: 0,
        effects: [{ id: effectId, files: encoded }], assets: {},
        composition: { dsl: dsl ?? definition.defaultProgram, effectIds: [effectId] },
    });
}

function findEffect(workspace, id) {
    const effect = workspace.effects.find(effect => effect.id === id);
    require(effect, `unknown effect: ${id}`);
    return effect;
}

export function exportEffect(workspace, effectId) {
    validate(workspace);
    return structuredClone(findEffect(workspace, effectId).files);
}

// Produces a detached candidate. Consumers compile/render it before committing
// it to history, then compare the current revision again after asynchronous work.
export function replaceEffect(workspace, effectId, files, { expectedRevision } = {}) {
    validate(workspace);
    require(workspace.revision === expectedRevision, 'workspace revision conflict');
    const effect = findEffect(workspace, effectId);
    fileMap(files, `effect ${effectId}`);
    require(functionName(effect.files) === functionName(files), 'replacement changes function identity');
    const candidate = structuredClone(workspace);
    findEffect(candidate, effectId).files = structuredClone(files);
    candidate.revision += 1;
    return validate(candidate);
}
