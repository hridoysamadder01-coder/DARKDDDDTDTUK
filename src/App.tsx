import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CryptoAsset, Engine, Stage } from './types'
import { config } from './config'
import { targetEngine } from './data/engines'
import { Background } from './components/background/Background'
import CRTOverlay from './components/background/CRTOverlay'
import ClickFX from './components/fx/ClickFX'
import ThreatOverlay from './components/fx/ThreatOverlay'
import SoundToggle from './components/ui/SoundToggle'
import OpsBoot from './components/stages/OpsBoot'
import OperatorScan from './components/stages/OperatorScan'
import WelcomeHail from './components/stages/WelcomeHail'
import Terminal from './components/stages/Terminal'
import AccessChain from './components/stages/AccessChain'
import PriceReveal from './components/stages/PriceReveal'
import CryptoSession from './components/stages/CryptoSession'
import FinalReveal from './components/stages/FinalReveal'
import CodeStream from './components/stages/CodeStream'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
}

export default function App() {
  const [stage, setStage] = useState<Stage>('opsBoot')
  const [engine, setEngine] = useState<Engine>(targetEngine)
  const [coin, setCoin] = useState<CryptoAsset | null>(null)
  const [welcomed, setWelcomed] = useState(false)

  // Pause the heavy background canvases during full-screen cinematic stages
  // that already carry their own motion (keeps mobile framerate healthy).
  const heavyBgPaused =
    stage === 'opsBoot' ||
    stage === 'accessChain' ||
    stage === 'final' ||
    stage === 'codestream'

  const goTerminal = useCallback(() => setStage('terminal'), [])
  const goCamera = useCallback(() => {
    window.scrollTo({ top: 0 })
    setStage('cameraVerify')
  }, [])
  const initiate = useCallback((e: Engine) => {
    setEngine(e)
    window.scrollTo({ top: 0 })
    setStage('accessChain')
  }, [])
  const restart = useCallback(() => {
    window.scrollTo({ top: 0 })
    setStage('terminal')
  }, [])

  // Ambient counter-intrusion alerts on the "exploration" stages.
  const threatActive =
    stage === 'terminal' ||
    stage === 'accessChain' ||
    stage === 'priceReveal' ||
    stage === 'cryptoSession'

  return (
    <>
      <Background paused={heavyBgPaused} />
      <CRTOverlay />
      <ClickFX />
      <ThreatOverlay active={threatActive} />

      {/* Persistent chrome (the ops-boot & code-stream screens own their top bars) */}
      {stage !== 'codestream' && stage !== 'opsBoot' && <SoundToggle />}
      {(stage === 'opsBoot' || stage === 'cameraVerify') && (
        <button className="skip-btn" onClick={stage === 'opsBoot' ? goCamera : goTerminal}>
          SKIP ▸
        </button>
      )}

      <div className="stage-root">
        <AnimatePresence mode="wait">
          {stage === 'opsBoot' && (
            <motion.div key="opsboot" {...fade}>
              <OpsBoot onDone={goCamera} />
            </motion.div>
          )}

          {stage === 'cameraVerify' && (
            <motion.div key="camera" {...fade}>
              <OperatorScan onDone={goTerminal} />
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
                onDone={() => {
                  window.scrollTo({ top: 0 })
                  setStage('payVerify')
                }}
              />
            </motion.div>
          )}

          {stage === 'payVerify' && (
            <motion.div key="payVerify" {...fade}>
              <OperatorScan
                kicker={config.payVerify.kicker}
                title={config.payVerify.title}
                subtitleEn={config.payVerify.subtitleEn}
                subtitleZh={config.payVerify.subtitleZh}
                verifiedTitle={config.payVerify.verifiedTitle}
                verifiedSubEn={config.payVerify.verifiedSubEn}
                verifiedSubZh={config.payVerify.verifiedSubZh}
                speakOnVerify={config.payVerify.speak}
                onDone={() => setStage('final')}
              />
            </motion.div>
          )}

          {stage === 'final' && (
            <motion.div key="final" {...fade}>
              <FinalReveal
                engine={engine}
                onRestart={restart}
                onWrite={() => {
                  window.scrollTo({ top: 0 })
                  setStage('codestream')
                }}
              />
            </motion.div>
          )}

          {stage === 'codestream' && (
            <motion.div key="codestream" {...fade}>
              <CodeStream onExit={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* One-time robotic voice hail on first terminal entry */}
      <AnimatePresence>
        {stage === 'terminal' && !welcomed && (
          <WelcomeHail key="hail" onDone={() => setWelcomed(true)} />
        )}
      </AnimatePresence>
    </>
  )
}
