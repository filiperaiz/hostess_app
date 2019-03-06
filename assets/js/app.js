const axios = require('axios');
const socket = io.connect('http://localhost:3030/');
const moment = require('moment');

moment.locale('pt-br')

const vm = new Vue({
    el: '#app',
    data: {
        pathUrl: 'https://my-json-server.typicode.com/filiperaiz/pwa_db/hospital/0',
        config: {
            headers: { 'Content-Type': 'application/json' }
        },
        hospital: {},
        user: {},
        lastCalledList: [],
        callUser: false,
        currentTime: null,
        currentDate: null,
        num: 0,
        fakeApi: [],
        copyright: '© 2019. Hostess. Todos os Direitos Reservados.',
    },

    computed: {
        lastCalls: function () {
            return this.lastCalledList.slice(0, 4);
        }      
    },

    methods: {
        showCallUser(itemCall) {
            this.user = {};
            this.user.photo = itemCall.photo;
            this.user.name = itemCall.name;
            this.user.destination = itemCall.destination;

            this.callUser = true;

            this.voiceCallUser(itemCall)
        },

        async voiceCallUser(itemCall) {
            let treatment = itemCall.treatment || '';

            treatment = treatment.replace(/Sr\./g, '').replace(/Sra\./g, '');

            let voiceMessage = `${treatment} ${itemCall.name}, por favor, dirija-se ao ${itemCall.destination}.`;

            voiceMessage = voiceMessage.replace(/  +/g, ' ');
            
            this.listLastCalls(itemCall)
            
            const self = this

            if ('speechSynthesis' in window) {
                const synth = window.speechSynthesis;
                const speech = new SpeechSynthesisUtterance();

                speech.lang = 'pt-BR';
                speech.rate = 0.8;
                speech.volume = 1;
                speech.text = voiceMessage;
                await synth.speak(speech);

                speech.onend = function(event) {
                    console.log('Speech has finished');
                    self.hideCallUser(event.elapsedTime / 3)
                }
              }
        },

        listLastCalls(item) {
            let addItem = true;

            item.time = moment().format('YYYYMMDD, h:mm:ss a')

            if (this.lastCalledList.length > 0) {
                for (let element of this.lastCalledList) {
                    if (element.name === item.name ) {
                        console.log(`Element: ${element.name} === Item: ${item.name}`);
                        console.log(`Element: ${element.destination} === Item: ${item.destination}`);
                    }
                    
                    if (element.name === item.name && element.destination === item.destination) {
                        addItem = false
                        break
                    }
                }
            }

            if (addItem) {
                this.lastCalledList = [item].concat(this.lastCalledList);
            }
        },

        hideCallUser(time) {
            setTimeout(() => {
                this.callUser = false;
            }, time);
        },

        updateLastCall(time) {
            if (this.lastCalledList.length > 0) {
                return moment(time, 'YYYYMMDD, hh:mm:ss a').fromNow()
            }
        },
    },

    created: function () {
        // get information hospital
        axios.get(this.pathUrl, this.config).then(response => {
            this.hospital.name = response.data.name;
            this.hospital.logo = response.data.logo;
        });
        
        // Updates the clock every second
        setInterval(() => {
            this.currentTime = moment().format('LTS');
        }, 1 * 1000);

        // update the current date
        this.currentDate = moment().format('LL');

        // Fake api generator call users
        axios.get(`https://randomuser.me/api/?results=100&inc=name,picture&nat=BR`).then(response => {
            this.fakeApi = response.data.results
        });

        setInterval(() => {
            if (this.num === 10) {
                this.num = 0
            }

            let n = this.num++
          
            let name = `${this.fakeApi[n].name.first} ${this.fakeApi[n].name.last}`
            let photo = `${this.fakeApi[n].picture.large}`

            let params ={
                name: name,
                destination: `Guichê ${n + 1}`,
                photo: photo
            }

            axios.post(`http://192.168.0.13:3030/`, params, this.config)
        }, 1 * 10000);
    }
});

socket.on('emitMessage', message => {
    vm.showCallUser(message);
});


