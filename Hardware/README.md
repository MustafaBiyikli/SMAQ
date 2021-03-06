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
| Custom made Libraries, Schematics and PCB documents made with Altium Designer 20.0.13.
* [Schematics](https://github.com/MustafaBiyikli/SMAQ/tree/master/Hardware/Schematics)
|A4 and A2 Schematics in Dynamic PDF Format are included here.

### You can have a look at the files above or follow the [full board design](https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/Hardware-Documentation.pdf) documentation where all the above information is gathered in one place


## The design of the PCB
The Pcb design process is discussed below in summary, explaining vital choices that are made and the component selection process.
Since the idea of constructing an Air Quality Monitoring was established a thorough search on available technologies was conducted to find the most compatible sensors available. The main focus was on finding robust accurate and up to date Environmental sensors with regards to Temperature sensing and Hazardous gas detection.
Sensors from high-end companies like Bosch and Sensortech were chosen. To add extra capabilities to our product, a proximity and light intensity sensor from VISHAY was chosen. All Sensors except the Gas Sensor are digital and accommodate the I2C protocol. Lastly, an OLED screen, a class D audio amplifier and an analogue microphone circuitry were realised to accommodate user interaction facilities.

The library for the parts used in the SMAQ are Custom made to fit the needs of our product. All parts were carefully chosen according to recommendations from the sensor companies and to the highest possible quality. Companies like Panasonic, Kemet, TDK and Texas Instruments were considered in our design.

A list of all components can be found [here](https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/Board%20Assembly/SMAQ-Board_DesignBOM.pdf). The function of our board is to regularly scan the environmental conditions of a room (Temperature, Pressure, Humidity, various Gases etc.) and output them to a website and when prompted — to the screen. Therefore, a single double-sided PCB was accomplished, and schematics were made with appropriate connections and protection circuits. The software used for the design process is Altium Designer.

Here is the [PCB layout](https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/UofG-Board-etching-SMAQ.pdf) sent to the services to be printed.
<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/UofG-Board-etching-FRONT.png" width="350"/> <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/UofG-Board-etching-BACK.png" width="350"/> 
</p>

And a photorealistic model of the final board.

<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/SmaqExplanation.png"/>
</p>

After ordering the components, a small prototype was made with some components to test them. Due to the nature of the small packages that were chosen, a full-scale prototype was not applicable.

<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/ArduinoSMAQPrototype.png"/>
</p>


Also, some images showing the manufacturing process of our board can be found in this section.

---
The fabrication process of the PCB was done through the Tech Services of the School Of Engineering at the University of Glasgow.


<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/FrontSideBoard.png" width="320"/> <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/BackSideBoard.png" width="350"/> 
</p>


After the board was etched a surface clean up and board outline shaping commenced resulting in the finished shape of the board.

<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/ONE.png" width="328"/> 
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/BoardGIF.gif" width="400"/> <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/Finished.png" width="350"/> 
</p>



In order to protect the board from oxidation and help the component soldering a UV curable solder mask was applied. Using transparencies of the top and bottom layout, approximately 4ml of UV solder resist was dispensed on each side. After curing the paint for 20 seconds, the transparencies were removed, and the uncured pattern was cleaned. Afterwards, the solder mask was fully cured under the UV lamp for three minutes.

<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/MakingProcess.gif"/>
</p>

To fully ensure the protection of the board, exposed pads and of the etched logo, a coat of tin (5μm) was applied on top of the exposed copper.
This was done through electroless tinning. 

<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/Tinning.gif" height="300"/> 
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/TinningBath.gif" height="300"/> 
</p>

<p>
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/Soldering.gif" height="400" align="right"/> 
</p>

All processes were done in controlled and well-ventilated areas using appropriate PPE.

The soldering process involved the use of a micro-soldering iron, hot air station, microscope and no-clean flux. 

ESD safe procedures were followed using appropriate equipment and proper grounding. To clean the board a 99.9% Isopropyl Alcohol was used. The solder used is 0.25mm Leaded 60/40 Rosin-free while a straight and chisel tip was used on different areas. 
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

---
#### The board after the manufacturing procedure with the screen assembled on 3mm standoffs fitted on top of the Raspberry Pi.
<p align="center">
<img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Hardware/HW_Resources/FinalBoard.png" width="500"/> 
</p>


## Casing
All printer ready CAD files and pdf drawings can be found under ```./Casing``` directory. We were unable to manufacture the casing due to unforseen events (COVID-19). Therefore, its ergonomics in real life are yet to be tested.
<p align="center">
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/ENG5220-SMAQ-A01.PNG" width="600"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/EN5220-SMAQ-01.PNG" width="600"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/EN5220-SMAQ-02.PNG" width="600"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/ENG5220-SMAQ-03.PNG" width="600"/>
  <img src="https://github.com/MustafaBiyikli/SMAQ/blob/master/Resources/EN5220-SMAQ-04.PNG" width="600"/>
</p>

<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/3.0/80x15.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.
