## Smart monitoring of air quality with SMAQ
<p align="center">
    <a href="https://www.youtube.com/channel/UCAZxVj2a3wnd6SI2-zsWK3Q">
        <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/SMAQLogoOld.png" width="300"/>
    </a>
</p>

SMAQ is designed to monitor the air quality in your chosen environment. The sampling rate can be adjusted from 1Hz to 10Hz. The ```./Software/Real-Time``` repo handles all low-level I2C communications and transmits the data via UDP (over port 65000) in real time as the data is sampled - to a JavaScript UDP receiver.
The UDP receiver places the data in a csv file which is then used to populate live DyGraphs and dashboard gauges for each parameter. The data is stored up to a week and follows a ring-buffer logic afterwards (storage time can be modified depending on the available disk space & user preference).
An express WebApp is launched from ```./Software/Website``` repo on port 8000 and can be accessed via url "ipofRaspberryPi:8000" within the same network.

- SMAQ is able to:
    - Sense:
        - Temperature: <b>-45 to 80 °C</b>
        - Pressure: <b>300 to 1250 hPa</b>
        - Humidity: <b>0 to 100 %</b>
        - Ambient Light: <b>0.25 to 16K lux</b>
        - Proximity: <b>1 to 200 mm</b>
        - Sound Levels: <b>0 to 100 %</b>
        - Carbon Monoxide: <b>1 to 1000 ppm</b>
        - Nitrogen Dioxide: <b>0.05 to 10 ppm</b>
        - Ammonia: <b>1 to 500 ppm</b>
    - Show the current conditions in your chosen environment with gauges
    - Store data up to a week, autozoom to 1wk | 5d | 3d | 24hr | 12 hr | 6hr | 1hr on WebApp
    - Send you immediate alerts via Email / Mobile Notifications and LEDs
    - Auto-remove your alerts when they are outdated
    - Output API data in JSON format
    - Display current conditions on an OLED display triggered by proximity
    
## PCB Design
The design files are in sub-directory ```./Hardware```
<p align="center">
    <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/A2_Full_Schematic3.png" width="800"/>
</p>

## Building and running a demo
Clone and build the project with CMake
```
git clone https://github.com/MustafaBiyikli/SMAQ.git
cd SMAQ/Software/Real-Time
cmake .
make
```
Cmake will automatically check the I2C communication and run the necesarry tests when building the project. Test your harware by running a test.
```
./demo
```

This will start printing the sensor data onto your terminal. Press ```Enter``` to stop execution.

## Running the full WebApp
Start the cpp udp_transmitter in ```./Software/Real-Time``` as a background process:
```
./udp_transmit &
```

Then cd into ```../Website``` and run:
```
npm install
```

This will install the necessary NodeJS packages for the WebApp. Then, run udp_receive.js and app.js as background processes:
```
node udp_receive.js &
node app.js &
```
You can now visit your SMAQ WebApp on url: "ipofRaspberryPi:8000"

## Killing the processes
To stop the background process, find their PIDs by:
```
ps ax
```
and kill each process by:

```
kill -HUP <PID>
```

## Viewing the WebApp without SMAQ
You can still view the WebApp without building the harware (using fake data), having cloned SMAQ into your local directory, run:
```
cd SMAQ/Software/Website
npm install
node fakeDataGenerator.js &
node app.js &
```
Killing the process follows the same logic as <b>Killing the process</b>

## Hardware - Main Components 

<p>
    <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/StraightGIF.gif" width="450" align="right"/>
</p>

See ```./Resources``` for packaging ideas and ```./Hardware``` for full details.

-   Raspberry Pi 3 Model B
-   PCB including:
    -   BME280 (Temperature, Pressure and Humidity Sensor)
    -   VCLN4010 (Proximity Sensor)
    -   SSH1106 (OLED Screen)
    -   MICS6814 (Gas Sensor)
    -   ADS1115 (ADC)
- 3D-printed casing and LED pipes

## Developers

-   [Alexandros Charitonidis](https://github.com/Alexandros-Charitonidis)
-   [Mustafa Biyikli](https://github.com/MustafaBiyikli)
-   [Katarzyna Lenard](https://github.com/KasiaLenard)

## Follow us on Social Media

<p align="left">
    <a href="">
        <img src="https://lh3.googleusercontent.com/proxy/Aknfg2Z6ps2gjaX1CIqbLo6x3zdvB0ZzkiswxI75zA1vKo1jj-3FYHqbR4JZO0YKNxtMnUomDg8hgN7XPVpsLqFouTCtIlA8V47GQP9ERInNe-_FkX_4pA" height="40"/>
    </a>
    &nbsp;  &nbsp;  &nbsp;  
    <a href="">
        <img src="https://i.pinimg.com/originals/4f/01/49/4f0149647a160a47217615866f5469c4.png" height="40"/>
    </a>
    &nbsp;  &nbsp;  &nbsp;  
    <a href="">
        <img src="https://www.aps.edu/sapr/images/pnglot.comtwitterbirdlogopng139932.png/image" height="40"/>
    </a>
    &nbsp;  &nbsp;  &nbsp;  
    <a href="">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_of_YouTube_%282015-2017%29.svg/1200px-Logo_of_YouTube_%282015-2017%29.svg.png" height="40" />
    </a>
</p>

