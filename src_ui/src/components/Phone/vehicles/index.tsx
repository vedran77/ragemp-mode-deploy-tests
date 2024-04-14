import React, { Component } from 'react';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import Title from '../partials/title';
import List from './list';
import Vehicle from './vehicle';

export type VehicleData = {
  id: string;
  model: string;
  govNumber: string;
  spawned: boolean;
};

type State = {
  vehicles: VehicleData[];
  selectedVehicle?: VehicleData;
};

export default class Vehicles extends Component<{}, State> {
  readonly state: State = {
    vehicles: [],
  };

  componentDidMount() {
    rpc
      .callServer('Vehicle-GetPlayerList')
      .then((items) => this.setState(() => ({ vehicles: items })));
  }

  selectVehicle(vehicle?: VehicleData) {
    this.setState(() => ({ selectedVehicle: vehicle }));
  }

  async getVehiclePosition() {
    const { selectedVehicle } = this.state;

    if (!selectedVehicle) return;

    try {
      await rpc.callServer('Vehicle-MarkPosition', selectedVehicle.id);

      showNotification('info', 'Lokacija vozila je označena na mapi');
    } catch (err: any) {
      showNotification('error', 'Prvo morate pozvati vozilo.');
    }
  }

  async spawnVehicle(atParking: boolean) {
    const { selectedVehicle } = this.state;
    if (!selectedVehicle) return;

    try {
      const position = await rpc.callClient(
        'Vehicle-GetSpawnCoords',
        selectedVehicle.model
      );
      await rpc.callServer('Vehicle-DeliverForPlayer', [
        selectedVehicle.id,
        position,
        atParking,
      ]);

      !atParking &&
        showNotification('info', 'Vaše vozilo će uskoro biti dostavljeno.');
    } catch (err: any) {
      if (err.msg) showNotification('error', err.msg);
    }
  }

  async despawnVehicle() {
    const { selectedVehicle } = this.state;

    if (!selectedVehicle) return;

    try {
      await rpc.callServer('Vehicle-DespawnItem', selectedVehicle.id);

      showNotification('info', 'Vozilo ce uskoro biti vraćeno u garažu.');
    } catch (err: any) {
      if (err.msg) showNotification('error', err.msg);
    }
  }

  render() {
    const { vehicles, selectedVehicle } = this.state;

    return (
      <div className='vehicles'>
        {selectedVehicle ? (
          <Vehicle
            data={selectedVehicle}
            getPosition={this.getVehiclePosition.bind(this)}
            spawn={this.spawnVehicle.bind(this)}
            despawn={this.despawnVehicle.bind(this)}
            close={() => this.selectVehicle()}
          />
        ) : (
          <div className='vehicles_main'>
            <Title className='vehicles_main-title'>Vaša vozila</Title>

            <List
              items={vehicles}
              selectItem={this.selectVehicle.bind(this)}
            />
          </div>
        )}
      </div>
    );
  }
}
