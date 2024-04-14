import rpc from 'rage-rpc';
import hud from 'helpers/hud';
import money from 'helpers/money';

class CasinoBlackJack {
	public cards: Record<string, number>;
	public cardKeys: string[];
	public blackJackBetTime: number[];
	public blackJackPlayers: Player[][];
	public blackJackSeatsPlayers: Player[][];
	public blackJackDealSum: number[];
	public blackJackTableSeatsNow: number[];
	public blackJackTableMaxBet: number[];
	public blackJackTableMinBet: number[];
	public blackJackTablePlayerNow: Player[];
	public blackJackDealCardsNum: number[];
	public blackJackTables: number[][][];
	public blackJackTablesSeatsPos: Vector3Mp[][];

	constructor() {
		this.blackJackTablesSeatsPos = [
			[
				new mp.Vector3(1148.367, 269.0835, -51.7879),
				new mp.Vector3(1148.345, 269.7643, -51.7876),
				new mp.Vector3(1148.821, 270.2321, -51.7708),
				new mp.Vector3(1149.495, 270.2401, -51.7632),
			],
			[
				new mp.Vector3(1152.317, 267.4195, -51.8003),
				new mp.Vector3(1152.337, 266.7202, -51.7913),
				new mp.Vector3(1151.849, 266.2183, -51.7916),
				new mp.Vector3(1151.182, 266.2501, -51.7864),
			],
			[
				new mp.Vector3(1128.713, 262.8658, -51.0035),
				new mp.Vector3(1129.446, 262.8649, -51.0121),
				new mp.Vector3(1129.932, 262.3822, -51.0027),
				new mp.Vector3(1129.899, 261.6921, -51.0422),
			],
			[
				new mp.Vector3(1143.738, 247.8562, -51.034),
				new mp.Vector3(1144.459, 247.8673, -51.0229),
				new mp.Vector3(1144.951, 247.3612, -51.015),
				new mp.Vector3(1144.913, 246.663, -51.0236),
			],
		];

		this.blackJackTables = [
			[
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
			],
			[
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
			],
			[
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
			],
			[
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0],
			],
		];

		this.blackJackDealCardsNum = [0, 0, 0, 0];
		this.blackJackTablePlayerNow = [null, null, null, null];
		this.blackJackTableMinBet = [10, 10, 10, 10];
		this.blackJackTableMaxBet = [500, 500, 1000, 1000];
		this.blackJackTableSeatsNow = [0, 0, 0, 0];
		this.blackJackDealSum = [0, 0, 0, 0];
		this.cards = {
			vw_prop_cas_card_club_ace: 11,
			vw_prop_cas_card_club_02: 2,
			vw_prop_cas_card_club_03: 3,
			vw_prop_cas_card_club_04: 4,
			vw_prop_cas_card_club_05: 5,
			vw_prop_cas_card_club_06: 6,
			vw_prop_cas_card_club_07: 7,
			vw_prop_cas_card_club_08: 8,
			vw_prop_cas_card_club_09: 9,
			vw_prop_cas_card_club_10: 10,
			vw_prop_cas_card_club_jack: 10,
			vw_prop_cas_card_club_queen: 10,
			vw_prop_cas_card_club_king: 10,
			vw_prop_cas_card_dia_ace: 11,
			vw_prop_cas_card_dia_02: 2,
			vw_prop_cas_card_dia_03: 3,
			vw_prop_cas_card_dia_04: 4,
			vw_prop_cas_card_dia_05: 5,
			vw_prop_cas_card_dia_06: 6,
			vw_prop_cas_card_dia_07: 7,
			vw_prop_cas_card_dia_08: 8,
			vw_prop_cas_card_dia_09: 9,
			vw_prop_cas_card_dia_10: 10,
			vw_prop_cas_card_dia_jack: 10,
			vw_prop_cas_card_dia_queen: 10,
			vw_prop_cas_card_dia_king: 10,
			vw_prop_cas_card_hrt_ace: 11,
			vw_prop_cas_card_hrt_02: 2,
			vw_prop_cas_card_hrt_03: 3,
			vw_prop_cas_card_hrt_04: 4,
			vw_prop_cas_card_hrt_05: 5,
			vw_prop_cas_card_hrt_06: 6,
			vw_prop_cas_card_hrt_07: 7,
			vw_prop_cas_card_hrt_08: 8,
			vw_prop_cas_card_hrt_09: 9,
			vw_prop_cas_card_hrt_10: 10,
			vw_prop_cas_card_hrt_jack: 10,
			vw_prop_cas_card_hrt_queen: 10,
			vw_prop_cas_card_hrt_king: 10,
			vw_prop_cas_card_spd_ace: 11,
			vw_prop_cas_card_spd_02: 2,
			vw_prop_cas_card_spd_03: 3,
			vw_prop_cas_card_spd_04: 4,
			vw_prop_cas_card_spd_05: 5,
			vw_prop_cas_card_spd_06: 6,
			vw_prop_cas_card_spd_07: 7,
			vw_prop_cas_card_spd_08: 8,
			vw_prop_cas_card_spd_09: 9,
			vw_prop_cas_card_spd_10: 10,
			vw_prop_cas_card_spd_jack: 10,
			vw_prop_cas_card_spd_queen: 10,
			vw_prop_cas_card_spd_king: 10,
		};

