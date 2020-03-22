#ifndef __VCNL4010_H__
#define __VCNL4010_H__

/** Device ID */
#define VCNL4010_ADDRESS 0x13 // I2C address of the sensor

/** Registers */
#define VCNL4010_COMMAND 0x80          // Command
#define VCNL4010_PRODUCTID 0x81        // Product ID Revision
#define VCNL4010_PROXRATE 0x82         // Proximity rate
#define VCNL4010_IRLED 0x83            // IR LED current
#define VCNL4010_AMBIENTPARAMETER 0x84 // Ambient light parameter
#define VCNL4010_AMBIENTDATA 0x85      // Ambient light result (16 bits)
#define VCNL4010_PROXIMITYDATA 0x87    // Proximity result (16 bits)
#define VCNL4010_INTCONTROL 0x89       // Interrupt control
#define VCNL4010_LOWTHRESHOLD 0x8A     // Low threshold value (16 bits)
#define VCNL4010_HITHRESHOLD 0x8C      // High threshold value (16 bits)
#define VCNL4010_INTSTAT 0x8E          // Interrupt status
#define VCNL4010_MODTIMING 0x8F        // Proximity modulator timing adjustment

/** Values for command register */
#define VCNL4010_MEASUREPROXIMITY 0x03 // Start a single on-demand proximity measurement
#define VCNL4010_MEASUREAMBIENT 0x05   // Start a single on-demand ambient light measurement
#define VCNL4010_MEASUREBOTH 0x07      // Start a single on-demand simultaneous measurement
#define VCNL4010_PROXIMITYREADY 0x20   // Read-only - Value = 1 when proximity measurement data is available
#define VCNL4010_AMBIENTREADY 0x40     // Read-only - Value = 1 when ambient light measurement data is available

class VCNL4010
{
public:
    void VCNL4010config(int fd_VCNL4010, int samplingRate);
    uint16_t getAmbient(int fd_VCNL4010);
    uint16_t getProximity(int fd_VCNL4010);
};

#endif
