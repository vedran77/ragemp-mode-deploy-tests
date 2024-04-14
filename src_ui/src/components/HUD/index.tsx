import React, { Component } from 'react';
import { connect } from 'react-redux';
import rpc from 'utils/rpc';
import { StoreState } from 'store';
import PlayerCash from 'components/Player/cash';
import TargetMenu from 'components/Target';
import Online from './online';
import Speedometer from './speedometer';
import Interact from './interact';
import Call from './call';
import Binds from './binds';
import Offer from './offer';
import Level from './level';
import Capture from './capture';
import images from 'utils/images';
import KeyBinds from 'data/keybinds.json';
import { Date } from './date';
import { DeathLog } from './death-log';

type Props = {} & ReturnType<typeof mapStateToProps>;
type State = {
	binds: {
		[name: string]: string;
	};
	location: {
		street: string;
		zone: string;
		greenZone: boolean;
	};
	position: {
		bottom: number;
		left: number;
		status: number;
	};
};

class HUD extends Component<Props, State> {
	readonly state: State = {
		binds: {},
		location: {
			street: 'Plaza',
			zone: 'Los Santos',
			greenZone: false,
		},
		position: {
			bottom: 2,
			left: 10,
			status: 1,
		},
	};

	componentDidMount() {
		rpc.callClient('HUD-GetBinds').then((binds) => this.setState(() => ({ binds })));

		rpc.register('HUD-MapResize', (data) => {
			this.setState((prev) => ({
				...prev,
				position: {
					left: data.status * data.rightX * 100,
					bottom: data.status * (1 - data.bottomY) * 100,
					status: data.status || 1,
				},
			}));
		});

		this.getDistToMinimap();

		rpc.register('HUD-SetLocation', (location) => {
			this.setState((prev) => ({
				...prev,
				location,
			}));
		});
		this.getCurrentLocation();
	}

	async getCurrentLocation() {
		const location = await rpc.callClient('getPlayerLocation');

		this.setState((prev) => ({
			...prev,
			location,
		}));
	}

	componentWillUnmount(): void {
		rpc.unregister('HUD-MapResize');
		rpc.unregister('HUD-SetLocation');
	}

	async getDistToMinimap() {
		const data = await rpc.callClient('HUD-GetMinimapAnchor');

		this.setState((prev) => ({
			...prev,
			position: {
				left: data.rightX * 100,
				bottom: (1 - data.bottomY) * 100,
				status: data?.status || 1,
			},
		}));
	}

	render() {
		const { position, location } = this.state;
		const { greenZone, street, zone } = location;
		const { app, hud, player, phone } = this.props;

		return (
			<div className="ares_hud" style={{ display: hud.visible ? 'block' : 'none' }}>
				{position.status <= 1 && <Binds items={KeyBinds} />}
				<Online
					playerDbId={player.dbId}
					playerId={player.id}
					count={app.online}
					date={app.date}
					cash={player.money.cash}
					bank={player.money.bank}
				/>
				<Level />
				<Interact />
				<Offer />

				<div
					className="hud_minimap"
					style={{
						left: `calc(${position.left}% + 2%)`,
						bottom: `calc(${position.bottom}% + 2.5px)`,
					}}
				>
					{greenZone && <GreenZoneField />}
					<div className="ares_hud_player_stats">
						<AresBottomField image="hud_location.svg" label={zone} value={street} />
						<AresBottomField image="hud_water.svg" label="Hidratacija" value={player.satiety + '%'} />
						<AresBottomField image="hud_burger.svg" label="Glad" value={player.satiety + '%'} />
					</div>
					{phone.call?.type === 'incoming' && <Call info={phone.call} />}
				</div>

				{/* <div className="hud_container"> */}
				{position.status <= 1 && <Date value={app.date} />}
				{/* </div> */}
				<Speedometer />

				<TargetMenu />
				<PlayerCash />

				{hud.deathLog?.length > 0 && <DeathLog logs={hud.deathLog} />}

				{/* {player.bonus > 0 && <Bonus time={player.bonus} />} */}
				{hud.showCapture && hud.capture && <Capture {...hud.capture} />}
			</div>
		);
	}
}

const mapStateToProps = (state: StoreState) => ({
	app: state.app,
	hud: state.hud,
	player: state.player,
	phone: state.phone,
});

const GreenZoneField = () => {
	return (
		<div className="green_zone_field">
			<img className="green_zone_field_icon" src={images.getImage('hud_shield.svg')} />
			<p>Safe Zone</p>
		</div>
	);
};

interface AresBottomField {
	image: string;
	label: string;
	value: string | number;
}

const AresBottomField = ({ image, label, value }: AresBottomField) => {
	return (
		<div className="ares_bottom_field">
			<img className="ares_bottom_field_icon" src={images.getImage(image)} />
			<div className="ares_bottom_field_text">
				<p>{label}</p>
				<h4>{value}</h4>
			</div>
		</div>
	);
};

export default connect(mapStateToProps, {})(HUD);