		this.cardKeys = Object.keys(this.cards);
		this.blackJackBetTime = [0, 0, 0, 0];
		this.blackJackPlayers = [[], [], [], []];
		this.blackJackSeatsPlayers = [[], [], [], []];

		mp.events.subscribe({
			blackJackBetDown: this.betDown.bind(this),
			blackJackBetUp: this.betUp.bind(this),
			blackJackSetBet: this.bet.bind(this),
			blackJackHit: this.hit.bind(this),
		});

		this.init();
		for (let i = 0; i < 4; i++) {
			this.startDealing(i);
		}
	}

	public betUp(player: Player) {
		const table = player.mp.getVariable('BJ_TABLE');
		if (table == null) return;

		if (this.blackJackBetTime[table] <= 0) return;
		let inBet = player.mp.getVariable('BJ_INBET');

		if (this.blackJackTableMaxBet[table] < inBet - this.blackJackTableMinBet[table]) {
			return;
		}

		player.mp.setVariable('BJ_INBET', inBet + this.blackJackTableMinBet[table]);
		rpc.callBrowsers(player.mp, 'BlackJack-SetBets', [
			inBet + this.blackJackTableMinBet[table],
			this.blackJackTableMinBet[table],
		]);
	}

	public bet(player: Player) {
		if (player.mp.getVariable('BJ_CANBET') === false) return;
		const table = player.mp.getVariable('BJ_TABLE');
		if (table == null) return;

		const chips = player.mp.getVariable('BJ_INBET');

		if (this.blackJackBetTime[table] <= 0) {
			this.stand(player);
			return;
		}

		if (player.money.cash < chips) {
			hud.showNotification(player, 'error', 'Nemate dovoljno novca');
			return;
		}

		money.change(player, 'cash', -chips, 'blackjack-bet');

		if (this.blackJackPlayers[table].find((p) => p.dbId === player.dbId)) {
			player.mp.setVariable('BJ_BET', player.mp.getVariable('BJ_BET') + chips);
		} else {
			this.blackJackPlayers[table].push(player);
			player.mp.setVariable('BJ_BET', chips);
		}

		hud.showNotification(player, 'info', `Ulozili ste $${chips}`);
		player.mp.setVariable('BJ_CANBET', false);
		mp.players.callInRange(player.mp.position, 20, 'bet_blackjack', [
			table,
			player.mp.getVariable('BJ_SEAT'),
			player.mp.id,
		]);
	}

	public hit(player: Player) {
		const table = player.mp.getVariable('BJ_TABLE');
		if (table == null) return;

		if (player.mp.getVariable('BJ_ANSWER') == 1) {
			mp.players.callInRange(player.mp.position, 150, 'decline_card', [player.mp.id]);
			player.mp.setVariable('BJ_ANSWER', 3);
		}
	}

	public init(): void {
		for (let i = 0; i < this.blackJackTablesSeatsPos.length; i++) {
			for (let j = 0; j < this.blackJackTablesSeatsPos[i].length; j++) {
				mp.colshapes.create(this.blackJackTablesSeatsPos[i][j], 1, {
					onEnter: (player: Player) => {
						hud.showInteract(player, 'E');
						player.mp.setVariable('TABLE', i);
						player.mp.setVariable('SEAT', j);
					},
					onExit: (player: Player) => {
						hud.showInteract(player);
						player.mp.setVariable('TABLE', null);
						player.mp.setVariable('SEAT', null);
					},
					onKeyPress: this.onJoin.bind(this),
				});
			}
		}
	}

	public onJoin(player: Player) {
		if (player.mp.getVariable('BJ_TABLE') == null) {
			this.seat(player, player.mp.getVariable('TABLE'), player.mp.getVariable('SEAT'));
		} else {
			this.exit(player);
		}
	}

	public seat(player: Player, table: number, seat: number) {
		let seatTaken: boolean = false;

		mp.players.forEach((p) => {
			const targetTable = p.getVariable('BJ_TABLE');
			const targetSeat = p.getVariable('BJ_SEAT');

			if (targetTable != null && table == targetTable && targetSeat == seat) {
				seatTaken = true;
				return;
			}
		});

		if (seatTaken) {
			hud.showNotification(player, 'error', 'Mesto je zauzeto');
			return;
		}

		this.blackJacks(player, table, seat);
		player.mp.setVariable('canDoBest', true);
		mp.players.callInRange(this.getTableCord(table), 20, 'seat_to_blackjack_table', [table, seat, player.mp.id]);

		player.mp.call('show_blackjack', [true]);
	}

	public blackJacks(player: Player, table: number, seat: number) {
		player.mp.setVariable('BJ_TABLE', table);
		player.mp.setVariable('BJ_SEAT', seat);
		player.mp.setVariable('BJ_SUM', 0);
		player.mp.setVariable('BJ_CARDS', 0);
		player.mp.setVariable('BJ_STATUS', 0);
		player.mp.setVariable('BJ_ANSWER', 0);
		player.mp.setVariable('BJ_TIMER', 0);

		player.mp.setVariable('BJ_BET', this.blackJackTableMinBet[table]);

		this.blackJackSeatsPlayers[table].push(player);
		this.blackJackTables[table][seat] = [0, 0, 0, 0, 0, 0, 0];
	}

	public betDown(player: Player) {
		const table = player.mp.getVariable('BJ_TABLE');
		if (table == null) return;

		if (this.blackJackBetTime[table] <= 0) return;
		let inBet = player.mp.getVariable('BJ_INBET');

		if (this.blackJackTableMinBet[table] > inBet - this.blackJackTableMinBet[table]) return;

		player.mp.setVariable('BJ_INBET', inBet - this.blackJackTableMinBet[table]);
		rpc.callBrowsers(player.mp, 'BlackJack-SetBets', [
			inBet - this.blackJackTableMinBet[table],
			this.blackJackTableMinBet[table],
		]);
	}

	public async startDealing(table: number) {
		try {
			while (true) {
				if (this.blackJackBetTime[table] != 0) {
					for (let i = 0; i < this.blackJackSeatsPlayers[table].length; i++) {
						rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetTime', ['00']);
						rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetCards', [0, 0]);
					}

					if (this.blackJackSeatsPlayers[table].length == this.blackJackPlayers[table].length) {
						this.blackJackBetTime[table] = 1;
					}

					this.blackJackBetTime[table] -= 1;
					await this.sleep(1000);

					if (this.blackJackBetTime[table] != 0) {
						continue;
					}
				}

				if (this.blackJackPlayers[table].length == 0 && this.blackJackBetTime[table] == 0) {
					this.blackJackBetTime[table] = 15;
					await this.sleep(1000);
					continue;
				}

				for (let i = 0; i < this.blackJackSeatsPlayers[table].length; i++) {
					rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetStart', [true]);
				}

				for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
					this.getCard(this.blackJackPlayers[table][i]);
					rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetCards', [
						this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
						this.blackJackDealSum[table],
					]);
					await this.sleep(2000);
				}

				this.getCardDeal(table);

				await this.sleep(1200);
				for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
					rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetCards', [
						this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
						this.blackJackDealSum[table],
					]);
				}

				await this.sleep(1200);

				for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
					this.getCard(this.blackJackPlayers[table][i]);

					rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetCards', [
						this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
						this.blackJackDealSum[table],
					]);
					await this.sleep(2000);
				}

				await this.sleep(2000);
				this.getCardDeal(table);

				for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
					rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetCards', [
						this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
						this.blackJackDealSum[table],
					]);
				}
				await this.sleep(2000);

				for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
					this.blackJackTablePlayerNow[table] = this.blackJackPlayers[table][i];
					this.blackJackTableSeatsNow[table] = this.blackJackPlayers[table][i].mp.getVariable('BJ_SEAT');

					while (true) {
						try {
							if (!this.blackJackPlayers[table][i]) return;

							const answer = this.blackJackPlayers[table][i].mp.getVariable('BJ_ANSWER');

							if (answer == 0) {
								this.blackJackPlayers[table][i].mp.setVariable('BJ_ANSWER', 1);
								const res = this.checkPlayerSum(this.blackJackPlayers[table][i]);
								if (res <= 0) {
									rpc.callBrowsers(this.blackJackPlayers[table][i].mp, 'BlackJack-SetStart', [false]);
									this.blackJackPlayers[table][i].mp.setVariable('BJ_CANBET', true);
									hud.showNotification(this.blackJackPlayers[table][i], 'error', 'Izgubili ste');
									this.blackJackPlayers[table][i].mp.setVariable('BJ_ANSWER', 0);
									mp.players.callInRange(this.getTableCord(table), 20, 'lose_blackjack', [table]);
									await this.sleep(1500);
									this.cleanPlayer(this.blackJackPlayers[table][i]);
									break;
								} else if (res == 1) {
									rpc.callBrowsers(this.blackJackPlayers[table][i].mp, 'BlackJack-SetStart', [false]);
									this.blackJackPlayers[table][i].mp.setVariable('BJ_CANBET', true);
									hud.showNotification(this.blackJackPlayers[table][i], 'success', 'Blackjack!');
									this.blackJackPlayers[table][i].mp.setVariable('BJ_ANSWER', 0);
									mp.players.callInRange(this.getTableCord(table), 20, 'win_blackjack', [table]);
									money.change(
										this.blackJackPlayers[table][i],
										'cash',
										this.blackJackPlayers[table][i].mp.getVariable('BJ_BET') * 2,
										'blackjack-win'
									);
									await this.sleep(1500);
									this.cleanPlayer(this.blackJackPlayers[table][i]);
									break;
								}
								mp.players.callInRange(this.getTableCord(table), 20, 'stand_or_hit', [
									table,
									this.blackJackPlayers[table][i].mp.getVariable('BJ_SEAT'),
								]);
							} else if (answer == 1) {
								const timer = this.blackJackPlayers[table][i].mp.getVariable('BJ_TIMER');
								if (timer == 15000) {
									this.blackJackPlayers[table][i].mp.setVariable('BJ_ANSWER', 3);
									this.blackJackPlayers[table][i].mp.setVariable('BJ_TIMER', 0);
								} else {
									await this.sleep(1000);
									this.blackJackPlayers[table][i].mp.setVariable('BJ_TIMER', timer + 1000);

									rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetCards', [
										this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
										this.blackJackDealSum[table],
									]);

									mp.players.forEachInRange(
										this.blackJackPlayers[table][i].mp.position,
										20,
										(player) => {
											let time: number | string = 15 - timer / 1000;

											if (time < 10) {
												time = `0${time}`;
											} else {
												time = time.toString();
											}

											rpc.callBrowsers(player, 'BlackJack-SetTime', [time]);
										}
									);
								}
							} else {
								if (this.blackJackPlayers[table][i].mp.getVariable('BJ_ANSWER') == 2) {
									this.getCard(this.blackJackPlayers[table][i]);
									await this.sleep(350);
									rpc.callBrowsers(this.blackJackSeatsPlayers[table][i].mp, 'BlackJack-SetCards', [
										this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
										this.blackJackDealSum[table],
									]);

									await this.sleep(1000);

									this.blackJackPlayers[table][i].mp.setVariable('BJ_ANSWER', 0);
									this.blackJackPlayers[table][i].mp.setVariable('BJ_TIMER', 0);
								} else {
									this.blackJackPlayers[table][i].mp.setVariable('BJ_ANSWER', 0);
									this.blackJackPlayers[table][i].mp.setVariable('BJ_TIMER', 0);
									await this.sleep(1500);
									break;
								}
								await this.sleep(2500);
							}
						} catch (err) {
							console.log('BLACKJACK DEALING error: ', err);
						}
					}

					this.blackJackTablePlayerNow[table] = null;
					this.blackJackTableSeatsNow[table] = 0;
				}

				if (this.blackJackDealCardsNum[table] == 2) {
					mp.players.callInRange(this.getTableCord(table), 20, 'flip_card', [table]);
					this.blackJackDealSum[table] += this.cards[this.cardKeys[this.blackJackTables[table][4][1]]];
					await this.sleep(2000);
					for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
						rpc.callBrowsers(this.blackJackPlayers[table][i].mp, 'BlackJack-SetCards', [
							this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
							this.blackJackDealSum[table],
						]);
					}
				}

				while (this.blackJackDealSum[table] < 17) {
					this.getCardDeal(table);
					await this.sleep(2500);
					for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
						rpc.callBrowsers(this.blackJackPlayers[table][i].mp, 'BlackJack-SetCards', [
							this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
							this.blackJackDealSum[table],
						]);
					}
				}

				for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
					rpc.callBrowsers(this.blackJackPlayers[table][i].mp, 'BlackJack-SetCards', [
						this.blackJackPlayers[table][i].mp.getVariable('BJ_SUM'),
						this.blackJackDealSum[table],
					]);
					mp.players.callInRange(this.getTableCord(table), 20, 'clean_cards', [
						table,
						this.blackJackPlayers[table][i].mp.getVariable('BJ_SEAT'),
					]);
					this.checkFinalSum(this.blackJackPlayers[table][i]);
					await this.sleep(2000);
				}

				for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
					rpc.callBrowsers(this.blackJackPlayers[table][i].mp, 'BlackJack-SetStart', [false]);
				}

				this.blackJackPlayers[table] = [];
				mp.players.callInRange(this.getTableCord(table), 20, 'clean_cards', [table, 4]);
				this.blackJackDealSum[table] = 0;
				this.blackJackDealCardsNum[table] = 0;
				this.blackJackTables[table] = [
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0],
				];

				await this.sleep(2000);
			}
		} catch (err) {
			console.log('BLACKJACK error: ', err);
		}
	}

	public sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	public stand(player: Player) {
		if (player.mp.getVariable('BJ_TABLE') == null) return;

		let table = player.mp.getVariable('BJ_TABLE');

		if (player.mp.getVariable('BJ_ANSWER') == 1) {
			mp.players.callInRange(this.getTableCord(table), 20, 'request_card', [player.mp.id]);
			player.mp.setVariable('BJ_ANSWER', 2);
		}
	}

	public exit(player: Player) {
		if (player.mp.getVariable('BJ_TABLE') == null) return;
		if (player.mp.getVariable('BJ_STATUS') != 0) return;
		if (player.mp.getVariable('BlackJackMakeBet')) return;

		const table = player.mp.getVariable('BJ_TABLE');

		if (this.blackJackPlayers[table].find((p) => p.mp.id === player.mp.id)) {
			this.blackJackPlayers[table] = this.blackJackPlayers[table].filter((p) => p.mp.id !== player.mp.id);
		}

		for (let i = 0; i < this.blackJackSeatsPlayers[table].length; i++) {
			if (this.blackJackSeatsPlayers[table][i].mp.id === player.mp.id) {
				this.blackJackSeatsPlayers[table][i] = [] as any;
			}
		}

		this.blackJackSeatsPlayers[table] = this.blackJackSeatsPlayers[table].filter(
			(p) => p && p.mp && p.mp.id !== player.mp.id
		);

		for (let i = 0; i < this.blackJackPlayers[table].length; i++) {
			if (this.blackJackPlayers[table][i].mp.id === player.mp.id) {
				this.blackJackPlayers[table][i] = [] as any;
			}
		}

		player.mp.setVariable('canDoBets', false);
		mp.players.callInRange(this.getTableCord(table), 20, 'exit_table', [player.mp.id]);

		player.mp.call('show_blackjack', [false]);

		this.exitPlayer(player);
	}

	public getTableCord(table: number) {
		switch (table) {
			case 0:
				return new mp.Vector3(1148.837, 269.747, -52.8409);

			case 1:
				return new mp.Vector3(1151.84, 266.747, -52.8409);

			case 2:
				return new mp.Vector3(1129.406, 262.3578, -52.041);

			case 3:
				return new mp.Vector3(1144.429, 247.3352, -52.041);
		}
		return new mp.Vector3(0, 0, 0);
	}

	public exitPlayer(player: Player) {
		const seat = player.mp.getVariable('BJ_SEAT');
		const table = player.mp.getVariable('BJ_TABLE');

		this.blackJackTables[table][seat] = [0, 0, 0, 0, 0, 0, 0];

		player.mp.setVariable('BJ_TABLE', null);
		player.mp.setVariable('BJ_SEAT', null);
		player.mp.setVariable('BJ_SUM', null);
		player.mp.setVariable('BJ_CARDS', null);
		player.mp.setVariable('BJ_STATUS', null);
		player.mp.setVariable('BJ_ANSWER', null);
		player.mp.setVariable('BJ_TIMER', null);
		player.mp.setVariable('BJ_BET', null);
	}

	public cleanPlayer(player: Player) {
		if (!player) {
			return;
		}

		const seat = player.mp.getVariable('BJ_SEAT');
		const table = player.mp.getVariable('BJ_TABLE');

		this.blackJackTables[table][seat] = [0, 0, 0, 0, 0, 0, 0];
		player.mp.setVariable('BlackJackMakeBet', false);
		player.mp.setVariable('BJ_TABLE', table);
		player.mp.setVariable('BJ_SEAT', seat);
		player.mp.setVariable('BJ_SUM', 0);
		player.mp.setVariable('BJ_CARDS', 0);
		player.mp.setVariable('BJ_STATUS', 0);
		player.mp.setVariable('BJ_ANSWER', 0);
		player.mp.setVariable('BJ_TIMER', 0);
		player.mp.setVariable('BJ_BET', 0);
	}

	public checkPlayerSum(player: Player) {
		const bjStatus: number = player.mp.getVariable('BJ_STATUS');
		if (bjStatus == 0) {
			return -1;
		}

		const bjSum: number = player.mp.getVariable('BJ_SUM');
		if (bjSum > 21) {
			player.mp.setVariable('BJ_STATUS', 0);
			return -1;
		} else if (bjSum == 21) {
			return 1;
		} else {
			player.mp.setVariable('BJ_STATUS', 2);
			return 2;
		}
	}

	public checkFinalSum(player: Player) {
		const bjStatus: number = player.mp.getVariable('BJ_STATUS');
		if (bjStatus == 0) {
			return;
		}

		const table: number = player.mp.getVariable('BJ_TABLE');
		const pSum: number = player.mp.getVariable('BJ_SUM');
		const bet: number = player.mp.getVariable('BJ_BET');

		const diler: number = this.blackJackDealSum[table];

		// i know 10 times better way to do this but i don't give a fuck right now

		if (pSum > 21) {
			hud.showNotification(player, 'error', `Izgubili ste $${bet}`);
			mp.players.callInRange(this.getTableCord(table), 20, 'lose_blackjack', [table]);
		} else if (pSum === 21) {
			hud.showNotification(player, 'success', `Osvojili ste BlackJack`);
			mp.players.callInRange(this.getTableCord(table), 20, 'win_blackjack', [table]);
			money.change(player, 'cash', bet * 2, 'blackjack-win');
		} else if (diler > 21) {
			hud.showNotification(player, 'success', `Osvojili ste $${bet * 2}`);
			mp.players.callInRange(this.getTableCord(table), 20, 'win_blackjack', [table]);
			money.change(player, 'cash', bet * 2, 'blackjack-win');
		} else if (pSum === diler) {
			hud.showNotification(player, 'info', `Nereseno`);
			mp.players.callInRange(this.getTableCord(table), 20, 'draw_blackjack', [table]);
			money.change(player, 'cash', bet, 'blackjack-draw');
		} else if (diler === 21) {
			hud.showNotification(player, 'error', `Izgubili ste $${bet}`);
			mp.players.callInRange(this.getTableCord(table), 20, 'lose_blackjack', [table]);
		} else if (pSum > diler) {
			hud.showNotification(player, 'success', `Osvojili ste $${bet * 2}`);
			mp.players.callInRange(this.getTableCord(table), 20, 'win_blackjack', [table]);
			money.change(player, 'cash', bet * 2, 'blackjack-win');
		} else {
			hud.showNotification(player, 'error', `Izgubili ste $${bet}`);
			mp.players.callInRange(this.getTableCord(table), 20, 'lose_blackjack', [table]);
		}

		this.cleanPlayer(player);
	}

	public getCard(player: Player): void {
		const table: number = player.mp.getVariable('BJ_TABLE');
		const seat: number = player.mp.getVariable('BJ_SEAT');

		let sum: number = player.mp.getVariable('BJ_SUM');
		let cards: number = player.mp.getVariable('BJ_CARDS');

		player.mp.setVariable('BJ_STATUS', 1);

		let emptySlot: number = cards;
		let randomCard: number = 0;

		randomCard = Math.floor(Math.random() * this.cardKeys.length);
		sum += this.cards[this.cardKeys[randomCard]];

		this.blackJackTables[table][seat][emptySlot] = randomCard;
		cards++;

		player.mp.setVariable('BJ_SUM', sum);
		player.mp.setVariable('BJ_CARDS', cards);

		mp.players.callInRange(this.getTableCord(table), 20, 'client_bj_give_card', [
			table,
			seat,
			emptySlot,
			randomCard,
		]);
	}

	public getCardDeal(table: number) {
		let emptySlot: number = this.blackJackDealCardsNum[table];
		let randomCard: number = 0;

		randomCard = Math.floor(Math.random() * this.cardKeys.length);

		this.blackJackDealSum[table] += emptySlot != 1 ? this.cards[this.cardKeys[randomCard]] : 0;
		this.blackJackTables[table][4][emptySlot] = randomCard;
		this.blackJackDealCardsNum[table]++;

		mp.players.callInRange(this.getTableCord(table), 20, 'client_bj_give_card', [table, 4, emptySlot, randomCard]);
	}

	public getCardOffset(param0: number, param1: number, param2: number) {
		if (!param2) {
			switch (param1) {
				case 0:
					switch (param0) {
						case 0:
							return new mp.Vector3(0.5737, 0.2376, 0.948025);

						case 1:
							return new mp.Vector3(0.562975, 0.2523, 0.94875);

						case 2:
							return new mp.Vector3(0.553875, 0.266325, 0.94955);

						case 3:
							return new mp.Vector3(0.5459, 0.282075, 0.9501);

						case 4:
							return new mp.Vector3(0.536125, 0.29645, 0.95085);

						case 5:
							return new mp.Vector3(0.524975, 0.30975, 0.9516);

						case 6:
							return new mp.Vector3(0.515775, 0.325325, 0.95235);
					}
					break;

				case 1:
					switch (param0) {
						case 0:
							return new mp.Vector3(0.2325, -0.1082, 0.94805);

						case 1:
							return new mp.Vector3(0.23645, -0.0918, 0.949);

						case 2:
							return new mp.Vector3(0.2401, -0.074475, 0.950225);

						case 3:
							return new mp.Vector3(0.244625, -0.057675, 0.951125);

						case 4:
							return new mp.Vector3(0.249675, -0.041475, 0.95205);

						case 5:
							return new mp.Vector3(0.257575, -0.0256, 0.9532);

						case 6:
							return new mp.Vector3(0.2601, -0.008175, 0.954375);
					}
					break;

				case 2:
					switch (param0) {
						case 0:
							return new mp.Vector3(-0.2359, -0.1091, 0.9483);

						case 1:
							return new mp.Vector3(-0.221025, -0.100675, 0.949);

						case 2:
							return new mp.Vector3(-0.20625, -0.092875, 0.949725);

						case 3:
							return new mp.Vector3(-0.193225, -0.07985, 0.950325);

						case 4:
							return new mp.Vector3(-0.1776, -0.072, 0.951025);

						case 5:
							return new mp.Vector3(-0.165, -0.060025, 0.951825);

						case 6:
							return new mp.Vector3(-0.14895, -0.05155, 0.95255);
					}
					break;
				case 3:
					switch (param0) {
						case 0:
							return new mp.Vector3(-0.5765, 0.2229, 0.9482);

						case 1:
							return new mp.Vector3(-0.558925, 0.2197, 0.949175);

						case 2:
							return new mp.Vector3(-0.5425, 0.213025, 0.9499);

						case 3:
							return new mp.Vector3(-0.525925, 0.21105, 0.95095);

						case 4:
							return new mp.Vector3(-0.509475, 0.20535, 0.9519);

						case 5:
							return new mp.Vector3(-0.491775, 0.204075, 0.952825);

						case 6:
							return new mp.Vector3(-0.4752, 0.197525, 0.9543);
					}
					break;
			}
		} else {
			switch (param1) {
				case 0:
					switch (param0) {
						case 0:
							return new mp.Vector3(0.6083, 0.3523, 0.94795);

						case 1:
							return new mp.Vector3(0.598475, 0.366475, 0.948925);

						case 2:
							return new mp.Vector3(0.589525, 0.3807, 0.94975);

						case 3:
							return new mp.Vector3(0.58045, 0.39435, 0.950375);

						case 4:
							return new mp.Vector3(0.571975, 0.4092, 0.951075);

						case 5:
							return new mp.Vector3(0.5614, 0.4237, 0.951775);

						case 6:
							return new mp.Vector3(0.554325, 0.4402, 0.952525);
					}
					break;

				case 1:
					switch (param0) {
						case 0:
							return new mp.Vector3(0.3431, -0.0527, 0.94855);

						case 1:
							return new mp.Vector3(0.348575, -0.0348, 0.949425);

						case 2:
							return new mp.Vector3(0.35465, -0.018825, 0.9502);

						case 3:
							return new mp.Vector3(0.3581, -0.001625, 0.95115);

						case 4:
							return new mp.Vector3(0.36515, 0.015275, 0.952075);

						case 5:
							return new mp.Vector3(0.368525, 0.032475, 0.95335);

						case 6:
							return new mp.Vector3(0.373275, 0.0506, 0.9543);
					}
					break;

				case 2:
					switch (param0) {
						case 0:
							return new mp.Vector3(-0.116, -0.1501, 0.947875);

						case 1:
							return new mp.Vector3(-0.102725, -0.13795, 0.948525);

						case 2:
							return new mp.Vector3(-0.08975, -0.12665, 0.949175);

						case 3:
							return new mp.Vector3(-0.075025, -0.1159, 0.949875);

						case 4:
							return new mp.Vector3(-0.0614, -0.104775, 0.9507);

						case 5:
							return new mp.Vector3(-0.046275, -0.095025, 0.9516);

						case 6:
							return new mp.Vector3(-0.031425, -0.0846, 0.952675);
					}
					break;

				case 3:
					switch (param0) {
						case 0:
							return new mp.Vector3(-0.5205, 0.1122, 0.9478);

						case 1:
							return new mp.Vector3(-0.503175, 0.108525, 0.94865);

						case 2:
							return new mp.Vector3(-0.485125, 0.10475, 0.949175);

						case 3:
							return new mp.Vector3(-0.468275, 0.099175, 0.94995);

						case 4:
							return new mp.Vector3(-0.45155, 0.09435, 0.95085);

						case 5:
							return new mp.Vector3(-0.434475, 0.089725, 0.95145);

						case 6:
							return new mp.Vector3(-0.415875, 0.0846, 0.9523);
					}
					break;
			}
		}

		return new mp.Vector3(0, 0, 0);
	}

	public getTableHeading(table: number) {
		switch (table) {
			case 0:
				return -134.69;

			case 1:
				return 45.31;

			case 2:
				return 135.31;

			case 3:
				return 135.31;
		}

		return 0.0;
	}

	public getCardRotation(iParam0: number, iParam1: number, bParam2: boolean) {
		let vVar0: number[] = [0, 0, 0];

		if (!bParam2) {
			switch (iParam1) {
				case 0:
					switch (iParam0) {
						case 0:
							vVar0 = [0, 0, 69.12];
							break;

						case 1:
							vVar0 = [0, 0, 67.8];
							break;

						case 2:
							vVar0 = [0, 0, 66.6];
							break;

						case 3:
							vVar0 = [0, 0, 70.44];
							break;

						case 4:
							vVar0 = [0, 0, 70.84];
							break;

						case 5:
							vVar0 = [0, 0, 67.88];
							break;

						case 6:
							vVar0 = [0, 0, 69.56];
							break;
					}
					break;

				case 1:
					switch (iParam0) {
						case 0:
							vVar0 = [0, 0, 22.11];
							break;

						case 1:
							vVar0 = [0, 0, 22.32];
							break;

						case 2:
							vVar0 = [0, 0, 20.8];
							break;

						case 3:
							vVar0 = [0, 0, 19.8];
							break;

						case 4:
							vVar0 = [0, 0, 19.44];
							break;

						case 5:
							vVar0 = [0, 0, 26.28];
							break;

						case 6:
							vVar0 = [0, 0, 22.68];
							break;
					}
					break;

				case 2:
					switch (iParam0) {
						case 0:
							vVar0 = [0, 0, -21.43];
							break;

						case 1:
							vVar0 = [0, 0, -20.16];
							break;

						case 2:
							vVar0 = [0, 0, -16.92];
							break;

						case 3:
							vVar0 = [0, 0, -23.4];
							break;

						case 4:
							vVar0 = [0, 0, -21.24];
							break;

						case 5:
							vVar0 = [0, 0, -23.76];
							break;

						case 6:
							vVar0 = [0, 0, -19.44];
							break;
					}
					break;

				case 3:
					switch (iParam0) {
						case 0:
							vVar0 = [0, 0, -67.03];
							break;

						case 1:
							vVar0 = [0, 0, -69.12];
							break;

						case 2:
							vVar0 = [0, 0, -64.44];
							break;

						case 3:
							vVar0 = [0, 0, -67.68];
							break;

						case 4:
							vVar0 = [0, 0, -63.72];
							break;

						case 5:
							vVar0 = [0, 0, -68.4];
							break;

						case 6:
							vVar0 = [0, 0, -64.44];
							break;
					}
					break;
			}
		} else {
			switch (iParam1) {
				case 0:
					switch (iParam0) {
						case 0:
							vVar0 = [0, 0, 68.57];
							break;

						case 1:
							vVar0 = [0, 0, 67.52];
							break;

						case 2:
							vVar0 = [0, 0, 67.76];
							break;

						case 3:
							vVar0 = [0, 0, 67.04];
							break;

						case 4:
							vVar0 = [0, 0, 68.84];
							break;

						case 5:
							vVar0 = [0, 0, 65.96];
							break;

						case 6:
							vVar0 = [0, 0, 67.76];
							break;
					}
					break;

				case 1:
					switch (iParam0) {
						case 0:
							vVar0 = [0, 0, 22.11];
							break;

						case 1:
							vVar0 = [0, 0, 22];
							break;

						case 2:
							vVar0 = [0, 0, 24.44];
							break;

						case 3:
							vVar0 = [0, 0, 21.08];
							break;

						case 4:
							vVar0 = [0, 0, 25.96];
							break;

						case 5:
							vVar0 = [0, 0, 26.16];
							break;

						case 6:
							vVar0 = [0, 0, 28.76];
							break;
					}
					break;

				case 2:
					switch (iParam0) {
						case 0:
							vVar0 = [0, 0, -14.04];
							break;

						case 1:
							vVar0 = [0, 0, -15.48];
							break;

						case 2:
							vVar0 = [0, 0, -16.56];
							break;

						case 3:
							vVar0 = [0, 0, -15.84];
							break;

						case 4:
							vVar0 = [0, 0, -16.92];
							break;

						case 5:
							vVar0 = [0, 0, -14.4];
							break;

						case 6:
							vVar0 = [0, 0, -14.28];
							break;
					}
					break;

				case 3:
					switch (iParam0) {
						case 0:
							vVar0 = [0, 0, -67.03];
							break;

						case 1:
							vVar0 = [0, 0, -67.6];
							break;

						case 2:
							vVar0 = [0, 0, -69.4];
							break;

						case 3:
							vVar0 = [0, 0, -69.04];
							break;

						case 4:
							vVar0 = [0, 0, -68.68];
							break;

						case 5:
							vVar0 = [0, 0, -66.16];
							break;
						case 6:
							vVar0 = [0, 0, -63.28];
							break;
					}
					break;
			}
		}

		return vVar0;
	}
}

export default new CasinoBlackJack();
