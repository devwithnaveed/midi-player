# 🎵 MIDI Player

A web-based MIDI player built with React and TypeScript that plays classic game tunes using a JavaScript synthesizer. Features real-time note visualization, multi-track playback, and seek functionality.

## 🔗 Live Demo (https://midi-player-ten.vercel.app/1)

![React](https://img.shields.io/badge/React-18.1.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.6.3-3178C6?logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-Private-red)

## ✨ Features

- **Multi-Track Playback**: Supports multiple instrument tracks playing simultaneously
- **Real-Time Visualization**: Visual representation of notes being played with color-coded display
- **Seek Functionality**: Skip forward or backward to any timestamp in the song
- **Classic Game Tunes**: Includes popular tracks from retro games:
  - Tetris
  - The Legend of Zelda
  - Super Mario Bros.
  - Super Mario Bros. 3
  - Megaman 3
  - Duck Tales (The Moon)
  - Little Nemo (Mushroom Forest)
  - MEGALOVANIA
  - Yoshi's Island
  - And more!

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Audio**: JZZ with TinySynth for MIDI synthesis
- **Build Tool**: CRACO (Create React App Configuration Override)
- **Syntax Highlighting**: Highlight.js for code display

## 📦 Installation

### Prerequisites

- Node.js 16 or higher ([Download](https://nodejs.org))
- npm (comes with Node.js)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/midi-player.git
cd midi-player

# Install dependencies
npm install

# Start the development server
npm start
```

The application will open automatically at [http://localhost:3000](http://localhost:3000).

## 🎮 Usage

1. **Select a Tune**: Choose from the dropdown menu of available songs
2. **Play**: Click the "Play" button to start playback
3. **Visualize**: Watch the real-time note visualization as the music plays
4. **Control**: Use the player controls to stop or seek through the track

## 📁 Project Structure

```
midi-player/
├── public/
│   ├── assets/          # Static assets (favicons)
│   └── tunes/           # JSON music files
├── src/
│   ├── assignment/
│   │   ├── player.ts        # Main player logic
│   │   └── playerInterface.ts
│   ├── synthesizer/
│   │   ├── Channel.ts       # Audio channel management
│   │   ├── Recorder.tsx     # Note recording
│   │   └── Synthesizer.tsx  # JZZ synthesizer wrapper
│   ├── visualization/
│   │   ├── colors.ts        # Note color mapping
│   │   ├── NoteVisualization.tsx
│   │   ├── PlayerModal.tsx
│   │   ├── ScoreVisualization.tsx
│   │   ├── TimerVisualization.tsx
│   │   └── TrackVisualization.tsx
│   ├── panes/               # UI instruction panels
│   ├── App.tsx
│   ├── types.ts             # TypeScript interfaces
│   └── util.ts              # Utility functions
├── scripts/
│   └── midiToJson.ts        # MIDI to JSON converter
└── typings/                 # Custom type definitions
```

## 🎼 How It Works

### Player Architecture

The player uses a event-based system where notes are converted into start/stop events:

```typescript
interface NoteEvent {
  time: number;
  type: 'start' | 'stop';
  note: Note;
  trackId: number;
  channel: Channel;
}
```

### Key Functions

- **`play()`**: Starts playback by iterating through sorted note events
- **`getTime()`**: Returns current playback position in milliseconds
- **`skipToTimestamp()`**: Seeks to a specific time, stopping current notes and resuming active ones

### Timing System

Uses a custom timer system (`buildTimer()` and `delayAsync()`) for accurate timing, as browser's native timing APIs are not precise enough for musical playback.

## 🔧 Available Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm start`       | Start development server          |
| `npm run build`   | Build for production              |
| `npm run convert` | Convert MIDI files to JSON format |
| `npm run archive` | Create submission zip file        |

## 📝 Adding New Tunes

1. Place your MIDI file in the `scripts/` directory
2. Run the converter:
   ```bash
   npm run convert
   ```
3. Move the generated JSON file to `public/tunes/`
4. Add the tune to the selection list in `src/panes/InstructionsPlayer.tsx`

## 🎹 Music Data Format

Songs are stored as JSON files with the following structure:

```typescript
interface Note {
  name: string; // Note name (e.g., "C4", "A#5")
  time: number; // Start time in milliseconds
  velocity: number; // Note velocity (volume)
  duration: number; // Duration in milliseconds
}

interface Track {
  instrumentName: string;
  notes: Note[];
}

type Score = Track[];
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [JZZ](https://github.com/nicoulaj/jzz) - MIDI library for JavaScript
- [JZZ-Synth-Tiny](https://github.com/nicoulaj/jzz-synth-tiny) - Tiny Web Audio synthesizer
- Classic game composers for the amazing music
