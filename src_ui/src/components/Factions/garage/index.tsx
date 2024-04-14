import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { showNotification } from 'utils/notifications';
import rpc from 'utils/rpc';
import OutlineButton from 'components/Common/outline-button';
import GradientButton from 'components/Common/gradient-button';
import PrimaryTitle from 'components/Common/primary-title';

type Props = {} & RouteComponentProps;
type State = {
	selectedVehicle?: string;
	vehicles: {
		name: string;
		model: string;
		plate: string;
	}[];
	search: string;
};

export default class FactionGarage extends Component<Props, State> {
	readonly state: State = {
		vehicles: [],
		search: '',
	};

	componentDidMount() {
		this.setState(() => this.props.location.state);
	}

	selectVehicle(model: string) {
		this.setState(() => ({ selectedVehicle: model }));
	}

	async spawnVehicle() {
		const { selectedVehicle } = this.state;

		if (!selectedVehicle) return;

		try {
			await rpc.callServer('Factions-SpawnVehicle', selectedVehicle);
			showNotification('success', 'Vozilo je dostavljeno.');

			this.setState({
				selectedVehicle: undefined,
				vehicles: this.state.vehicles.filter((vehicle) => vehicle.model !== selectedVehicle),
			});
		} catch (err: any) {
			if (err.msg) showNotification('error', err.msg);
		}
	}

	render() {
		const { selectedVehicle, vehicles, search } = this.state;

		return (
			<div className="faction-garage">
				<div className="faction-garage_bg">
					<PrimaryTitle className="faction-garage_bg-title">Garaža</PrimaryTitle>
				</div>

				<div className="faction-garage_container">
					<input
						type="text"
						placeholder="Pretraži vozila"
						onChange={(e) =>
							this.setState({
								search: e.target.value,
							})
						}
					/>

					<table>
						<thead>
							<tr>
								<th>Rb</th>
								<th>Model</th>
								<th>Registarska oznaka</th>
							</tr>
						</thead>
					</table>
					<div className="table-scroll">
						<table>
							<tbody>
								{vehicles
									.filter((item) => item.name.toLowerCase().includes(search))
									.map((vehicle, index) => (
										<tr
											key={index}
											className={`${selectedVehicle === vehicle.name ? 'selected' : ''}`}
											onClick={() => this.selectVehicle(vehicle.name)}
										>
											<td>{index + 1}</td>
											<td>{vehicle.model}</td>
											<td>{vehicle.plate}</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>

					<div className="faction-garage_footer">
						<OutlineButton isClose>Zatvori</OutlineButton>
						<GradientButton onClick={this.spawnVehicle.bind(this)}>Dostavi</GradientButton>
					</div>
				</div>
			</div>
		);
	}
}
