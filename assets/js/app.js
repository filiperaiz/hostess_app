const axios = require('axios');
const socket = io.connect('http://localhost:3030/');
const moment = require('moment');
const electron = require('electron').remote;

const ip = require('ip');
const config = {};
config.ip = ip.address();
config.port = 3030;

moment.locale('pt-br');

const vm = new Vue({
	el: '#app',
	data: {
		pathUrl: 'https://my-json-server.typicode.com/filiperaiz/pwa_db/hospital/0',
		headers: { headers: { 'Content-Type': 'application/json' } },
		hospital: {},
		user: {},
		lastCalledList: [],
		calledUser: false,
		currentTime: null,
		currentDate: null,
		copyright: 'Tecnologia em Gestão de Atendimento',
		logoHostess: 'assets/img/hostess.png',
		showModal: false,
		endpoint: '',
		urlIp: `http://${config.ip}:${config.port}/`,

		voiceSpeech: new window.SpeechSynthesisUtterance(),
		voiceSynth: window.speechSynthesis,
		voiceList: [],
		voiceSelected: 0,
		voicePitch: 14, // De [0 - 20], defaults to 10
		voiceRate: 8, // De [0 - 10], defaults to 10
		voiceVolume: 10, // De [0 - 10], defaults to 10

		fakeApi: [],
		fakeApiActive: false,
		fakeApiTime: 1 * 10000,
		fakeApiCount: 0,
		fakeApiCountLimit: 50,
		fakeSetInterval: null,

		closeApp: electron.getCurrentWindow()
	},

	mounted() {
		this.voiceList = this.voiceSynth.getVoices();

		if (this.voiceList.length) {
			console.log(this.voiceList);
		}

		this.voiceSynth.onvoiceschanged = () => {
			this.voiceList = this.voiceSynth.getVoices();
		};

		this.showModal = false;
		this.getDateHour();

		if (localStorage.getItem('endpoint')) {
			this.getInfoClientStorage();
		}
	},

	computed: {
		lastCalls: function() {
			return this.lastCalledList.slice(0, 4);
		}
	},

	methods: {
		getDateHour() {
			setInterval(() => {
				this.currentTime = moment().format('LTS');
			}, 1 * 1000);

			this.currentDate = moment().format('dddd, DD MMMM');
		},

		getCalledUser(calledUser) {
			const name = calledUser.name.split(' ');
			const firstName = name[0];
			const lastName = name[name.length - 1];
			const shortName = `${firstName} ${lastName}`;

			const dest = calledUser.destination.split('-');
			const destination = dest[0];
			const floor = dest[dest.length - 1];

			let treatmentLabel = false;
			let treatment = calledUser.treatment || '';

			const treatmentArray = treatment.split(' ');

			if (treatmentArray[0].toLowerCase() == 'acompanhante') {
				treatment = 'Acompanhante de';
				treatmentLabel = true;
			} else {
				treatment = '';
			}

			const params = {
				label: treatmentLabel,
				treatment: treatment,
				fullname: calledUser.name,
				shortname: shortName,
				destination: destination,
				floor: floor === destination ? '' : floor,
				photo: calledUser.photo
			};

			console.log(`=================================`);
			console.log('Chamada entrada:', calledUser);
			console.log('Chamada saida:', params);

			this.voiceCalledUser(params);
		},

		voiceCalledUser(calledUser) {
			let article = 'ao';

			if (calledUser.destination.toLowerCase().includes('sala') || calledUser.destination.toLowerCase().includes('gestão')) {
				article = 'à';
			}

			let voiceMessage = `${calledUser.treatment} ${calledUser.fullname}, por favor, dirija-se ${article} ${calledUser.destination} ${calledUser.floor}.`;

			voiceMessage = voiceMessage.replace(/  +/g, ' ');

			console.log(`Mensagem formatada: ${JSON.stringify(voiceMessage)}`);

			if ('speechSynthesis' in window) {
				this.voiceSpeech.rate = this.voiceRate / 10;
				this.voiceSpeech.pitch = (this.voicePitch / 20) * 2;
				this.voiceSpeech.volume = this.voiceVolume / 10;
				this.voiceSpeech.voice = this.voiceList[this.voiceSelected];
				this.voiceSpeech.text = JSON.stringify(voiceMessage);

				this.voiceSynth.speak(this.voiceSpeech);

				this.voiceSpeech.onstart = () => {
					this.user = calledUser;
					this.listLastCalls(calledUser);
					this.calledUser = true;
				};

				this.voiceSpeech.onend = () => {
					this.user = {};
					this.calledUser = false;
				};
			}
		},

		listLastCalls(calledUser) {
			let addItem = true;

			if (this.lastCalledList.length > 0) {
				const listLastFour = this.lastCalledList.slice(0, 4);

				for (let element of listLastFour) {
					const nameBoolean = Object.is(element.fullname, calledUser.fullname);
					const destinationBoolean = Object.is(element.destination, calledUser.destination);

					if (nameBoolean && destinationBoolean) {
						addItem = false;
						break;
					}
				}
			}

			if (addItem) {
				calledUser.time = moment().format('YYYYMMDD, h:mm:ss a');
				this.lastCalledList = [calledUser].concat(this.lastCalledList);
			}
		},

		updateTimeAgo(time) {
			if (this.lastCalledList.length > 0) {
				return moment(time, 'YYYYMMDD, hh:mm:ss a').fromNow();
			}
		},

		openModalSettings() {
			this.showModal = true;

			if (localStorage.getItem('endpoint')) {
				this.endpoint = localStorage.getItem('endpoint');
			}
		},

		getSettings() {
			if (!localStorage.getItem('endpoint') && this.endpoint !== '') {
				this.getInfoClient(this.endpoint);
			}

			this.fakeApiActive ? this.getFakeApi() : this.stopFakeApi();

			this.showModal = false;
		},

		getInfoClient(endpoint) {
			axios
				.get(endpoint, this.headers)
				.then(response => {
					this.hospital.name = response.data.name;
					this.hospital.logo = response.data.logo;

					localStorage.setItem('endpoint', this.endpoint);
					localStorage.setItem('infoClient', JSON.stringify(response.data));
				})
				.catch(error => {
					this.endpoint = null;
					alert('Url invalida');
				});
		},

		getInfoClientStorage() {
			let infoClient = JSON.parse(localStorage.getItem('infoClient'));
			this.hospital.name = infoClient.name;
			this.hospital.logo = infoClient.logo;
		},

		close() {
			this.closeApp.close();
		},

		getFakeApi() {
			axios.get(`https://randomuser.me/api/?results=${this.fakeApiCountLimit}&inc=name,picture&nat=BR`).then(response => {
				this.fakeApi = response.data.results;
			});

			this.fakeSetInterval = setInterval(() => {
				if (this.fakeApiCount === this.fakeApiCountLimit) {
					this.fakeApiCount = 0;
				}

				let params = {};
				let idx = this.fakeApiCount++;

				let name = `${this.fakeApi[idx].name.first} Pereira Costa ${this.fakeApi[idx].name.last}`;
				let destination = `Guichê ${idx + 1} - Recepção térreo`;
				let photo = `${this.fakeApi[idx].picture.large}`;

				params = {
					name: name,
					destination: destination,
					photo: photo
				};

				if (idx % 2 !== 0) {
					params = {
						treatment: 'Acompanhante do Sr.',
						name: name,
						destination: 'sala de recuperação',
						photo: ''
					};
				}

				axios.post(this.urlIp, params, this.headers);
			}, this.fakeApiTime);
		},

		stopFakeApi() {
			this.voiceSynth.cancel();
			clearInterval(this.fakeSetInterval);

			this.lastCalledList = [];
			this.calledUser = false;
		}
	}
});

socket.on('emitMessage', calledUser => {
	vm.getCalledUser(calledUser);
});
