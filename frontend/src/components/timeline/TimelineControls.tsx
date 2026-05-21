import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { useEffect } from 'react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

const PLAYBACK_INTERVAL_MS = 800;

export function TimelineControls() {
  const currentEventIndex = useWorkspaceStore((state) => state.currentEventIndex);
  const eventCount = useWorkspaceStore((state) => state.traceResult?.events.length ?? 0);
  const goToNextTimelineEvent = useWorkspaceStore((state) => state.goToNextTimelineEvent);
  const goToPreviousTimelineEvent = useWorkspaceStore((state) => state.goToPreviousTimelineEvent);
  const isTimelinePlaying = useWorkspaceStore((state) => state.isTimelinePlaying);
  const pauseTimeline = useWorkspaceStore((state) => state.pauseTimeline);
  const playTimeline = useWorkspaceStore((state) => state.playTimeline);
  const resetTimeline = useWorkspaceStore((state) => state.resetTimeline);
  const hasEvents = eventCount > 0;
  const isAtFirstEvent = !hasEvents || currentEventIndex === 0;
  const isAtLastEvent = !hasEvents || currentEventIndex >= eventCount - 1;

  useEffect(() => {
    if (!isTimelinePlaying) {
      return;
    }

    const playbackTimer = window.setInterval(goToNextTimelineEvent, PLAYBACK_INTERVAL_MS);

    return () => window.clearInterval(playbackTimer);
  }, [goToNextTimelineEvent, isTimelinePlaying]);

  return (
    <div className="timeline-controls" aria-label="Runtime timeline controls">
      <button type="button" onClick={goToPreviousTimelineEvent} disabled={isAtFirstEvent}>
        <SkipBack size={16} aria-hidden="true" />
        <span>Previous</span>
      </button>
      {isTimelinePlaying ? (
        <button type="button" onClick={pauseTimeline} disabled={!hasEvents}>
          <Pause size={16} aria-hidden="true" />
          <span>Pause</span>
        </button>
      ) : (
        <button type="button" onClick={playTimeline} disabled={isAtLastEvent}>
          <Play size={16} aria-hidden="true" />
          <span>Play</span>
        </button>
      )}
      <button type="button" onClick={goToNextTimelineEvent} disabled={isAtLastEvent}>
        <SkipForward size={16} aria-hidden="true" />
        <span>Next</span>
      </button>
      <button type="button" onClick={resetTimeline} disabled={!hasEvents || currentEventIndex === 0}>
        <RotateCcw size={16} aria-hidden="true" />
        <span>Reset</span>
      </button>
      <span className="timeline-controls__position">
        {hasEvents ? `${currentEventIndex + 1} / ${eventCount}` : '0 / 0'}
      </span>
    </div>
  );
}
