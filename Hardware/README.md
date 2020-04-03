# --WORK IN PROGRESS--

# Hardware Section
#### From this list you can navigate through different files needed for the reproduction SMAQ Board
* [3D Files](https://github.com/MustafaBiyikli/SMAQ/tree/master/Hardware/3D%20Files) 
|This is where you can find the STEP file and a 3DPDF of our board.
* [Board Assembly](https://github.com/MustafaBiyikli/SMAQ/tree/master/Hardware/Board%20Assembly) 
|Any info regarding Mechanical, BOM and Assembly can be found here.
* [HW_Resources](https://github.com/MustafaBiyikli/SMAQ/tree/master/Hardware/HW_Resources) 
|Various images and graphics.
* [PCB Manufacturing](https://github.com/MustafaBiyikli/SMAQ/tree/master/Hardware/PCB%20Manufacturing)
|This folder contains the Gerber output and Drill info and is ready for production.  
* [Source Files](https://github.com/MustafaBiyikli/SMAQ/tree/master/Hardware/Source%20Files)
|Custom made Libraries, Schematics and PCB documents made with Altium Designer 20.0.13
* [Schematics]() Coming soon

### You can have a look on the files above or follow the [full board design]() documentation where all the above information is gathered in one place


## The design of the PCB
The Pcb design process is discussed below in summary explaining vital choices that are made and the component selection process.
Since the idea of constructing an Air Quality Monitoring was established a thorough search on available technologies was conducted in order to find the most compatible sensors available. The main focus was on finding robust accurate and up to date Environmental sensors with regards to Temperature sensing and Hazardous gas detection.
Sensors from high-end companies like Bosch and Sensortech were chosen. To add extra capabilities to our product a proximity and light intensity sensor from VISHAY was chosen. All Sensors except the Gas Sensor are digital and accomodate the I2C protocol. Lasyl, an OLED screen, an class D audio amplifier and an analogue microphone circuitry was realised to accomodate user interaction facilities.

The library for the parts used in the SMAQ are custom made to fit the needs of our product. All parts were carefully chosen according to recommendations from the sensor companies and to the highest possible quality. Companies like Panasonic, Kemet, TDK and Texas Instruments were considered in our design.

A list of all components can be found [here](). The function of our board is to regularly scan the environmental conditions of a room (Temperature, Pressure, Humidity, various Gases etc.) and output them to a website and when prompted to the screen. Therefore a single double-sided PCB was accomplished and schematics were made with appropriate connections and protection circuits. The software used for the design process is Altium Designer.

Here is the PCB layout sent to the services to be printed.
<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/UofG-Board-etching-FRONT.png" width="350"/> <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/UofG-Board-etching-BACK.png" width="350"/> 
</p>


After ordering the components a small prototype was made with some components to test them. Due to the nature of the small packages that were chosen  a full scale protoype was not applicable.

<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/ArduinoSMAQPrototype.png"/>
</p>


Also some images showing the manufacturing process of our board can be found on this section.
The fabrication process of the PCB was done through the Tech Services of the School Of Engineering on University of Glasgow.


<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/FrontSideBoard.png" width="320"/> <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/BackSideBoard.png" width="350"/> 
</p>


After the board was etched a surface clean up and board oultine shaping commenced resulting to the finished shape of the board.

<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/ONE.png" width="328"/> 
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/BoardGIF.gif" width="400"/> <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/Finished.png" width="350"/> 
</p>
