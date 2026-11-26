// Tiny shared store: is the intro playing, and has the HUD been revealed?
import { useSyncExternalStore } from 'react'
import { shouldPlayIntro, reducedMotion } from './clock.js'
const willIntro = shouldPlayIntro() && !reducedMotion
let state = { playing: willIntro, hud: !willIntro }
const subs = new Set()
export const setIntro = (patch) => { state = { ...state, ...patch }; subs.forEach((f) => f()) }
export const useIntro = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state)
