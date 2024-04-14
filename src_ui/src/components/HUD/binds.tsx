import React from 'react';
import Key from './key';

const controls: { [name: string]: string } = {
	cursor: '`',
	inventory: 'I',
	target: 'K',
	phone: 'M',
	noHUD: '0',
};

type Props = {
	items: {
		keyBind: string;
		label: string;
	}[];
};

export default function Binds({ items }: Props) {
	return (
		<div className="hud_binds">
			<ul className="hud_binds-list">
				{items.map((item, index) => (
					<li className="hud_binds-item" key={index}>
						<Key>{item.keyBind}</Key>
						<span>{item.label}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
