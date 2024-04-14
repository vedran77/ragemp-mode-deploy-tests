import React from 'react';
import images from 'utils/images';
import PrimaryTitle from 'components/Common/primary-title';
import { InventoryItem } from './index';
import DropZone from './drop-zone';
import Item from './item';
import Cell from './cell';

const clothesGrid: Array<string | [string, string, string]> = [
	'hat',
	['accessories', 'glasses', 'mask'],
	'jacket',
	'armor',
	'shirt',
	'pants',
	'shoes',
];

const clothes = {
	hat: 'Kapa',
	mask: 'Maska',
	glasses: 'Naočare',
	accessories: 'Dodaci',
	jacket: 'Jakna',
	shirt: 'Majica',
	watch: 'Sat',
	pants: 'Pantalone',
	shoes: 'Obuća',
};

type Props = {
	use: (id: number) => void;
	drop: (id: number) => void;
	items: { [name: string]: InventoryItem };
};

export default function Character({ items, use, drop }: Props) {
	function getWearingItem(name: string) {
		const item = items[name];

		return item && <Item id={name} name={item.name} itemData={item.data} amount={1} hideAmount />;
	}

	return (
		<div className="inventory_character">
			<div className="inventory_character-container">
				<PrimaryTitle className="inventory_title">Karakter</PrimaryTitle>

				<div className="inventory_character-clothes">
					{clothesGrid.map((key, i) => {
						if (typeof key === 'string') {
							const title = clothes[key as keyof typeof clothes];

							return (
								<div className="inventory_character-item" key={key}>
									<Cell id={key} onDrop={use}>
										{getWearingItem(key) || <img src={images.getImage(`${key}.svg`)} alt={title} />}
									</Cell>
								</div>
							);
						} else if (Array.isArray(key)) {
							return (
								<div className="inventory_character-flex">
									{key.map((k) => {
										const title = clothes[k as keyof typeof clothes];

										return (
											<div className="inventory_character-item" key={i}>
												<Cell id={k} onDrop={use} key={k}>
													{getWearingItem(k) || (
														<img src={images.getImage(`${k}.svg`)} alt={title} />
													)}
												</Cell>
											</div>
										);
									})}
								</div>
							);
						}
					})}
				</div>
			</div>

			<div className="inventory_character-flex absolute">
				<div className="inventory_character-item">
					<Cell id="weapon" onDrop={use}>
						{getWearingItem('hands') || <img src={images.getImage('hands.svg')} alt="Oružje" />}
					</Cell>
				</div>

				<div className="inventory_character-item">
					<Cell id="watch" onDrop={use}>
						{getWearingItem('watch') || <img src={images.getImage('watch.svg')} alt="Sat" />}
					</Cell>
				</div>
			</div>

			<DropZone onDrop={drop} />
		</div>
	);
}
