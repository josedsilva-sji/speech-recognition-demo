(function($, window, document){
	var APP = {
			data: {
				$window: $(window),
				$document: $(document),
				speech: {
					recognition: null,
					grammarList: null,
					event: null,
					commands: {
						rotate(deg) {
							console.log('rotate called:', deg);
							APP.data.$demoBlock.css('transform', 'rotate(' + deg + 'deg)');
						},
						colour(colors) {
							console.log('colour called:', colors);
							APP.data.$demoBlock.css('background-color', colors.pop());
						},
						slider(direction) {
							direction = direction.pop();
							console.log('slider called:', direction);
							if (APP.cache.demKeys.includes(direction)) {
								let event = `${direction}.owl.carousel`.replace(new RegExp(APP.cache.demKeys.join('|'), 'gi'), (matched) => {return APP.cache.dirEventMap[matched];});
								let args = [];
								if (direction == 'first') {
									args.push(0);
								}
								else if (direction == 'last') {
									args.push(APP.data.slider.items - 1);
								}
								
								APP.data.slider.owl.trigger(event, args);
							}
							else {
								let offset = direction;
								if (isNaN(direction)) {
									if (['to','too','true','tu','through'].includes(direction)) {
										offset = 2;
									}
									else if (['tea','tree'].includes(direction)) {
										offset = 3;
									}
									else if (['form','for'].includes(direction)) {
										offset = 4;
									}
								}
								
								APP.data.slider.owl.trigger("to.owl.carousel", [offset - 1]);
							}
						},
						stop() {
							APP.data.speech.recognition.stop();
						}
					},
				},
				$demoBlock: null,
				slider: {
					owl: $(".owl-carousel"),
					items: null,
				}
			},
			cache: {
				commands: [],
				dirEventMap: {
					first: 'to',
					last: 'to',
					previous: 'prev',
					next: 'next',
				},
				demKeys: [],
			},
			init(){
				this.initData();
				this.initSpeechRecognition();
				this.initSlider();
				this.initAppEvents();
				
				console.log("main.js initialized");
			},
			initData() {
				this.data.$demoBlock = $("#demo-block");
				this.cache.commands = Object.keys(this.data.speech.commands);
				console.log("cached commands: ", this.cache.commands);
				this.cache.demKeys = Object.keys(this.cache.dirEventMap);
			},
			initAppEvents() {
				$("#start-recognition-button").on("click", (e) => {
					this.data.speech.recognition.start();
					console.log("Listening for command. Please speak into your MIC...");
				});
				
				$("#stop-recognition-button").on("click", (e) => {
					this.data.speech.recognition.stop();
				});
				
				this.data.$document.on("srdemo:command:received", (e, data) => {
					this.data.speech.commands[data.command](data.arguments);
				});
				
				this.data.slider.owl.on("initialized.owl.carousel", (e) => {
					this.data.slider.items = e.item.count;
				});
			},
			initSlider() {
				this.data.$document.ready(() => {
					this.data.slider.owl.owlCarousel({
						items: 1,
						margin: 10,
						center: true,
					});
				});
			},
			initSpeechRecognition() {
				var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
				var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
				//var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
				
				this.data.speech.recognition = new SpeechRecognition();
				
				this.data.speech.grammarList = new SpeechGrammarList();
				var grammar = '#JSGF V1.0; grammar commands; public <command> = ' + this.cache.commands.join(' | ') +';';
				this.data.speech.grammarList.addFromString(grammar, 1);
				
				this.data.speech.recognition.grammars = this.data.speech.grammarList;
				// set language in BCP-47 format (e.g. en-US)
				this.data.speech.recognition.lang = 'en-IN';
				// always return the final recognised result that will not change
				this.data.speech.recognition.interimResults = false;
				this.data.speech.recognition.maxAlternatives = 1;
				this.data.speech.recognition.continuous = true;
				
				this.initSpeechRecognitionEvents();
			},
			initSpeechRecognitionEvents() {
				this.data.speech.recognition.onstart = () => {
					console.log("onstart() called");
				}
				
				this.data.speech.recognition.onresult = (e) => {
					// inspect the SpeechRecognitionEvent object
					console.log("recognition.onresult: ", e);
					
					let arguments = e.results[e.resultIndex][0].transcript.trim().split(" ");
					console.log("transcript", arguments);
					let command = arguments.shift();
					command = command.toLowerCase();
					// the probability of recognition
					//var confidence = e.results[0][0].confidence;
					
					if ( (command = this.getResolvedCommand(command))) {
						this.data.$document.trigger("srdemo:command:received", [{command, arguments}]);
						console.log("triggered event: srdemo:command:received", command, arguments);
					}
					else {
						console.log("I did not understand your command");
					}
				}
				
				this.data.speech.onnomatch = (e) => {
					console.log("onnomatch() called");
				}
				
				this.data.speech.recognition.onerror = (e) => {
					console.log("onerror() called: ", e.error);
				}
				
				this.data.speech.recognition.onspeechend = () => {
					console.log("onspeechend() called");
					this.data.speech.recognition.stop();
				}
				
				this.data.speech.recognition.onend = () => {
					console.log("onend() called");
				}
			},
			getResolvedCommand(command) {
				if (this.cache.commands.includes(command)) {
					return command;
				}
				else if (['slide','light','lighter','rider','flight','lied','spider','write','life','clyde'].includes(command)) {
					return 'slider';
				}
			}
	};
	
	APP.init();
})(jQuery, window, document);