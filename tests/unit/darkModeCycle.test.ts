import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/store/gameStore';

describe('Dark Mode Return Cycle Requirement 14', () => {
  beforeEach(() => {
    useGameStore.setState({
      theme: 'light',
      screen: 'trolley',
      currentRoundId: 'trolley',
      currentScore: 100,
    });
  });

  it('cycles from light to blank dark mode and back to light preserving all game state', () => {
    // 1. Initial Light Mode
    expect(useGameStore.getState().theme).toBe('light');
    expect(useGameStore.getState().screen).toBe('trolley');
    expect(useGameStore.getState().currentScore).toBe(100);

    // 2. Click Dark Mode button (toggleTheme) -> activates dark mode blank gag
    useGameStore.getState().toggleTheme();
    expect(useGameStore.getState().theme).toBe('dark');
    // Ensure all state is completely preserved
    expect(useGameStore.getState().screen).toBe('trolley');
    expect(useGameStore.getState().currentScore).toBe(100);

    // 3. Click the invisible restore target in same top-right spot or press Escape -> restores light mode
    useGameStore.getState().toggleTheme();
    expect(useGameStore.getState().theme).toBe('light');
    // State remains intact
    expect(useGameStore.getState().screen).toBe('trolley');
    expect(useGameStore.getState().currentScore).toBe(100);
  });
});
