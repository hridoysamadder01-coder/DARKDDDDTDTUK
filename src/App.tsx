import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CryptoAsset, Engine, Stage } from './types'
import { targetEngine } from './data/engines'
import { Ambient } from './components/background/Ambient'
import SimulationBadge from './components/ui/SimulationBadge'
import Splash from './components/stages/Splash'
import Storefront from './components/stages/Storefront'
import Checkout from './components/stages/Checkout'
import Invoice from './components/stages/Invoice'
import Complete from './components/stages/Complete'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4 },
}

export default function App() {
  const [stage, setStage] = useState<Stage>('splash')
  const [engine, setEngine] = useState<Engine>(targetEngine)
  const [coin, setCoin] = useState<CryptoAsset | null>(null)

  const toCatalog = useCallback(() => {
    window.scrollTo({ top: 0 })
    setStage('catalog')
  }, [])

  const getAccess = useCallback((e: Engine) => {
    setEngine(e)
    window.scrollTo({ top: 0 })
    setStage('checkout')
  }, [])

  return (
    <>
      <Ambient />

      {stage === 'splash' && (
        <button className="skip-btn" onClick={toCatalog}>
          Skip intro
        </button>
      )}

      <div className="stage-root">
        <AnimatePresence mode="wait">
          {stage === 'splash' && (
            <motion.div key="splash" {...fade}>
              <Splash onDone={toCatalog} />
            </motion.div>
          )}

          {stage === 'catalog' && (
            <motion.div key="catalog" {...fade}>
              <Storefront onGetAccess={getAccess} />
            </motion.div>
          )}

          {stage === 'checkout' && (
            <motion.div key="checkout" {...fade}>
              <Checkout
                engine={engine}
                onBack={toCatalog}
                onSelect={(c) => {
                  setCoin(c)
                  window.scrollTo({ top: 0 })
                  setStage('invoice')
                }}
              />
            </motion.div>
          )}

          {stage === 'invoice' && coin && (
            <motion.div key="invoice" {...fade}>
              <Invoice
                engine={engine}
                coin={coin}
                onBack={() => setStage('checkout')}
                onDone={() => {
                  window.scrollTo({ top: 0 })
                  setStage('complete')
                }}
              />
            </motion.div>
          )}

          {stage === 'complete' && (
            <motion.div key="complete" {...fade}>
              <Complete engine={engine} onRestart={toCatalog} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SimulationBadge />
    </>
  )
}
