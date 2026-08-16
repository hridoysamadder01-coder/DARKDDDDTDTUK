/**
 * Web-Audio synthesised sound design — no external audio files.
 * Everything is generated on the fly, so nothing to download and
 * nothing that can autoplay before a user gesture.
 */

import type { SoundName } from './soundTypes'

class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private _enabled = false

  // ambient bed
  private bedBus: GainNode | null = null
  private bedOscs: OscillatorNode[] = []
  private bedNoise: AudioBufferSourceNode | null = null
  private lfo: OscillatorNode | null = null
  private pingTimer = 0

  get enabled(): boolean {
    return this._enabled
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.32
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  setEnabled(on: boolean): void {
    this._enabled = on
    if (on) {
      this.ensure()
      this.startBed()
      this.schedulePing()
    } else {
      this.stopBed()
    }
  }

  /** A layered ambient bed: detuned drones + breathing LFO + air noise. */
  private startBed(): void {
    const ctx = this.ensure()
    if (!ctx || !this.master || this.bedBus) return
    const bus = ctx.createGain()
    bus.gain.value = 0
    bus.connect(this.master)

    const drones: Array<[number, OscillatorType, number]> = [
      [41, 'sine', 0.9],
      [55, 'sine', 0.7],
      [55.4, 'sine', 0.5], // detuned beat
      [82, 'triangle', 0.28],
    ]
    for (const [freq, type, vol] of drones) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      g.gain.value = vol
      osc.connect(g)
      g.connect(bus)
      osc.start()
      this.bedOscs.push(osc)
    }

    // filtered "air" noise
    const frames = Math.floor(ctx.sampleRate * 2)
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 260
    const ng = ctx.createGain()
    ng.gain.value = 0.05
    noise.connect(lp)
    lp.connect(ng)
    ng.connect(bus)
    noise.start()
    this.bedNoise = noise

    // slow breathing
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = 0.07
    lfoGain.gain.value = 0.018
    lfo.connect(lfoGain)
    lfoGain.connect(bus.gain)
    lfo.start()
    this.lfo = lfo

    bus.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.8)
    this.bedBus = bus
  }

  private stopBed(): void {
    window.clearTimeout(this.pingTimer)
    this.pingTimer = 0
    if (!this.ctx || !this.bedBus) return
    const now = this.ctx.currentTime
    this.bedBus.gain.cancelScheduledValues(now)
    this.bedBus.gain.linearRampToValueAtTime(0, now + 0.5)
    const oscs = [...this.bedOscs]
    const noise = this.bedNoise
    const lfo = this.lfo
    window.setTimeout(() => {
      for (const o of oscs) { try { o.stop() } catch { /* noop */ } }
      try { noise?.stop() } catch { /* noop */ }
      try { lfo?.stop() } catch { /* noop */ }
    }, 620)
    this.bedOscs = []
    this.bedNoise = null
    this.lfo = null
    this.bedBus = null
  }

  /** Soft periodic sonar ping while the bed is running. */
  private schedulePing(): void {
    window.clearTimeout(this.pingTimer)
    this.pingTimer = window.setTimeout(() => {
      if (!this._enabled) return
      const ctx = this.ensure()
      if (ctx && this.master) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = 660
        bp.Q.value = 6
        osc.type = 'sine'
        osc.frequency.setValueAtTime(700, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5)
        g.gain.value = 0.0001
        g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.04)
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1)
        osc.connect(bp)
        bp.connect(g)
        g.connect(this.master)
        osc.start()
        osc.stop(ctx.currentTime + 1.2)
      }
      this.schedulePing()
    }, 5000 + Math.random() * 5000)
  }

  play(name: SoundName): void {
    if (!this._enabled) return
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    switch (name) {
      case 'key':
        return this.blip(ctx, 620 + Math.random() * 240, 0.012, 'square', 0.09)
      case 'beep':
        return this.blip(ctx, 880, 0.09, 'square', 0.14)
      case 'warn':
        this.sweep(ctx, 340, 190, 0.26, 'sawtooth', 0.15)
        window.setTimeout(() => this.sweep(ctx, 300, 160, 0.24, 'sawtooth', 0.13), 190)
        return
      case 'glitch':
        return this.noiseBurst(ctx, 0.14, 0.18)
      case 'confirm':
        this.sweep(ctx, 440, 880, 0.18, 'triangle', 0.16)
        this.sweep(ctx, 110, 60, 0.32, 'sine', 0.16) // sub thump
        window.setTimeout(() => this.blip(ctx, 1180, 0.14, 'sine', 0.14), 140)
        return
      case 'whoosh':
        return this.sweep(ctx, 140, 900, 0.5, 'sine', 0.1)
      case 'hum':
        return
    }
  }

  private blip(
    ctx: AudioContext,
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
  ): void {
    if (!this.master) return
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.value = vol
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.connect(g)
    g.connect(this.master)
    osc.start()
    osc.stop(ctx.currentTime + dur + 0.02)
  }

  private sweep(
    ctx: AudioContext,
    from: number,
    to: number,
    dur: number,
    type: OscillatorType,
    vol: number,
  ): void {
    if (!this.master) return
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(from, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), ctx.currentTime + dur)
    g.gain.value = vol
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.connect(g)
    g.connect(this.master)
    osc.start()
    osc.stop(ctx.currentTime + dur + 0.02)
  }

  private noiseBurst(ctx: AudioContext, dur: number, vol: number): void {
    if (!this.master) return
    const frames = Math.floor(ctx.sampleRate * dur)
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const g = ctx.createGain()
    g.gain.value = vol
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 900
    src.connect(filter)
    filter.connect(g)
    g.connect(this.master)
    src.start()
  }
}

export const sound = new SoundEngine()
