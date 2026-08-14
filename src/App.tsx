import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CryptoAsset, Engine, Stage } from './types'
import { targetEngine } from './data/engines'
import { Background } from './components/background/Background'
import CRTOverlay from './components/background/CRTOverlay'
import SimulationBadge from './components/ui/SimulationBadge'
import SoundToggle from './components/ui/SoundToggle'
import BootSequence from './components/stages/BootSequence'
import Terminal from './components/stages/Terminal'
import AccessChain from './components/stages/AccessChain'
import PriceReveal from './components/stages/PriceReveal'
import CryptoSession from './components/stages/CryptoSession'
import FinalReveal from './components/stages/FinalReveal'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
}

export default function App() {
  const [stage, setStage] = useState<Stage>('boot')
  const [engine, setEngine] = useState<Engine>(targetEngine)
  const [coin, setCoin] = useState<CryptoAsset | null>(null)

  // Pause the heavy background canvases during full-screen cinematic stages
  // that already carry their own motion (keeps mobile framerate healthy).
  const heavyBgPaused = stage === 'accessChain' || stage === 'final'

  const goTerminal = useCallback(() => setStage('terminal'), [])
  const initiate = useCallback((e: Engine) => {
    setEngine(e)
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
              <Terminal onInitiate={initiate} />
            </motion.div>
          )}

          {stage === 'accessChain' && (
            <motion.div key="chain" {...fade}>
              <AccessChain engine={engine} onDone={() => setStage('priceReveal')} />
            </motion.div>
          )}

          {stage === 'priceReveal' && (
            <motion.div key="price" {...fade}>
              <PriceReveal
                engine={engine}
                onSelect={(c) => {
                  setCoin(c)
                  setStage('cryptoSession')
                }}
              />
            </motion.div>
          )}

          {stage === 'cryptoSession' && coin && (
            <motion.div key="crypto" {...fade}>
              <CryptoSession
                engine={engine}
                coin={coin}
                onBack={() => setStage('priceReveal')}
                onDone={() => setStage('final')}
              />
            </motion.div>
          )}

          {stage === 'final' && (
            <motion.div key="final" {...fade}>
              <FinalReveal engine={engine} onRestart={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SimulationBadge />
    </>
  )
}
