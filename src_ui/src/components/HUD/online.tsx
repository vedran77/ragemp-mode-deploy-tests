import React, { useEffect, useState } from 'react';
// @ts-ignore
import moment from 'moment';
import images from 'utils/images';
import rpc from 'utils/rpc';
import Ammo from './ammo';

type Props = {
	playerDbId: number;
	playerId: number;
	count: number;
	date: string;
	cash: number;
	bank: number;
};

interface TwoFieldsRowProps {
	iconOne: string;
	labelOne: string;
	valueOne: string | number;
	iconTwo: string;
	labelTwo: string;
	valueTwo: string | number;
}

export const TwoFieldsRow = ({
	iconOne,
	labelOne,
	valueOne,
	iconTwo,
	labelTwo,
	valueTwo,
}: TwoFieldsRowProps) => {
	return (
		<div className="two_fields_row">
			<div className="two_fields_row_field">
				<img
					className="two_fields_row_text_icon"
					src={images.getImage(iconOne)}
				/>
				<div className="two_fields_row_text">
					<p>{labelOne}</p>
					<h4>{valueOne}</h4>
				</div>
			</div>
			<div className="two_fields_row_field">
				<img
					className="two_fields_row_text_icon"
					src={images.getImage(iconTwo)}
				/>
				<div className="two_fields_row_text">
					<p>{labelTwo}</p>
					<h4>{valueTwo}</h4>
				</div>
			</div>
		</div>
	);
};

export default function Online({
	playerDbId,
	playerId,
	count,
	date,
	cash,
	bank,
}: Props) {
	const [status, setStatus] = useState<boolean>(false);

	useEffect(() => {
		rpc.register('HUD-SetMicStatus', setStatus);

		return () => {
			rpc.unregister('HUD-SetMicStatus');
		};
	}, []);

	return (
		<div className="ares_hud_top_right">
			<img className="logo" src={images.getImage('logo.png')} />
			<TwoFieldsRow
				iconOne="player.svg"
				labelOne={'id'}
				valueOne={`#${playerDbId?.toString()} (${playerId?.toString()})`}
				iconTwo="hud_pocket_money.svg"
				labelTwo="dzep"
				valueTwo={cash.toLocaleString('en-US', {
					style: 'currency',
					currency: 'USD',
					maximumFractionDigits: 0,
				})}
			/>
			<TwoFieldsRow
				iconOne="hud_online.svg"
				labelOne="online"
				valueOne={count}
				iconTwo="hud_bank.svg"
				labelTwo="banka"
				valueTwo={bank.toLocaleString('en-US', {
					style: 'currency',
					currency: 'USD',
					maximumFractionDigits: 0,
				})}
			/>
			<Ammo />

			<div className={`mic ${status && 'mic_active'}`}>
				<img
					src={images.getImage(
						status ? 'hud_mic_active.svg' : 'hud_mic.svg'
					)}
				/>
				<div className="mic_helper">
					<p>N</p>
				</div>
			</div>
		</div>
	);
}
