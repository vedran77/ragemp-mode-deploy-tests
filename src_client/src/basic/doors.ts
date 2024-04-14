import { drawSprite } from 'utils/sprites';
import doorsList from 'data/doors.json';

const localPlayer = mp.players.local;

type DoorType = 'door' | 'ramp';
interface BaseDoor {
  id?: number;
  type?: DoorType;
  hash: number;
  name?: string;
  authorities?: string[];
  position: PositionEx;
  locked: boolean;
  distance?: number;
}

interface DoorDoor extends BaseDoor {
  type: 'door';
}

interface RampDoor extends BaseDoor {
  type: 'ramp';
  rotation?: PositionEx;
  openRotation?: PositionEx;
  object?: number;
}

type Door = DoorDoor | RampDoor;

class Doors {
  private items: Map<number, Door>;
  private doorTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.items = new Map();

    mp.events.subscribeToDefault({
      render: this.renderSprite.bind(this),
      doorChangeState: this.setLockedStatus.bind(this),
    });

    mp.keys.bind(0x45, true, this.toggle.bind(this));
  }

  async init() {
    await mp.events.callServer('Doors-GetState');

    doorsList.forEach((item) =>
      this.add({
        ...item,
        type: (item.type || 'door') as DoorType,
        hash:
          typeof item.hash === 'string' ? mp.game.joaat(item.hash) : item.hash,
        locked: item.locked,
      })
    );
  }

  setLockedStatus(hash: number, status: boolean) {
    const door = this.items.get(hash);

    if (door) this.add({ ...door, locked: status });
  }

  private add(door: Door) {
    switch (door.type) {
      case 'ramp':
        const normalRotation = new mp.Vector3(
          door.rotation.x,
          door.rotation.y,
          door.rotation.z
        );
        const openRotation = new mp.Vector3(
          door.openRotation.x,
          door.openRotation.y,
          door.openRotation.z
        );

        door.locked = door.locked ?? true;

        if (door.object) mp.objects.at(door.object).destroy();

        const object = mp.objects.new(
          door.hash,
          new mp.Vector3(door.position.x, door.position.y, door.position.z),
          {
            rotation: door.locked ? normalRotation : openRotation,
          }
        );

        door.object = object.id;
        break;

      case 'door':
      default:
        mp.game.object.doorControl(
          door.hash,
          door.position.x,
          door.position.y,
          door.position.z,
          door.locked,
          0.0,
          0.0,
          0
        );
        break;
    }

    this.items.set(door.id, door);
  }

  private toggle() {
    if (localPlayer.isTypingInTextChat) return;

    this.items.forEach((door) => {
      const distance = door.distance || 2.1;

      if (
        mp.game.gameplay.getDistanceBetweenCoords(
          door.position.x,
          door.position.y,
          door.position.z,
          localPlayer.position.x,
          localPlayer.position.y,
          localPlayer.position.z,
          true
        ) < distance &&
        (!door.authorities ||
          door.authorities?.length === 0 ||
          door.authorities?.includes(localPlayer.getVariable('faction')))
      ) {
        if (door.type === 'ramp') {
          mp.gui.chat.push(
            `!{95e800}[INFO]: !{ffffff}Otvorili ste rampu, zatvorice se automatski nakon 7 sekundi.`
          );

          mp.events.callRemote('Doors-Toggle', door.id, door.locked ?? true);

          if (!door.locked && this.doorTimeout) {
            clearTimeout(this.doorTimeout);
            this.doorTimeout = null;
          }

          if (door.locked ?? true) {
            this.doorTimeout = setTimeout(() => {
              mp.events.callRemote('Doors-Toggle', door.id, false);
              this.doorTimeout = null;
            }, 7000);
          }
          return;
        }

        mp.events.callRemote('Doors-Toggle', door.id, door.locked);
      }
    });
  }

  private renderSprite() {
    this.items.forEach((door) => {
      const distance = mp.game.gameplay.getDistanceBetweenCoords(
        door.position.x,
        door.position.y,
        door.position.z,
        localPlayer.position.x,
        localPlayer.position.y,
        localPlayer.position.z,
        true
      );

      if (distance <= 3) {
        const position = mp.game.graphics.world3dToScreen2d(
          door.position.x,
          door.position.y,
          door.position.z
        );

        if (!position) return;

        const scale = Math.max(0.1, 1 - distance / 3);
        const scaleSprite = 0.7 * scale;

        drawSprite(
          'Mpsafecracking',
          door.locked ? 'lock_closed' : 'lock_open',
          [scaleSprite, scaleSprite],
          0,
          [255, 255, 255, 255],
          position.x,
          position.y
        );
      }
    });
  }
}

const doors = new Doors();
doors.init();
