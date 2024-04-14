import React, { Component } from 'react';
import rpc from 'utils/rpc';
import Selector from './selector';
import Slider from './slider';

const names = {
	mother: [
		'Hana',
		'Avi',
		'Jasmin',
		'Gizel',
		'Amelija',
		'Izabela',
		'Zoa',
		'Ava',
		'Kamila',
		'Violeta',
		'Sofija',
		'Evelin',
		'Selma',
		'Ešli',
		'Grejs',
		'Briana',
		'Natalija',
		'Olivija',
		'Elizabet',
		'Šarlota',
		'Ema',
		'Mistic',
	],
	father: [
		'Benjamin',
		'Daniil',
		'Joshua',
		'Noa',
		'Andrew',
		'Juan',
		'Aleks',
		'Isaak',
		'Evan',
		'Ethan',
		'Vincent',
		'Angel',
		'Diego',
		'Adrian',
		'Viktor',
		'Maksim',
		'Santiago',
		'Kevin',
		'Andrej',
		'Samuel',
		'Antoni',
		'Klaud',
		'Niko',
		'Džon',
	],
};

const parents = {
	father: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 42, 43, 44],
	mother: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 45],
};

type State = {
	father: number;
	mother: number;
	similarity: number;
	skin: number;
};

export default class CharacterBody extends Component<{}, State> {
	readonly state: State = {
		mother: 0,
		father: 0,
		similarity: 0.5,
		skin: 6,
	};

	componentDidMount() {
		this.getSavedState();
	}

	async getSavedState() {
		const { skindata } = await rpc.callClient('CharCreator-GetState');

		this.setState(() => ({
			mother: parents.mother.indexOf(skindata[0]),
			father: parents.father.indexOf(skindata[1]),
			similarity: skindata[2],
			skin: skindata[3],
		}));
	}

	changeAppearance() {
		const { mother, father, similarity, skin } = this.state;

		rpc.callClient('Character-UpdateParents', [parents.mother[mother], parents.father[father], similarity, skin]);
	}

	async switchParent(parent: 'mother' | 'father', value: string) {
		await this.setState(() => ({ [parent]: names[parent].indexOf(value) } as any));

		this.changeAppearance();
	}

	async changeSkin(name: 'similarity' | 'skin', value: number) {
		await this.setState((state) => ({ ...state, [name]: value }));

		this.changeAppearance();
	}

	render() {
		const { father, mother, similarity, skin } = this.state;

		return (
			<div className="character_item character_item--body">
				<Selector
					title="Majka"
					value={names.mother[mother]}
					items={names.mother}
					onChange={this.switchParent.bind(this, 'mother')}
				/>
				<Selector
					title="Otac"
					value={names.father[father]}
					items={names.father}
					onChange={this.switchParent.bind(this, 'father')}
				/>

				<Slider
					title="Sličnost"
					value={similarity}
					min={0}
					max={1}
					step={0.1}
					onChange={(value) => this.changeSkin('similarity', value)}
				/>
				<Slider
					title="Boja kože"
					value={skin}
					min={0}
					max={12}
					onChange={(value) => this.changeSkin('skin', value)}
				/>
			</div>
		);
	}
}
