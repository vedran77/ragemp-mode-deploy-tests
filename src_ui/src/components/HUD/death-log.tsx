import React from 'react';
import images from 'utils/images';

type Props = {
	logs: {
		target: string;
		killer?: string;
		weapon: number | string;
	}[];
};

export const DeathLog = ({ logs }: Props) => {
	const weaponImage = (weapon: number) => images.getImage(`weapons/${weapon}.png`);

	return (
		<div className="death-log">
			{logs.slice(0, 5).map((log, index) => {
				const weapon = typeof log.weapon === 'number' ? weaponImage(log.weapon) : null;

				return (
					<div key={index} className="log">
						{log.killer && <div className="killer">{log.killer}</div>}
						<div className="weapon">
							<img
								className="weapon"
								src={weapon || ''}
								onError={({ currentTarget }) => {
									currentTarget.onerror = null;
									currentTarget.src = images.getLocalImage('question-mark.png');
								}}
							/>
						</div>
						<div className="target">{log.target}</div>
					</div>
				);
			})}
		</div>
	);
};
