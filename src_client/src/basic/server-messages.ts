const serverMessages = [
	'Voice je primarni komunikacijski kanal, text sekundari.',
	'Zabranjeno koristenje imena poznatih licnosti.',
	'Zabranjeno spominjanje drugih Servera.',
	'Zabranjen AFK na cesti i mestima gdje se aktivno odvija Roleplay.',
	'Zabranjen odlazak na teritorije gdje se odvija rat bandi.',
	'Rat za hangare dozvoljen i bandama i mafijama.',
	'Pljacke dozvoljene i bandama i mafijama.',
	'Pranje novca omogućeno iskljucivo mafijama.',
	'Ukraden prljav kes se pere u bazama organizacija.',
	'Nakon što se prljav kes opere, moze se krast iz masine.',
	'Bande proizvode marihuanu, a mafije meth i kokain.',
	'Mafije proizvode oružja veceg kalibra, dok bande manjeg.',
	'Za ulazak u suparnicki bazu potrebno imati minimalno 6 clanova.',
	'Za zauzimanje teritorije potrebno je minimalno 5 clanova sa obe strane.',
	'Za pljacku marketa potrebno je minimalno 2 člana.',
	'Za pljacku zlatare i banke potrebno je minimalno 6 clanova.',
	'Dozvoljen RK na teritorijama.',
	'Safe zone: bolnica, vlada, sud, LSPDHQ, LSCSDHQ, baze poslova, saloni vozila.',
	'Igraci su odgovorni za svoje naloge.',
	'OOC prevara protiv igraca je zabranjena.',
	'Zabranjena pretprodaja imovine/naloga za pravi novac.',
	'Zabranjena interakcija glavnog naloga sa alternativnim nalozima.',
	'Organizacijski panel se koristi putem TABLETA.',
	'Portal Servera: www.ghetto-rp.com.',
	'Pravila Servera dostupna na: www.ghetto-rp.com.',
	'Popis donacija dostupan na: www.ghetto-rp.com.',
	'Donacije se ne refundaju.',
	'Zabranjeno kidnapovanje igraca koji rade posao.',
	'Krada torbi od pljackaca je dozvoljena i bandama i mafijama.',
	'Tuniranje vozila vrse mehanicari.',
	'Korumpiranost dozvoljena uz autorizaciju Vode Lidera.',
	'PD/SD dozvoljen odlazak na mjesta za ilegalnu proizvodnju sa minimalno 12 članova.',
	'/REPORT služi za prijavu igraca.',
	'/ASKQ sluzi za kratka pitanja ili nejasnoce.',
	'Administracija je dužna prijaviti kaznu unutar 1h od izdavanja iste.',
	'Administratori prijavljuju kazne na Discord #JAIL-BAN-REPORT.',
	'Ukoliko sprovedena kazna nije zabiljezena, igrac smije traziti skidanje kazne.',
	'Radnja servera se odvija u Los Santos.',
	'Na celu drzavnih organizacija i IC radnji je Vlada.',
	'U sklopu Vlade dejstvuje i Sud.',
	'Administratori ne smiju ici na admin duznost ukoliko su sudionici RP situacije.',
];

class ServerMessages {
	private index = [];
	private interval: NodeJS.Timeout;

	private getRandomServerMessage() {
		const randomIndex = Math.floor(Math.random() * serverMessages.length);

		if (this.index.includes(randomIndex)) {
			return this.getRandomServerMessage();
		}

		return serverMessages[randomIndex];
	}

	sendRandomServerMessage() {
		if (this.interval) {
			clearInterval(this.interval);
		}

		this.interval = setInterval(() => {
			if (serverMessages.length === this.index.length) {
				this.index = [this.index[this.index.length - 1]];
			}

			const message = this.getRandomServerMessage();

			mp.gui.chat.push(`!{b91c1c}[SERVER]: !{ffffff}${message}`);
		}, 15 * 60 * 1000);
	}
}

export default new ServerMessages();
