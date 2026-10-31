import React from 'react';
import { AuthScreen } from './src/screens/AuthScreen';
import { CareerSetupScreen } from './src/screens/CareerSetupScreen';
import { CodeAuditTaskScreen } from './src/screens/CodeAuditTaskScreen';
import { EndOfDayJournalScreen } from './src/screens/EndOfDayJournalScreen';
import { MainWorldHudScreen } from './src/screens/MainWorldHudScreen';
import { ZombieOsDesktopScreen } from './src/screens/ZombieOsDesktopScreen';
import {
  ActiveScreenId,
  GameProvider,
  useGame,
} from './src/state/GameContext';

function GameRouter(): React.JSX.Element {
  const { activeScreen } = useGame();

  switch (activeScreen) {
    case 'auth_login':
      return <AuthScreen />;
    case 'career_setup':
      return <CareerSetupScreen />;
    case 'zombie_os':
      return <ZombieOsDesktopScreen />;
    case 'code_audit':
      return <CodeAuditTaskScreen />;
    case 'end_of_day_journal':
      return <EndOfDayJournalScreen />;
    case 'world_hud':
    default:
      return <MainWorldHudScreen />;
  }
}

export function App({
  initialScreen = 'auth_login',
}: {
  initialScreen?: ActiveScreenId;
}): React.JSX.Element {
  return (
    <GameProvider initialScreen={initialScreen}>
      <GameRouter />
    </GameProvider>
  );
}

export default App;
