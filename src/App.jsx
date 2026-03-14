import { useState, useCallback, useMemo, useEffect } from 'react'

// Optional: npm install use-sound
// import useSound from 'use-sound'
// import clickSfx from './sounds/click.mp3'
// import winSfx from './sounds/win.mp3'
// import loseSfx from './sounds/lose.mp3'

const HAND_CLOSED = 'closed'
const HAND_EMPTY = 'empty'
const HAND_RING = 'ring'

const ASSETS = {
  [HAND_CLOSED]: '/assets/hand_closed.png',
  [HAND_EMPTY]: '/assets/hand_empty.png',
  [HAND_RING]: '/assets/hand_ring.png',
}

function getRandomRingIndex() {
  return Math.floor(Math.random() * 10)
}

function createInitialHands(ringIndex) {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    state: HAND_CLOSED,
    hasRing: i === ringIndex,
  }))
}

function HandCard({ hand, onClick, disabled, isRevealing }) {
  const displayState =
    hand.state === HAND_CLOSED ? HAND_CLOSED : hand.hasRing ? HAND_RING : HAND_EMPTY
  const imgSrc = ASSETS[displayState]
  const canClick = !disabled && hand.state === HAND_CLOSED
  const number = hand.id + 1

  return (
    <button
      type="button"
      onClick={() => canClick && onClick(hand.id)}
      disabled={!canClick}
      className={`
        relative w-full aspect-[3/4] max-w-[140px] rounded-xl overflow-hidden
        transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
        ${canClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
        ${isRevealing ? 'animate-flip-in' : ''}
      `}
      aria-label={hand.state === HAND_CLOSED ? 'يد مقبوضة' : hand.hasRing ? 'يد فيها المحبس' : 'يد فارغة'}
    >
      <span className="absolute top-1 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-gray-800/90 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/50">
        {number}
      </span>
      <img
        src={imgSrc}
        alt=""
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
      />
    </button>
  )
}

function Overlay({ show, text, variant }) {
  if (!show) return null

  const isWin = variant === 'win'
  const bg = isWin ? 'from-emerald-600/95 to-teal-700/95' : 'from-rose-600/95 to-red-700/95'
  const border = isWin ? 'border-emerald-400' : 'border-rose-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`
          max-w-md w-full rounded-2xl border-2 ${border} bg-gradient-to-br ${bg}
          shadow-2xl text-center py-10 px-8 animate-flip-in
        `}
      >
        <p className="text-4xl md:text-5xl font-bold text-white">{text}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [ringIndex, setRingIndex] = useState(() => getRandomRingIndex())
  const [hands, setHands] = useState(() => createInitialHands(ringIndex))
  const [gameOver, setGameOver] = useState(null) // null | 'won' | 'lost'
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [revealingId, setRevealingId] = useState(null)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)

  useEffect(() => {
    if (gameOver !== 'won' && gameOver !== 'lost') return
    setOverlayVisible(true)
    const t = setTimeout(() => setOverlayVisible(false), 1000)
    return () => clearTimeout(t)
  }, [gameOver])

  const emptyOpenedCount = useMemo(
    () => hands.filter((h) => !h.hasRing && h.state === HAND_EMPTY).length,
    [hands]
  )
  const allEmptyRevealed = emptyOpenedCount === 9

  const handleHandClick = useCallback(
    (clickedId) => {
      const hand = hands[clickedId]
      if (hand.state !== HAND_CLOSED || gameOver) return

      setRevealingId(clickedId)

      if (hand.hasRing) {
        // Optional: playLose?.()
        setHands((prev) =>
          prev.map((h) => (h.id === clickedId ? { ...h, state: HAND_RING } : h))
        )
        setGameOver('lost')
        setLosses((c) => c + 1)
      } else {
        // Optional: playClick?.()
        const willBeNineEmpty = emptyOpenedCount === 8
        setHands((prev) =>
          prev.map((h) =>
            h.id === clickedId
              ? { ...h, state: HAND_EMPTY }
              : willBeNineEmpty && h.hasRing
                ? { ...h, state: HAND_RING }
                : h
          )
        )
        if (willBeNineEmpty) {
          // Optional: playWin?.()
          setGameOver('won')
          setWins((c) => c + 1)
        }
      }

      setTimeout(() => setRevealingId(null), 450)
    },
    [hands, gameOver, emptyOpenedCount]
  )

  const handleReset = useCallback(() => {
    const newRingIndex = getRandomRingIndex()
    setRingIndex(newRingIndex)
    setHands(createInitialHands(newRingIndex))
    setGameOver(null)
    setOverlayVisible(false)
    setRevealingId(null)
  }, [])

  // Auto-win when 9 empty hands are open (last hand is ring)
  const effectiveGameOver = useMemo(() => {
    if (gameOver) return gameOver
    if (allEmptyRevealed) return 'won'
    return null
  }, [gameOver, emptyOpenedCount])

  const showWinOverlay = effectiveGameOver === 'won' && overlayVisible
  const showLoseOverlay = effectiveGameOver === 'lost' && overlayVisible

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="py-4 px-4 border-b border-gray-700/50">
        <div className="flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">Wins:</span>
            <span className="text-2xl font-bold text-white">{wins}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-semibold">Losses:</span>
            <span className="text-2xl font-bold text-white">{losses}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <button
          type="button"
          onClick={handleReset}
          className="mb-6 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold transition-colors"
        >
          Reset Game / جولة جديدة
        </button>
        <div className="grid grid-cols-5 gap-3 md:gap-4 max-w-2xl">
          {hands.map((hand) => (
            <HandCard
              key={hand.id}
              hand={hand}
              onClick={handleHandClick}
              disabled={!!effectiveGameOver}
              isRevealing={revealingId === hand.id}
            />
          ))}
        </div>
      </main>

      <Overlay show={showWinOverlay} variant="win" text="لقد فزت" />
      <Overlay show={showLoseOverlay} variant="lost" text="لقد خسرت" />
    </div>
  )
}
