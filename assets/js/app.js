const axios = require('axios');
const socket = io.connect('http://localhost:3030/');
const moment = require('moment');

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
		copyright: '© 2019. Hostess. Todos os Direitos Reservados.',
		logoHostess: 'assets/img/logo-horizonatal-white.png',
		showModal: false,
		endpoint: '',
		urlIp: `http://${config.ip}:${config.port}/`,

		voiceSpeech: new window.SpeechSynthesisUtterance(),
		voiceSynth: window.speechSynthesis,
		voiceList: [],
		voiceSelected: 0,
		voicePitch: 12, // De [0 - 20], defaults to 10
		voiceRate: 8, // De [0 - 10], defaults to 10
		voiceVolume: 10, // De [0 - 10], defaults to 10

		fakeApi: [],
		fakeApiActive: false,
		fakeApiTime: 1 * 10000,
		fakeApiCount: 0,
		fakeApiCountLimit: 50,
		fakeSetInterval: null
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

			this.currentDate = moment().format('LL');
		},

		getCalledUser(calledUser) {
			this.user = calledUser;
			this.voiceCalledUser(calledUser);
		},

		voiceCalledUser(calledUser) {
			let treatment = calledUser.treatment || '';
			treatment = treatment.replace(/Sr\./g, '').replace(/Sra\./g, '');

			let voiceMessage = `${treatment} ${calledUser.name}, por favor, dirija-se ao ${calledUser.destination}.`;
			voiceMessage = voiceMessage.replace(/  +/g, ' ');

			if ('speechSynthesis' in window) {
				this.voiceSpeech.rate = this.voiceRate / 10;
				this.voiceSpeech.pitch = (this.voicePitch / 20) * 2;
				this.voiceSpeech.volume = this.voiceVolume / 10;
				this.voiceSpeech.text = voiceMessage;
				this.voiceSpeech.voice = this.voiceList[this.voiceSelected];

				this.voiceSynth.speak(this.voiceSpeech);

				this.voiceSpeech.onstart = () => {
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
				for (let element of this.lastCalledList) {
					if (element.name === calledUser.name && element.destination === calledUser.destination) {
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

		getFakeApi() {
			axios.get(`https://randomuser.me/api/?results=${this.fakeApiCountLimit}&inc=name,picture&nat=BR`).then(response => {
				this.fakeApi = response.data.results;
			});

			this.fakeSetInterval = setInterval(() => {
				if (this.fakeApiCount === this.fakeApiCountLimit) {
					this.fakeApiCount = 0;
				}

				let idx = this.fakeApiCount++;
				let name = `${this.fakeApi[idx].name.first} ${this.fakeApi[idx].name.last}`;
				let photo = `${this.fakeApi[idx].picture.large}`;

				let params = {
					name: name,
					destination: `Guichê ${idx + 1}`,
					photo: photo
				};

				axios.post(this.urlIp, params, this.headers);
			}, this.fakeApiTime);
		},

		stopFakeApi() {
			voiceSpeech.cancel();
			clearInterval(this.fakeSetInterval);

			this.lastCalledList = [];
			this.calledUser = false;
		}
	}
});

socket.on('emitMessage', calledUser => {
	vm.getCalledUser(calledUser);
});
