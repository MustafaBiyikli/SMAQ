Software related to:
- Real-Time & Sampling: for details see ```./Real-Time```
- WebApp & Server: for details see ```./Website```
- Android native app: for details see ```./Android-App```

## How it works
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/softwareFlow.png"/>

1. You will need a raspberry Pi with configured network settings. Both WiFi and Ethernet can be used. SMAQ will keep your previous data even if your pi gets disconnected.

2. C++ handles all low level I2C communications with SMAQ. No timers are used anywhere in the code. Samples are only  taken when the data is ready, <b>i.e:</b> when a hardware interrupt is fired. This assures a reliable and constant sampling rate which can be adjusted from 1 to 10 Hz.

3. Collected samples are placed in a buffer and transmitted to NodeJS over UDP port 65000.

4. Once the data is received in the backend, it is handled by a javascript data handler, ```./Website/udp_receive.js``` which stores the incoming data in CSV files.

5. Frontend javascript reads the data as it comes using jQuery.ajax and plots it on dashboard gauges allowing users to easily view the current parameters in their chosen environment. 
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/dashboard.gif" height="325"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/app-login.gif" height="325"/>
</p>

6. SMAQ will store data up to a week in CSV files and use these to plot a Dygraph. Once a week has passed, the data will follow a ring buffer logic. Oldest data will be removed and the newest will be inserted. Users can enable auto-zoom or interact with the plots manually for each parameter.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/graphs.gif" height="325"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/app-graphs.gif" height="325"/>
</p>

7. Warnings, errors, information and success related data is displayed on an alerts page with the date and time of the event. The users may subscribe to their SMAQ and receive real & immediate emails through SendGrid in production <b>i.e:</b> ```npm run start:prod```. Or developers may test the features of the WebApp using mailtrap on development <b>i.e:</b> ```npm run start:dev```
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/alerts.gif" height="325"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/app-alerts.gif" height="325"/>
</p>

8. Users are able to subscribe & unsubscribe to their SMAQs at any time they desire. Up to 5 users may subscribe to a SMAQ. All subscribed users will receive the alert emails.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/settings.gif" height="325"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/app-settings.gif" height="325"/>
</p>

9. Users are able to view SMAQ related information and access the source code through our WebApp and Android App.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/about.gif" height="325"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/app-about.gif" height="325"/>
</p>

10. Users are able to report any issues to us, developers, using the Contact page on the WebApp. Production limits these emails to valid emails only, however, development accepts both valid & invalid email addresses.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/contact.gif" height="325"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/app-contact.gif" height="325"/>
</p>

11. Your raspberry Pi will act as the server and host your WebApp over TCP/IP on port 8000. Once your WebApp is up and running, you can use your mobile app to interact with your SMAQ as well.

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

## How to run your Android Native App
In order to enhance user experience on mobile devices (Android platform) we have developed a native mobile app. Pairing the app with your SMAQ is done by providing the app with the ip address of your Raspberry Pi. <This may be automated in future realeases>
Use Android Studio to build the project and run the app on your Android device.

1. Launch Android Studio
2. File > Open ```<directory_you_cloned>/SMAQ/Software/Android-App```
3. Android Studio should automatically build the project. If not: Build > Make Project
4. Connect your device and run the app!

<b>Note: Minimum API 26: Android 8.0 (Oreo) required!</b>

### Using the Android App
<ul>
  <li> The mobile app follows exactly the same logic as the WebApp with an additional step of pairing it to your SMAQ. You will need to type the ip address of your SMAQ. The app will check if the IP address given is correct and if it is, will bind to your SMAQ and show    your dashboard. 
  </li>
  <li>See <b>How it works</b> section for demonstrations.</li>
</ul>
