mp.events.subscribe({
  'Supermarket-ShowMenu': (prices: { [name: string]: number }) => {
    mp.browsers.showPage('supermarket', { prices }, true, true);
    mp.game.graphics.transitionToBlurred(200);
  },
});
