Software related to:
- Real-Time & Sampling: for details see ```./Real-Time```
- WebApp & Server: for details see ```./Website```
- Android native app: for details see ```./Android-App-Dev```

## How it works
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/softwareFlow.png"/>

1. You will need a raspberry Pi with configured network settings. Both WiFi and Ethernet can be used. SMAQ will keep your previous data even if your pi gets disconnected.

2. C++ handles all low level I2C communications with SMAQ. No timers are used anywhere in the code. Samples are only  taken when the data is ready, <b>i.e:</b> when a hardware interrupt is fired. This assures a reliable and constant sampling rate which can be adjusted from 1 to 10 Hz.

3. Collected samples are placed in a buffer and transmitted to NodeJS over UDP port 65000.

4. Once the data is received in the backend, it is handled by a javascript data handler, ```./Website/udp_receive.js``` which stores the incoming data in CSV files.

5. Frontend javascript reads the data as it comes using jQuery.ajax and plots it on dashboard gauges allowing users to easily view the current parameters in their chosen environment.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/dashboard.gif" width="600"/>
</p>

6. SMAQ will store data up to a week in CSV files and use these to plot a Dygraph. Once a week has passed, the data will follow a ring buffer logic. Oldest data will be removed and the newest will be inserted. Users can enable auto-zoom or interact with the plots manually for each parameter.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/graphs.gif" width="600"/>
</p>

6. Warnings, errors, information and success related data is displayed on an alerts page with the date and time of the event. The users may subscribe to their SMAQ and receive real & immediate emails through SendGrid in production <b>i.e:</b> ```npm run start:prod```. Or developers may test the features of the WebApp using mailtrap on development <b>i.e:</b> ```npm run start:dev```
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/alerts.gif" width="600"/>
</p>

7. Users are able to subscribe & unsubscribe to their SMAQs at any time they desire. Up to 5 users may subscribe to a SMAQ. All subscribed users will receive the alert emails.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/settings.gif" width="600"/>
</p>

8. Users are able to report any issues to us, developers, using the Contact page on the WebApp. Production limits these emails to valid emails only, however, development accepts both valid & invalid email addresses.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/contact.gif" width="600"/>
</p>

9. Your raspberry Pi will act as the server and host your WebApp over TCP/IP on port 8000. Once your WebApp is up and running, you can use your mobile app to interact with your SMAQ as well.

## How to start your WebApp
As explained in the main page, given you have the pre-requisites installed on your raspberry Pi you will need to clone this repository, build the files, install the npm packages and start your server.

### Run in development
Running in development does not require any hardware. You can test the WebApp and its features using a fake data generator. This will limit the data storage to 60 seconds and direct your emails to <b>mailtrap</b> if you have created an account and added your details to a ```config.env``` file in ```./Website```. To run:
```
git clone https://github.com/MustafaBiyikli/SMAQ.git
cd Software/Website
npm install
npm run start:dev
```

### Run in production
Running in production requires the hardware as it fires up the ```udp_receiver.js``` which is listening for c++ udp_transmitter over port 65000. This will give you full week of data storage and send real emails to your inbox. You will still need to set a <b>SendGrid</b> account and create a ```config.env``` file in ```./Website``` with your account details. To run:
```
git clone https://github.com/MustafaBiyikli/SMAQ.git
cd Software/Real-Time
cmake .
make
./udp_transmit &
cd ../Website
npm install
npm run start:prod
```
