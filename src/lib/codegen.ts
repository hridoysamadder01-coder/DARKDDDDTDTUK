/**
 * Benign, fictional "engine source" generator for the cinematic build-writer.
 * Produces plausible-looking (but harmless, non-functional) code + build logs
 * so the WRITE BUILD screen can stream code endlessly. Nothing here is real,
 * runnable, or dangerous.
 */

const HEX = '0123456789ABCDEF'
export const hx = (n: number): string => {
  let s = ''
  for (let i = 0; i < n; i++) s += HEX[Math.floor(Math.random() * 16)]
  return s
}
const pick = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)]
const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))

export interface BuildFile {
  name: string
  lines: string[]
}

const MODULES = [
  'vision', 'runtime', 'merge', 'pipeline', 'tensor', 'bridge', 'quantize',
  'scheduler', 'allocator', 'decoder', 'kernel', 'graph', 'device', 'signature',
]
const TYPES = ['Tensor', 'CoreGraph', 'ModelRef', 'VisionCore', 'LayerMap', 'DeviceCtx', 'Buffer', 'StreamHandle']
const FN = ['fuseLayers', 'allocateGraph', 'bindKernel', 'quantizeWeights', 'mergeStack', 'sealRuntime', 'mapDevice', 'flushCache', 'linkModule', 'attestSignature']

const tsFile = (): string[] => {
  const out: string[] = []
  out.push(`import { ${pick(TYPES)}, ${pick(TYPES)} } from '@core/${pick(MODULES)}'`)
  out.push(`import { ${pick(FN)}, ${pick(FN)} } from '@core/runtime'`)
  out.push('')
  out.push(`// ${pick(['cross-model vision merge', 'native on-device runtime', 'low-latency pipeline', 'unified vision stack'])}`)
  out.push(`const CORE_SIGNATURE = 0x${hx(8)}`)
  out.push(`const LAYER_MASK = 0x${hx(6)}`)
  out.push('')
  const fn = pick(FN)
  out.push(`export async function ${fn}(model: ModelRef): Promise<${pick(TYPES)}> {`)
  out.push(`  const graph = await allocateGraph(model.signature)`)
  out.push(`  graph.reserve(${ri(8, 512)} /* ${pick(MODULES)} */)`)
  out.push(`  for (const layer of model.layers) {`)
  out.push(`    const w = quantizeWeights(layer.weights, 0x${hx(4)})`)
  out.push(`    graph.bind(layer.id, w, { device: '${pick(['android', 'ios', 'universal'])}' })`)
  if (Math.random() > 0.5) out.push(`    // fold ${pick(MODULES)} into ${pick(MODULES)}`)
  out.push(`  }`)
  out.push(`  return graph.seal(CORE_SIGNATURE)`)
  out.push(`}`)
  out.push('')
  for (let i = 0; i < ri(4, 9); i++) {
    const r = Math.random()
    if (r < 0.25) out.push(`export const ${pick(MODULES)}_${hx(3)} = { rate: ${ri(1, 240)}, mask: 0x${hx(4)} }`)
    else if (r < 0.5) out.push(`  await ${pick(FN)}(ctx, 0x${hx(6)})`)
    else if (r < 0.7) out.push(`// ${pick(['seal', 'link', 'merge', 'optimise'])} ${pick(MODULES)} :: ${hx(4)}`)
    else out.push(`  graph.emit('${pick(MODULES)}', 0x${hx(8)})`)
  }
  return out
}

const cFile = (): string[] => {
  const out: string[] = []
  out.push(`#include <core/${pick(MODULES)}.h>`)
  out.push(`#define CORE_SIM_LAYER 0x${hx(6)}`)
  out.push(`#define VISION_MASK    0x${hx(6)}`)
  out.push('')
  out.push(`static core_graph_t *${pick(FN)}(model_ref_t *m) {`)
  out.push(`  core_graph_t *g = alloc_graph(m->sig);`)
  out.push(`  for (size_t i = 0; i < m->n_layers; ++i) {`)
  out.push(`    tensor_t *t = quantize(&m->layers[i], 0x${hx(4)});`)
  out.push(`    graph_bind(g, i, t);`)
  out.push(`  }`)
  out.push(`  return graph_seal(g, CORE_SIM_LAYER);`)
  out.push(`}`)
  return out
}

