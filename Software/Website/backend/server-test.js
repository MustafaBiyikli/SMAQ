let Parse = require('parse/node');
let onoff = require('onoff');
var Gpio = onoff.Gpio;


const yellowLEDgpio = new Gpio(17, 'out');	// This one will be controlled by the live Query
const redLEDgpio = new Gpio(14, 'out');	// This one will always be on to indicate the application is running

// Initialise a liveQuery client
var client = new Parse.LiveQueryClient({
	applicationId: '<liveQueryAppID>',
	serverURL: '<ws://IP:port>',
	javascriptKey: '',
	masterkey: ''
});


client.open();

var query = new Parse.Query('LED_cmd');
var subscription = client.subscribe(query);

// Test the subscription
subscription.on('open', function() {

	console.log("Subscription opened successfully!" + "\n");

});

subscription.on('update', (led_info) => {

	if (led_info.get('R_LED') == "ON") {
		console.log("Red LED is " + led_info.get("R_LED"));
		redLEDgpio.write(1);
	} else {
		console.log("Red LED is " + led_info.get("R_LED"));
		redLEDgpio.write(0);
	}

	if (led_info.get('Y_LED') == "ON") {
		console.log("Yellow LED is " + led_info.get("Y_LED"));
		yellowLEDgpio.write(1);
	} else {
		console.log("Yellow LED is " + led_info.get("Y_LED"));
		yellowLEDgpio.write(0);
	}

});

process.on('SIGINT', function() {
	console.log("\n" + "Unsubscribing...");
	subscription.unsubscribe(client);
	console.log("Closing client...");
	client.close();
	console.log("Exiting process...");
	process.exit();
});

// Initialize Parse Server
Parse.initialize('<AppID>', '<MasterKey>');
Parse.serverURL = "serverURL:port/parse"

// Real-Time GPIO status update

var input21 = new Gpio(21, 'in', 'rising');

// Query the LED_cmd class
const LED_cmd = Parse.Object.extend("Pi_GPIOs");
const inputGPIO = new Parse.Query(LED_cmd);

var preValue = -1;
function read() {
	input21.read(function(err, value) {

		if (err) {
			throw(err);
		}

		// Push and Write changes to Server
		if (preValue != value) {
			console.log(value);
			preValue = value;
			inputGPIO.get("P7Y9cbXYHq").then((object) => {
				if (value == 1) {
					object.set("GPIO21", "HIGH");
				} else {
					object.set("GPIO21", "LOW");
				}
				object.save().then(function(m) {
					console.log("Successfully saved!");
				}).catch(function(err) {
					console.log("Save Error!");
					process.exit();
				});
			});
		}
	});
}

setInterval(read, 100);
