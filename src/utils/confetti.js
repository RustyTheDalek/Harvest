/**
 * Confetti effects for celebrating good scores
 * Uses canvas-confetti library from CDN
 */

let confetti = null

// Lazy load confetti from CDN
async function getConfetti() {
  if (!confetti) {
    // Try to load from npm module first, fallback to CDN
    try {
      const confettiModule = await import('canvas-confetti')
      confetti = confettiModule.default
    } catch (e) {
      // Fallback to CDN
      return new Promise((resolve) => {
        if (window.confetti) {
          confetti = window.confetti
          resolve(confetti)
          return
        }
        
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js'
        script.onload = () => {
          confetti = window.confetti
          resolve(confetti)
        }
        script.onerror = () => {
          console.warn('Failed to load confetti library')
          // Return a no-op function if loading fails
          confetti = () => {}
          resolve(confetti)
        }
        document.head.appendChild(script)
      })
    }
  }
  return confetti
}

/**
 * Trigger confetti for bonus die (1 or 5)
 */
export async function triggerBonusDieConfetti() {
  const conf = await getConfetti()
  conf({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']
  })
}

/**
 * Trigger confetti for any triple
 */
export async function triggerTripleConfetti() {
  const conf = await getConfetti()
  conf({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
  })
}

/**
 * Trigger special confetti for triple 6
 */
export async function triggerTripleSixConfetti() {
  const conf = await getConfetti()
  
  // Multiple bursts for extra celebration
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)
    
    conf({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    })
    conf({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    })
  }, 250)
  
  // Also do a big burst
  conf({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFE66D']
  })
}

/**
 * Check if dice are a triple
 */
export function isTriple(dice) {
  if (!dice || dice.length !== 3) return false
  return dice[0] === dice[1] && dice[1] === dice[2]
}

/**
 * Check if dice are triple 6
 */
export function isTripleSix(dice) {
  return isTriple(dice) && dice[0] === 6
}

