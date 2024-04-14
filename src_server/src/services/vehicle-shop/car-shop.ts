import VehicleShop from './shop';

type CarShopData = {
	id: string;
	vehicles: string[];
	blip: BlipsOptions;
};

const shops: CarShopData[] = [
	{
		id: 'cheap_carshop',
		vehicles: [
			'brioso2',
			'asbo',
			'club',
			'asea',
			'emperor2',
			'premier',
			'cheburek',
			'tornado3',
			'journey',
			'surfer2',
			'asterope',
			'blista',
			'fugitive',
			'regina',
			'ingot',
		],
		blip: {
			name: 'Auto Salon - Niža Klasa',
			model: 225,
			color: 3,
		},
	},
	{
		id: 'mid_carshop',
		vehicles: [
			'hellion',
			'glendale',
			'brioso',
			'kanjo',
			'issi2',
			'oracle',
			'felon',
			'oracle2',
			'jackal',
			'sentinel',
			'zion',
			'blade',
			'buccaneer',
			'dukes',
			'warrener',
			'dubsta',
			'baller3',
			'rebla',
			'vstr',
			'buffalo4',
		],
		blip: {
			name: 'Auto Salon - Srednja Klasa',
			model: 530,
			color: 2,
		},
	},
	{
		id: 'premium_carshop',
		vehicles: [
			'schlagen',
			'zentorno',
			'bestiagts',
			'neon',
			'ninef',
			'jester',
			'infernus2',
			't20',
			'tempesta',
			'reaper',
			'coquette4',
			'osiris',
			'furia',
			'cheetah2',
			'entity2',
			'remustwo',
			'patriots',
			'raidenz',
			'alphav',
			'remustwo',
			'hellenstorm',
			'nsandstorm',
			'nsandstorm2',
			'turismocs',
			'zioncr',
			'indiana',
			'indianaxl',
			'oraclelwb',
			'sadler3',
			'dubsta22',
			'elegyrh7',
			'domgtcoupe',
			'h4rxgranUT',
			'gauntletstx',
			'jd_oraclev12',
			'jd_oraclev12w',
			'jubilee8',
			'mesaxl',
			'l35l',
			'l35r',
			'l35s',
			'scout',
			'sheavas',
			'schafter3rs',
			'toros2',
			'caracaran',
			'severo',
			'yosemiteswb',
			'cypherct',
			'scharmann',
			'vorstand',
			'thraxd',
			'coquettecab',
			'coquetterod',
			'sunrise1',
			'f620d',
			'kawaii',
			'komodafr',
		],
		blip: {
			name: 'Auto Salon - Visoka Klasa',
			model: 669,
			color: 50,
		},
	},
];

class CarShop extends VehicleShop {
	constructor(data: CarShopData) {
		super(data.id, data.blip, data.vehicles);
	}

	protected async canBuy(player: Player) {
		await super.canBuy(player);

		if (!player.hasLicense('car')) {
			return mp.events.reject('Nemate dozvolu B kategorije.');
		}
	}
}

shops.forEach((shop) => new CarShop(shop));
