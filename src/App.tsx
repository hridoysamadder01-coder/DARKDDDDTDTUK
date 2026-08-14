import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PaymentChannel, Stage } from './types'
import { Background } from './components/background/Background'
import CRTOverlay from './components/background/CRTOverlay'
import SimulationBadge from './components/ui/SimulationBadge'
import SoundToggle from './components/ui/SoundToggle'
import BootSequence from './components/stages/BootSequence'
import Terminal from './components/stages/Terminal'
import AccessChain from './components/stages/AccessChain'
import PriceReveal from './components/stages/PriceReveal'
import PayScreen from './components/stages/PayScreen'
import FinalReveal from './components/stages/FinalReveal'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
}

export default function App() {
  const [stage, setStage] = useState<Stage>('boot')
  const [channel, setChannel] = useState<PaymentChannel>('binance')

  // Pause the heavy background canvases during full-screen cinematic stages
  // that already carry their own motion (keeps mobile framerate healthy).
  const heavyBgPaused = stage === 'accessChain' || stage === 'final'

  const goTerminal = useCallback(() => setStage('terminal'), [])
  const startTarget = useCallback(() => {
    window.scrollTo({ top: 0 })
    setStage('accessChain')
  }, [])
  const restart = useCallback(() => {
    window.scrollTo({ top: 0 })
    setStage('terminal')
  }, [])

  return (
    <>
      <Background paused={heavyBgPaused} />
      <CRTOverlay />

      {/* Persistent chrome */}
      <SoundToggle />
      {stage === 'boot' && (
        <button className="skip-btn" onClick={goTerminal}>
          SKIP ▸
        </button>
      )}

      <div className="stage-root">
        <AnimatePresence mode="wait">
          {stage === 'boot' && (
            <motion.div key="boot" {...fade}>
              <BootSequence onDone={goTerminal} />
            </motion.div>
          )}

          {stage === 'terminal' && (
            <motion.div key="terminal" {...fade}>
              <Terminal onTarget={startTarget} />
            </motion.div>
          )}

          {stage === 'accessChain' && (
            <motion.div key="chain" {...fade}>
              <AccessChain onDone={() => setStage('priceReveal')} />
            </motion.div>
          )}

          {stage === 'priceReveal' && (
            <motion.div key="price" {...fade}>
              <PriceReveal
                onSelect={(c) => {
                  setChannel(c)
                  setStage(c === 'binance' ? 'binance' : 'crypto')
                }}
              />
            </motion.div>
          )}

          {(stage === 'binance' || stage === 'crypto') && (
            <motion.div key={`pay-${channel}`} {...fade}>
              <PayScreen
                channel={channel}
                onBack={() => setStage('priceReveal')}
                onDone={() => setStage('final')}
              />
            </motion.div>
          )}

          {stage === 'final' && (
            <motion.div key="final" {...fade}>
              <FinalReveal onRestart={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SimulationBadge />
    </>
  )
}
