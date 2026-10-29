import { useState, useCallback } from 'react'
import { PIPELINE_STAGES } from '../components/ai/ThinkingPipeline.jsx'

/**
 * Drives the shared "click Analyze → pipeline → AI Core reacts →
 * result appears" flow used by every AI tool page.
 */
export function useAnalysisRun(fetchResult) {
  const [running, setRunning] = useState(false)
  const [stageIndex, setStageIndex] = useState(-1)
  const [result, setResult] = useState(null)
  const [coreState, setCoreState] = useState('ready')
  const [error, setError] = useState('')

  const run = useCallback(async (...args) => {
    setRunning(true)
    setResult(null)
    setError('')
    setStageIndex(0)
    setCoreState('analyzing')
    try {
      for (let i = 0; i < PIPELINE_STAGES.length; i++) {
        setStageIndex(i)
        if (i === 2) setCoreState('retrieving')
        if (i === 4) setCoreState('generating')
        await new Promise((r) => setTimeout(r, 180))
      }
      const data = await fetchResult(...args)
      setResult(data)
      setStageIndex(PIPELINE_STAGES.length)
      setCoreState('complete')
      return data
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The request failed unexpectedly.')
      setCoreState('ready')
      return null
    } finally {
      setRunning(false)
    }
  }, [fetchResult])

  const reset = useCallback(() => {
    setRunning(false)
    setStageIndex(-1)
    setResult(null)
    setError('')
    setCoreState('ready')
  }, [])

  return { running, stageIndex, result, coreState, error, run, reset }
}
