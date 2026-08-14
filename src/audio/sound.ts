/**
 * Web-Audio synthesised sound design — no external audio files.
 * Everything is generated on the fly, so nothing to download and
 * nothing that can autoplay before a user gesture.
 */

import type { SoundName } from './soundTypes'

class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private humOsc: OscillatorNode | null = null
  private humGain: GainNode | null = null
  private _enabled = false

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
      this.master.gain.value = 0.22
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  setEnabled(on: boolean): void {
    this._enabled = on
    if (on) {
      this.ensure()
      this.startHum()
    } else {
      this.stopHum()
    }
  }

  private startHum(): void {
    const ctx = this.ensure()
    if (!ctx || !this.master || this.humOsc) return
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 56
    g.gain.value = 0
    osc.connect(g)
    g.connect(this.master)
    osc.start()
    g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.4)
    this.humOsc = osc
    this.humGain = g
  }

  private stopHum(): void {
    if (!this.ctx || !this.humOsc || !this.humGain) return
    const now = this.ctx.currentTime
    this.humGain.gain.cancelScheduledValues(now)
    this.humGain.gain.linearRampToValueAtTime(0, now + 0.4)
    const osc = this.humOsc
    window.setTimeout(() => {
      try {
        osc.stop()
      } catch {
        /* already stopped */
      }
    }, 500)
    this.humOsc = null
    this.humGain = null
  }

  play(name: SoundName): void {
    if (!this._enabled) return
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    switch (name) {
      case 'key':
        return this.blip(ctx, 520 + Math.random() * 120, 0.02, 'sine', 0.05)
      case 'beep':
        return this.blip(ctx, 660, 0.05, 'sine', 0.07)
      case 'warn':
        return this.blip(ctx, 300, 0.12, 'triangle', 0.08)
      case 'glitch':
        return this.noiseBurst(ctx, 0.08, 0.05)
      case 'confirm':
        this.blip(ctx, 620, 0.09, 'sine', 0.09)
        window.setTimeout(() => this.blip(ctx, 940, 0.16, 'sine', 0.09), 110)
        return
      case 'whoosh':
        return this.sweep(ctx, 220, 620, 0.3, 'sine', 0.05)
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
