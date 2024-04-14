import React, { Component } from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';
import rpc from 'utils/rpc';
import { showNotification } from 'utils/notifications';
import vehiclesList from 'data/vehicles.json';

export type Vehicle = {
	id: number;
	model: string;
	govNumber: string;
};

type State = {
	vehicles: Vehicle[];
};

export default class Vehicles extends Component<{}, State> {
	readonly state: State = {
		vehicles: [],
	};

	componentDidMount() {
		rpc.callServer('Faction-GetVehicles').then((vehicles) => this.setState(() => ({ vehicles })));
	}

	async despawnVehicle(id: number) {
		const vehicles = await rpc.callServer('Factions-DespawnVehicle', id);
		this.setState({
			vehicles,
		});

		showNotification('info', 'Mehaničar ce uskoro doći po vozilo');
	}

	render() {
		const { vehicles } = this.state;

		return (
			<Page>
				<Navbar title="Vozila" />

				<List mediaList inset>
					{vehicles.map((vehicle) => (
						<ListItem
							key={vehicle.id}
							title={(vehiclesList as any)[vehicle.model] ?? vehicle.model}
							after={vehicle.govNumber}
							onClick={this.despawnVehicle.bind(this, vehicle.id)}
						/>
					))}
				</List>
			</Page>
		);
	}
}
