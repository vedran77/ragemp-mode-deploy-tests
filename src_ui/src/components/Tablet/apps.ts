import { IconType } from 'react-icons';
import {
	IoPeople,
	IoStar,
	IoWallet,
	IoCar,
	IoAlbums,
	IoMedical,
	IoServer,
	IoSettings,
	IoLibrary,
	IoCall,
	IoShield,
} from 'react-icons/io5';

type App = {
	title: string;
	color: string;
	icon: IconType;
	route: string;
};

const factionApps: { [name: string]: string[] } = {
	armenian: ['members', 'ranks', 'money', 'vehicles', 'journal'],
	families: ['members', 'ranks', 'money', 'vehicles', 'gang_zones', 'journal'],
	ballas: ['members', 'ranks', 'money', 'vehicles', 'gang_zones', 'journal'],
	vagos: ['members', 'ranks', 'money', 'vehicles', 'gang_zones', 'journal'],
	marabunta: ['members', 'ranks', 'money', 'vehicles', 'gang_zones', 'journal'],
	bloods: ['members', 'ranks', 'money', 'vehicles', 'gang_zones', 'journal'],
	lsfd: ['members', 'ranks', 'money', 'vehicles', 'medic_calls', 'journal'],
	lspd: ['members', 'ranks', 'money', 'vehicles', 'materials', 'police_calls', 'database', 'journal'],
	lssd: ['members', 'ranks', 'money', 'vehicles', 'materials', 'police_calls', 'database', 'journal'],
	sang: ['members', 'ranks', 'money', 'vehicles', 'army_materials', 'database', 'journal'],
};

const apps: { [key: string]: App } = {
	settings: {
		title: 'Podešavanja',
		color: '#79787A',
		icon: IoSettings,
		route: '/settings/',
	},
	ranks: {
		title: 'Rankovi',
		color: '#ff9501',
		icon: IoStar,
		route: '/ranks/',
	},
	members: {
		title: 'Članovi',
		color: '#007aff',
		icon: IoPeople,
		route: '/members/',
	},
	money: {
		title: 'Novac',
		color: '#32BF55',
		icon: IoWallet,
		route: '/money/',
	},
	vehicles: {
		title: 'Vozila',
		color: '#FAC800',
		icon: IoCar,
		route: '/vehicles/',
	},
	materials: {
		title: 'Materijali',
		color: '#5855d6',
		icon: IoAlbums,
		route: '/materials/',
	},
	army_materials: {
		title: 'Materijali',
		color: '#5855d6',
		icon: IoAlbums,
		route: '/army_materials/',
	},
	police_calls: {
		title: 'Pozivi',
		color: '#007aff',
		icon: IoCall,
		route: '/pol_calls/',
	},
	medic_calls: {
		title: 'Pozivi',
		color: '#FE3B30',
		icon: IoMedical,
		route: '/med_calls/',
	},
	database: {
		title: 'Baza podataka',
		color: '#FE3B30',
		icon: IoServer,
		route: '/database/',
	},
	journal: {
		title: 'Dnevnik Aktivnosti',
		color: '#30A9DC',
		icon: IoLibrary,
		route: '/journal/',
	},
	gang_zones: {
		title: 'Teritorije',
		color: '#FE3B30',
		icon: IoShield,
		route: '/gang_zones/',
	},
};

export function getApps(faction: string) {
	const data: typeof apps = {};

	factionApps[faction].forEach((app) => {
		data[app] = apps[app];
	});

	return data;
}
