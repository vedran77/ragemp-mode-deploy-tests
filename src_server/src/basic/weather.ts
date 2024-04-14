import { random, round } from 'lodash';
import moment from 'moment';
import axios from 'axios';

type ForecastItem = {
  temperature: number;
  condition: string;
  date: string;
};

const weatherTypes = {
  Thunderstorm: ['THUNDER'],
  Drizzle: ['CLEARING'],
  Rain: ['RAIN', 'CLEARING'],
  Snow: ['XMAS', 'SNOWLIGHT'],
  Clear: ['EXTRASUNNY', 'CLEAR'],
  Clouds: ['CLOUDS', 'OVERCAST'],
  Fog: ['SMOG', 'FOGGY', 'NEUTRAL'],
};

class Weather {
  private city: string;

  private forecast: ForecastItem[];

  get current() {
    return this.forecast[0];
  }

  set location(name: string) {
    this.city = name;
    this.forecast = [];

    this.loadForecast();
  }

  init() {
    this.location = process.env.WEATHER_CITY;

    const remainingTime =
      (60 - moment().seconds()) * 1000 + (1000 - moment().milliseconds());

    setTimeout(
      () => setInterval(() => this.loadForecast(), 60000),
      remainingTime
    );
  }

  changeCurrentWeather(firstRunning = false) {
    if (!firstRunning) this.forecast.splice(0, 1);

    if (global.aWeather && !moment(global.aWeather).add(1, 'hours').isBefore())
      return;

    mp.world.weather = this.current?.condition || 'EXTRASUNNY';
    mp.world.setWeatherTransition(this.current?.condition || 'EXTRASUNNY');

    mp.players.call('Weather-Change', [
      this.current?.condition || 'EXTRASUNNY',
    ]);
  }

  setPlayerWeather(player: Player) {
    player.callEvent('Weather-Change', this.current.condition || 'EXTRASUNNY');
  }

  private async loadForecast() {
    const data = await this.fetchData();

    data.list.forEach((item) => {
      const temperature = round(item.main.temp);
      const types: string[] = weatherTypes[item.weather[0].main];

      if (!types) return;

      const weather = {
        temperature,
        condition: types[random(0, types.length - 1)],
        date: moment.unix(item.dt).toISOString(),
      };

      this.forecast.push(weather);
    });

    this.changeCurrentWeather(true);
  }

  private async fetchData() {
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${this.city}&units=metric&appid=${process.env.WEATHER_KEY}`;

    const { data } = await axios.get(url);

    return data;
  }
}

export default new Weather();
