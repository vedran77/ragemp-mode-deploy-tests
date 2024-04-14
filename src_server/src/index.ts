/* eslint-disable import/first */
require('dotenv').config();

import 'source-map-support/register';
import mongoose from 'mongoose';
import './helpers';
import './auth';
import Api from './api';
import redis from './utils/redis';
import weather from './basic/weather';
import time from './basic/time';
import './basic/voice';
import './basic/chat';
import './basic/doors';
import antiCheat from './basic/anti-cheat';
import logger from './utils/logger';
import './phone';
import './services';
import { loadJobs } from './jobs';
import { loadServices } from './services/service';
import houses from './house/entities';
import business from 'business/entities';
import { GarageCtrl } from './factions/garage';
import './awards/daily';
import './admin';
import './utils/savepos';
import factions from './factions';
import './factions/army';
import './factions/police';
import './factions/sheriff';
import './factions/mafia';
import './factions/gangs';
import './donation';

class App {
	private async connectToDatabase() {
		redis.init();

		await mongoose.connect(process.env.DB_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});

		logger.success('Database connected.');
	}

	async init() {
		mp.events.delayInitialization = true;

		try {
			await this.connectToDatabase();

			new Api().init();
			// mailer.init();

			weather.init();
			time.run();
			antiCheat.init();

			// await authToken.clearExpired();
			await loadServices();
			await loadJobs();
			await houses.load();
			await factions.load();
			await business.load();
			await GarageCtrl.loadVehicles();

			mp.events.delayInitialization = false;
		} catch (err) {
			console.error(err, 'initialize error :(');
		}
	}
}

const app = new App();
app.init();
