import cashRegisters from 'data/cashRegisters.json';

mp.events.add('render', () => {
  const position = mp.players.local.position;
  const cashRegisterInArea = cashRegisters.find(
    (cashRegister) =>
      mp.game.gameplay.getDistanceBetweenCoords(
        position.x,
        position.y,
        position.z,
        cashRegister.position.x,
        cashRegister.position.y,
        cashRegister.position.z,
        true
      ) < 1
  );

  if (!cashRegisterInArea) return;

  mp.game.graphics.drawText(
    'Pretisni ~g~E~w~ da otvoriš kasu',
    [
      cashRegisterInArea.position.x,
      cashRegisterInArea.position.y,
      cashRegisterInArea.position.z,
    ],
    {
      font: 4,
      color: [255, 255, 255, 215],
      scale: [0.3, 0.3],
      outline: true,
      centre: true,
    }
  );
});
