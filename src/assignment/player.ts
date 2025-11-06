import { delayAsync, buildTimer } from '../util';
import { Synthesizer } from '../synthesizer/Synthesizer';
import { Track, Note } from '../types';
import { PlayerInterface } from './playerInterface';
import { Channel } from '../synthesizer/Channel';

const START = 'start' as const;
const STOP = 'stop' as const;

interface NoteEvent {
  time: number;
  type: 'start' | 'stop';
  note: Note;
  trackId: number;
  channel: Channel;
}

interface ActiveNote {
  channel: Channel;
  note: Note;
}

const sortByTime = (a: NoteEvent, b: NoteEvent) => {
  if (a.time !== b.time) return a.time - b.time;

  // Important: When two events share the same timestamp, process STOP before START.
  // Because each track uses a single monophonic Channel, playing a new note before
  // stopping the previous one causes an overlap error and stops playback early.
  // Example: B4 starts at time=0 and stops at time=5, while E5 starts at time=5.
  // If START(E5 at time=5) runs before STOP(B4 at time=5), the channel still has B4 active,
  // causing a conflict. Processing STOP first prevents this issue.
  if (a.type === STOP && b.type === START) return -1;
  if (a.type === START && b.type === STOP) return 1;
  return 0;
};

const stopAllNotes = (
  notes: Map<number, ActiveNote>
): void => {
  if (!notes || notes.size === 0) return;

  notes.forEach(({ channel }) => {
    if (!channel?.stopNote) return;
    channel.stopNote();
  });

  notes.clear();
};

const getFirstEventIndexAtOrAfter= (time: number, events: NoteEvent[]): number =>{
  let start = 0;
  let end = events.length;
  while (start < end) {
    const mid = Math.floor((start + end) / 2)
    if (events[mid].time < time)
      start = mid + 1;
    else
      end = mid;
  }
  return start;
}


export function player(synthesizer: Synthesizer, tracks: ReadonlyArray<Track>): PlayerInterface {

  let isPlaying = false;
  let isStopped = false;
  let timer: (() => number) | null = null;
  let playerSpeed = 2;

  let currentNotes = new Map<number, ActiveNote>();
  let stoppedAtMs: number | null = null;

  let timeBaseMs = 0;
  let eventIndex = 0;


  const channels = tracks.map((track) => ({
    channel: synthesizer.getChannel(track.instrumentName),
  }));

  const events :NoteEvent[] = tracks.flatMap((track, trackId) =>
    track.notes.flatMap((note) => {
      const channel = channels[trackId].channel;

      return [
        {
          note,
          trackId,
          channel,
          time: note.time,
          type: START,
        },
        {
          note,
          trackId,
          channel,
          time: note.time + note.duration,
          type: STOP,
        },
      ];
    })
  );
  // Used this to avoid mutating the original array
  const sortedEvents = [...events].sort(sortByTime);


  //Task One: should return an object containing a play function that starts playing the given tracks
  const play = async (): Promise<void> => {
    if (isPlaying) return;


    isPlaying = true;
    isStopped = false;
    stoppedAtMs = null;
    timer = buildTimer();
    currentNotes.clear();
    eventIndex = getFirstEventIndexAtOrAfter(timeBaseMs, sortedEvents);

    try {
      while (!isStopped && eventIndex < sortedEvents.length) {

        const nowMs = timeBaseMs + timer() ;
        const event = sortedEvents[eventIndex];
        const { note, channel, trackId } = event;

        if (nowMs < event.time) {
          const normalDelay = event.time - nowMs ;
          await delayAsync(normalDelay / playerSpeed);
          continue;
        }

        if (event.type === START) {
          const alive = channel.playNote(note.name, note.velocity);
          if (!alive) {
            isStopped = true;
            if (timer) stoppedAtMs = timeBaseMs + timer();
            break;
          }
          currentNotes.set(trackId, { channel, note });
        } else if (currentNotes.has(trackId)) {
          channel.stopNote();
          currentNotes.delete(trackId);
        }
        eventIndex++;
      }
    } catch (error) {
      console.error("Playback error:", error);
    } finally {
      stopAllNotes(currentNotes);
      if (stoppedAtMs === null && timer) stoppedAtMs = timeBaseMs + timer();
      timer = null;
      isPlaying = false;
    }
  }

  // Task Two: should provide a getTime() function that returns the current song play time
  const getTime = (): number => {
    if (stoppedAtMs !== null) return stoppedAtMs;

    if (!timer) return timeBaseMs / playerSpeed;

    if (channels.some(({channel}) => !channel.isPlaying)) {
      stoppedAtMs = timeBaseMs + timer();
      return stoppedAtMs;
    }

    return (timeBaseMs + timer() / playerSpeed);
  }

  // Task Three: implement skipToTimestamp() to stop all currently playing notes and start playback from a specific timestamp
  // enabling rewind and fast-forward functionality
  const skipToTimestamp = (timestamp: number): void => {
    if (!isPlaying) return;

    stopAllNotes(currentNotes);

    timeBaseMs = timestamp;
    stoppedAtMs = null;
    timer = buildTimer();

    eventIndex = getFirstEventIndexAtOrAfter(timestamp, sortedEvents);

    const now = timeBaseMs;
    const activeNotesPerTrack = new Map<number,ActiveNote>();

    for (let i = 0; i < eventIndex; i++) {
      const event = sortedEvents[i];

      if (event.type !== START) continue;

      const noteEndTime = event.time + event.note.duration;

      if (noteEndTime > now) {
        activeNotesPerTrack.set(event.trackId, { channel: event.channel, note: event.note });
      }
    }

    for (const [trackId, { channel, note }] of activeNotesPerTrack) {
      channel.playNote(note.name, note.velocity);
      currentNotes.set(trackId, { channel, note });
    }
  };


  return {
    play,
    getTime,
    skipToTimestamp
  };
}

// Play funct,
//