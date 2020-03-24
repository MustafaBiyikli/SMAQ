const dgram = require("dgram");
const ab2str = require("arraybuffer-to-string");

var server = dgram.createSocket("udp4");

server.on("error", err => {
    console.log(`server error:\n${err.message}\n${err.stack}`);
});

server.on("listening", function() {
    // Listening on PORT: 65000
    console.log("Listening on port 65000");
    var address = server.address();
});

server.on("message", function(message, remote) {
    // console.log(remote.address + ":" + remote.port + " - " + message);
    var smaqData = ab2str(message);
    console.log(smaqData);
});

server.bind({
    host: "localhost",
    port: 65000
});
