import { AdminLevels } from 'admin/permissions';
import { random } from 'lodash';

export enum COMMANDS {
  SAY = 0,
  NRP = 1,
  ME = 2,
  DO = 3,
  TRY = 4,
  TODO = 5,
  SCREAM = 6,
  WHISPER = 7,
  FACTION = 8,
  FACTION_NRP = 9,
  GOV = 12,
  DEPARTMENT = 13,
  MEGAFON = 14,
  ADMIN_CHAT = 15,
  APM = 16,
  PM = 17,
}

export const colors = {
  white: 'FFFFFF',
  adminRed: 'e74c3c',
  factionChat: '3A71F9',
  lilac: 'b077d9',
  radioChat: 'FBE27C',
  depChat: 'EA9E21',
  megafonChat: 'EADB21',
  privateMessage: 'F4FF0F',
  newsChat: '83E711',
};

class ChatCommands {
  isFactionCommand(id: number) {
    return id > 7;
  }

  prepareString(str: string, players: Player[]) {
    let prepared = str;

    players.forEach((player) => {
      const { id } = player.mp;

      const adminKey = Object.keys(AdminLevels).find(
        (key) => AdminLevels[key].level === player.adminLvl
      );

      prepared = str
        .replace('[id]', `[${id}]`)
        .replace('[name]', `${player.getName()}(${id})`)
        .replace('[phoneNumber]', player.phone.number)
        .replace('[alvl]', AdminLevels[adminKey]?.name || 'Nepoznat');
    });

    return prepared;
  }

  getTemplate(text: string, command: number) {
    switch (command) {
      case COMMANDS.SAY:
        return `!{${colors.white}}[id] govori: ${text}`;
      case COMMANDS.ME:
        return `!{${colors.lilac}}[id] ${text}`;
      case COMMANDS.DO:
        return `!{${colors.lilac}}${text} ([id])`;
      case COMMANDS.TRY:
        return `!{${colors.lilac}}[id] ${text} (${
          random(0, 1) ? 'Uspešno' : 'Neuspešno'
        })`;
      case COMMANDS.NRP:
        return `!{${colors.white}}[id]: (( ${text} ))`;
      case COMMANDS.SCREAM:
        return `!{${colors.white}}[id] viče: ${text}`;
      case COMMANDS.WHISPER: {
        const [, ...msg] = text.split(' ');
        return `!{${colors.white}}[id] šapuće: ${msg.join(' ')}`;
      }

      case COMMANDS.PM: {
        const [, ...msg] = text.split(' ');
        return `!{${colors.privateMessage}}[PM] [name]: !{${
          colors.white
        }}${msg.join(' ')}`;
      }
      case COMMANDS.TODO: {
        const [msg, action] = text.split('*');
        return `${msg}, !{${colors.lilac}} - rekao/la [id], ${action}`;
      }

      case COMMANDS.GOV:
        return `!{${colors.factionChat}}[LAW] [[faction]] [name]: ${text}`;
      case COMMANDS.DEPARTMENT:
        return `!{${colors.depChat}}[[faction]] [rank] [name]: ${text}`;
      case COMMANDS.MEGAFON:
        return `!{${colors.megafonChat}}[MEGAFON] [[faction]] [name]: ${text}`;
      case COMMANDS.FACTION:
        return `!{${colors.radioChat}}[S: 1] [CH: 930] [name]: ${text}`;
      case COMMANDS.FACTION_NRP:
        return `!{${colors.factionChat}}[[faction]] [rank] [name]: (( ${text} ))`;

      case COMMANDS.ADMIN_CHAT:
        return `!{${colors.adminRed}}[[alvl]] [name]: ${text}`;
      case COMMANDS.APM: {
        const [, ...msg] = text.split(' ');
        return `!{${colors.adminRed}}[[alvl]] [name]: !{${
          colors.white
        }}${msg.join(' ')}`;
      }

      default:
        return `!{${colors.white}}[name]: ${text}`;
    }
  }
}

export default new ChatCommands();
