type AwardType = 'money' | 'gh-coin' | 'car' | 'clothes' | 'bonus-spin';

export type Reward = {
	type: AwardType;
	fromTo: [number, number] | number;
	value: number | string;
};

export const luckyWheelRewards: Reward[] = [
	{
		type: 'money',
		fromTo: [0, 4],
		value: 500,
	},
	{
		type: 'money',
		fromTo: [5, 9],
		value: 1000,
	},
	{
		type: 'money',
		fromTo: [10, 14],
		value: 2000,
	},
	{
		type: 'money',
		fromTo: [15, 19],
		value: 3000,
	},
	{
		type: 'money',
		fromTo: [20, 24],
		value: 5000,
	},
	{
		type: 'money',
		fromTo: [25, 27],
		value: 10000,
	},
	{
		type: 'money',
		fromTo: [28, 30],
		value: 25000,
	},
	{
		type: 'gh-coin',
		fromTo: [31, 33],
		value: 50,
	},
	{
		type: 'gh-coin',
		fromTo: [34, 35],
		value: 100,
	},
	{
		type: 'gh-coin',
		fromTo: [36, 38],
		value: 150,
	},
	{
		type: 'gh-coin',
		fromTo: [39, 41],
		value: 200,
	},
	{
		type: 'gh-coin',
		fromTo: [42, 44],
		value: 250,
	},
	{
		type: 'gh-coin',
		fromTo: 45,
		value: 500,
	},
	{
		type: 'car',
		fromTo: 46,
		value: 'Sentinel',
	},
	{
		type: 'clothes',
		fromTo: [47, 75],
		value: 'Hat',
	},
	{
		type: 'clothes',
		fromTo: [76, 88],
		value: 'Hoodie',
	},
	{
		type: 'clothes',
		fromTo: [89, 96],
		value: 'Shirt',
	},
	{
		type: 'bonus-spin',
		fromTo: [97, 100],
		value: 1,
	},
];
