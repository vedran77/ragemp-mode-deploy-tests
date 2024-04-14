import { ClientError } from 'utils/errors';
import points from 'helpers/points';
import hud from 'helpers/hud';

abstract class MaterialsLoading {
  public point: Point;

  constructor(position: PositionEx, radius = 3) {
    this.createPoint(position, radius);
  }

  togglePoint(visible: boolean) {
    this.point.visible = visible;
  }

  stopLoading() {
    this.point.destroy();
  }

  protected abstract checkCanBeLoaded(player: Player): Promise<Error>;

  protected abstract loadIteration(player: Player): Promise<Error>;

  private createPoint(position: PositionEx, radius: number) {
    this.point = points.create(
      position,
      radius,
      {
        onKeyPress: this.interactOnPoint.bind(this),
      },
      { color: [24, 132, 219, 100] }
    );
  }

  private interactOnPoint(player: Player) {
    this.checkCanBeLoaded(player)
      .then(() => this.startLoading(player))
      .catch((err) => {
        if (err instanceof ClientError) {
          hud.showNotification(player, 'error', err.message);
        }
      });
  }

  private async loadPartOfMaterials(player: Player) {
    this.loadIteration(player).catch((err) => {
      if (err instanceof ClientError) {
        hud.showNotification(player, 'error', err.message);
      }
    });
  }

  private startLoading(player: Player) {
    this.loadPartOfMaterials(player);
  }
}

export default MaterialsLoading;