const logLines = (): string[] => {
  const out: string[] = []
  const n = ri(3, 6)
  for (let i = 0; i < n; i++) {
    const r = Math.random()
    if (r < 0.4) out.push(`[ok]   linked ${pick(MODULES)}.core :: 0x${hx(6)}`)
    else if (r < 0.7) out.push(`[link] ${pick(MODULES)} -> ${pick(MODULES)} :: ${ri(2, 96)}ms`)
    else if (r < 0.85) out.push(`[warn] retrying ${pick(MODULES)} node :: 0x${hx(4)}`)
    else out.push(`[data] 0x${hx(8)} ${hx(8)} ${hx(8)} ${hx(8)}`)
  }
  return out
}

const pyFile = (): string[] => {
  const out: string[] = []
  out.push(`import core.${pick(MODULES)} as ${pick(MODULES)}`)
  out.push(`from core.${pick(MODULES)} import ${pick(FN)}, ${pick(FN)}`)
  out.push('')
  out.push(`CORE_SIGNATURE = 0x${hx(8)}`)
  out.push(`LAYER_MASK = 0x${hx(6)}`)
  out.push('')
  out.push(`async def ${pick(FN)}(model: ModelRef) -> Tensor:`)
  out.push(`    graph = await allocate_graph(model.signature)`)
  out.push(`    for layer in model.layers:`)
  out.push(`        w = quantize_weights(layer.weights, 0x${hx(4)})`)
  out.push(`        graph.bind(layer.id, w, device="${pick(['android', 'ios', 'universal'])}")`)
  out.push(`    return graph.seal(CORE_SIGNATURE)`)
  out.push('')
  out.push(`# ${pick(['cross-model merge', 'native runtime', 'unified vision stack'])}`)
  for (let i = 0; i < ri(3, 6); i++) {
    const r = Math.random()
    if (r < 0.4) out.push(`${pick(MODULES)}_${hx(3)} = {"rate": ${ri(1, 240)}, "mask": 0x${hx(4)}}`)
    else if (r < 0.7) out.push(`    graph.emit("${pick(MODULES)}", 0x${hx(8)})`)
    else out.push(`# seal ${pick(MODULES)} :: ${hx(4)}`)
  }
  return out
}

const rsFile = (): string[] => {
  const out: string[] = []
  out.push(`use core::${pick(MODULES)}::{${pick(TYPES)}, ${pick(TYPES)}};`)
  out.push(`use core::runtime::${pick(FN)};`)
  out.push('')
  out.push(`const CORE_SIGNATURE: u64 = 0x${hx(8)};`)
  out.push('')
  out.push(`pub fn ${pick(FN)}(model: &ModelRef) -> ${pick(TYPES)} {`)
  out.push(`    let mut graph = allocate_graph(model.sig);`)
  out.push(`    for layer in model.layers.iter() {`)
  out.push(`        let w = quantize(&layer.weights, 0x${hx(4)});`)
  out.push(`        graph.bind(layer.id, w);`)
  out.push(`    }`)
  out.push(`    graph.seal(CORE_SIGNATURE)`)
  out.push(`}`)
  return out
}

const goFile = (): string[] => {
  const out: string[] = []
  out.push(`package ${pick(MODULES)}`)
  out.push('')
  out.push(`import "core/${pick(MODULES)}"`)
  out.push('')
  out.push(`const CoreSignature = 0x${hx(8)}`)
  out.push('')
  out.push(`func ${pick(FN)}(m *ModelRef) *${pick(TYPES)} {`)
  out.push(`    g := allocGraph(m.Sig)`)
  out.push(`    for _, layer := range m.Layers {`)
  out.push(`        w := quantize(layer.Weights, 0x${hx(4)})`)
  out.push(`        g.Bind(layer.ID, w)`)
  out.push(`    }`)
  out.push(`    return g.Seal(CoreSignature)`)
  out.push(`}`)
  return out
}

const FILES = [
  { name: 'core/vision.pipeline.ts', gen: tsFile },
  { name: 'engine/merge.crossmodel.ts', gen: tsFile },
  { name: 'runtime/native.bridge.cpp', gen: cFile },
  { name: 'core/tensor.ops.c', gen: cFile },
  { name: 'core/vision.pipeline.py', gen: pyFile },
  { name: 'engine/merge.crossmodel.rs', gen: rsFile },
  { name: 'runtime/native.bridge.go', gen: goFile },
  { name: 'device/android.runtime.kt', gen: tsFile },
  { name: 'device/ios.metal.swift', gen: tsFile },
  { name: 'build/link.manifest', gen: logLines },
]

/** Produce the Nth build file (cycles, fresh randomness each time). */
export function makeBuildFile(index: number): BuildFile {
  const f = FILES[index % FILES.length]
  // stack a couple of generator passes so each "screen" is dense
  const lines = [...f.gen(), '', ...(Math.random() > 0.5 ? logLines() : f.gen())]
  return { name: f.name, lines }
}

export const totalBuildFiles = FILES.length
