import React from 'react';
import { Capture } from 'store/hud/types';
import Team from './team';
import Timer from './timer';

type Props = {} & Capture;

export default function HUDCapture({ time, defender, attacker }: Props) {
	return time > 0 && attacker && defender ? (
		<div className="capture">
			<div className="capture_name">
				<p>Zauzimanje teritorije</p>
			</div>

			<Team {...defender} />
			<Timer current={time} max={780} />
			<Team {...attacker} />
		</div>
	) : null;
}
