import rpc from 'utils/rpc';
import { setSatiety, setMoney, setTasks, setId, setBonus } from './actions';
import { updateState } from '../index';

rpc.register('Player-SetSatiety', (value) => updateState(setSatiety(value)));
rpc.register('Player-SetMoney', (money) => updateState(setMoney(money)));
rpc.register('Player-SetTasks', (list) => updateState(setTasks(list)));
rpc.register('Player-SetId', (dbId, id) => updateState(setId(id, dbId)));
rpc.register('Player-SetBonus', (time) => updateState(setBonus(time)));
