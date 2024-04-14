import React from 'react';
import factions from 'data/factions.json';
import images from 'utils/images';

const teamColors: { [name: string]: string } = {
	families: '#69d640',
	ballas: '#e344cb',
	vagos: '#fffc00',
	marabunta: '#56c2f5',
	bloods: '#f23838',
};

type Props = {
	name: string;
	members: number;
};

export default function CaptureTeam({ name, members }: Props) {
	return (
		<div className="capture_team">
			<img src={images.getImage(`factions/${name}_logo.png`)} />
			<div>
				<p>{(factions as any)[name] ?? name}</p>
				<p>{members}</p>
			</div>
		</div>
	);
}
