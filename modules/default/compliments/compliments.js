/* global Log, Module, moment */

/* Magic Mirror
 * Module: Compliments
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("compliments", {

	// Module config defaults.
	defaults: {
		compliments: {
			anytime: [
				"Hey Sugar Plum! How you doin\' ;)",
				"For we are God\’s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
				"Finally, Kelsey, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.",
				"Anyone who listens to the word but does not do what it says is like someone who looks at his face in a mirror",
				"Charm is deceptive, and beauty is fleeting; but a woman who fears the LORD is to be praised.",
				"Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
				"Come to me, all you who are weary and burdened, and I will give you rest. -Jesus",
				"Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful.",
				"Cast your cares on the LORD and he will sustain you; he will never let the righteous be shaken.",
				"Even though I walk through the darkest valley,I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
				"When I am afraid, I put my trust in you.",
				"For I know the plans I have for you,” declares the LORD, “plans to prosper you and not to harm you, plans to give you hope and a future.",
				"You\'re Ian\'s favorite",
				"God loves you and so do I -Ian",
				"And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
				"May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.",
				"The greatest glory in living lies not in never falling, but in rising every time we fall.",
				"Kelsey who has a why to live can bear any how - with God ;P",
				"Being defeated is often a temporary condition. Giving up is what makes it permanent.",
				"Be-U-tiful"
				
			],
			morning: [
				"Good morning, Gorgeous!",
				"Have the best day ever!",
				"How was your sleep?"
			],
			afternoon: [
				"Hello, beautiful!",
				"You look sexy!",
				"Looking good today!"
			],
			evening: [
				"Woah, you look hot!",
				"You take my breath away!",
				"Hi, sexy!"
			]
		},
		updateInterval: 300000,
		remoteFile: null,
		fadeSpeed: 2000
	},

	// Set currentweather from module
	currentWeatherType: "",

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.lastComplimentIndex = -1;

		if (this.config.remoteFile != null) {
			this.complimentFile((response) => {
				this.config.compliments = JSON.parse(response);
			});
		}

		// Schedule update timer.
		var self = this;
		setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},

	/* randomIndex(compliments)
	 * Generate a random index for a list of compliments.
	 *
	 * argument compliments Array<String> - Array with compliments.
	 *
	 * return Number - Random index.
	 */
	randomIndex: function(compliments) {
		if (compliments.length === 1) {
			return 0;
		}

		var generate = function() {
			return Math.floor(Math.random() * compliments.length);
		};

		var complimentIndex = generate();

		while (complimentIndex === this.lastComplimentIndex) {
			complimentIndex = generate();
		}

		this.lastComplimentIndex = complimentIndex;

		return complimentIndex;
	},

	/* complimentArray()
	 * Retrieve an array of compliments for the time of the day.
	 *
	 * return compliments Array<String> - Array with compliments for the time of the day.
	 */
	complimentArray: function() {
		var hour = moment().hour();
		var compliments;

		if (hour >= 3 && hour < 12 && this.config.compliments.hasOwnProperty("morning")) {
			compliments = this.config.compliments.morning.slice(0);
		} else if (hour >= 12 && hour < 17 && this.config.compliments.hasOwnProperty("afternoon")) {
			compliments = this.config.compliments.afternoon.slice(0);
		} else if(this.config.compliments.hasOwnProperty("evening")) {
			compliments = this.config.compliments.evening.slice(0);
		}

		if (typeof compliments === "undefined") {
			compliments = new Array();
		}

		if (this.currentWeatherType in this.config.compliments) {
			compliments.push.apply(compliments, this.config.compliments[this.currentWeatherType]);
		}

		compliments.push.apply(compliments, this.config.compliments.anytime);

		return compliments;
	},

	/* complimentFile(callback)
	 * Retrieve a file from the local filesystem
	 */
	complimentFile: function(callback) {
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open("GET", this.file(this.config.remoteFile), true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

	/* complimentArray()
	 * Retrieve a random compliment.
	 *
	 * return compliment string - A compliment.
	 */
	randomCompliment: function() {
		var compliments = this.complimentArray();
		var index = this.randomIndex(compliments);

		return compliments[index];
	},

	// Override dom generator.
	getDom: function() {
		var complimentText = this.randomCompliment();

		var compliment = document.createTextNode(complimentText);
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright";
		wrapper.appendChild(compliment);

		return wrapper;
	},


	// From data currentweather set weather type
	setCurrentWeatherType: function(data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
	},


	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		if (notification == "CURRENTWEATHER_DATA") {
			this.setCurrentWeatherType(payload.data);
		}
	},

});
