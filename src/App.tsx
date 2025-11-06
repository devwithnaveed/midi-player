import {useMemo} from 'react';
import './App.css';
import {Panes} from './Panes';
import {InstructionsPlayer} from './panes/InstructionsPlayer';

function App() {
  const slides = useMemo(
    () => [
      <InstructionsPlayer />
    ],
    []
  );

  return (
    <div className="app">
      <Panes slides={slides} />
    </div>
  );
}

export default App;
