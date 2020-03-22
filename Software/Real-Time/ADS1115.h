#ifndef __ADS1115_H__
#define __ADS1115_H__

/** I2C Address */
#define ADS1115_ADDRESS 0x48

/** Bits in the config register it's a 16-bit register */
#define ADS1115_OS_MASK 0x8000   // Operational Status Register
#define ADS1115_OS_SINGLE 0x8000 // Write - Starts a single-conversion // Read 1 = Conversion complete

/** The multiplexor */
#define ADS1115_MUX_MASK 0x7000

/** Programmable Gain Amplifier */
#define ADS1115_PGA_MASK 0x0E00
#define ADS1115_PGA_6_144V 0x0000 // +/-6.144V range = Gain 2/3
#define ADS1115_PGA_4_096V 0x0200 // +/-4.096V range = Gain 1
#define ADS1115_PGA_2_048V 0x0400 // +/-2.048V range = Gain 2 default
#define ADS1115_PGA_1_024V 0x0600 // +/-1.024V range = Gain 4
#define ADS1115_PGA_0_512V 0x0800 // +/-0.512V range = Gain 8
#define ADS1115_PGA_0_256V 0x0A00 // +/-0.256V range = Gain 16

#define ADS1115_MODE 0x0100 // 0 is continuous, 1 is single-shot default

/** Data Rate */
// 0:8Hz, 1:16Hz, 2:32Hz, 3:64Hz, 4:128Hz, 5:250Hz, 6:475Hz, 7:860Hz
#define ADS1115_DR_MASK 0x00E0 // Resets Samplingconfig for change

/** Pointer Registers */
#define ADS1115_POINTER_CONVERSION 0x00
#define ADS1115_POINTER_CONFIG 0x01
#define ADS1115_POINTER_LOW_THRESHOLD 0x10
#define ADS1115_POINTER_HIGH_THRESHOLD 0x11

/** Comparator mode */
#define ADS1115_CMODE_MASK 0x0010
#define ADS1115_CMODE_TRAD 0x0000   // Traditional comparator with hysteresis default
#define ADS1115_CMODE_WINDOW 0x0010 // Window comparator

/** Comparator polarity - the polarity of the output alert/rdy pin */
#define ADS1115_CPOL_MASK 0x0008
#define ADS1115_CPOL_ACTVLOW 0x0000 // Active low default
#define ADS1115_CPOL_ACTVHI 0x0008  // Active high

/** Latching comparator - does the alert/rdy pin latch */
#define ADS1115_CLAT_MASK 0x0004
#define ADS1115_CLAT_NONLAT 0x0000 // Non-latching comparator default
#define ADS1115_CLAT_LATCH 0x0004  // Latching comparator

/** Comparitor queue */
#define ADS1115_CQUE_MASK 0x0003
#define ADS1115_CQUE_1CONV 0x0000 // Assert after one conversions
#define ADS1115_CQUE_2CONV 0x0001 // Assert after two conversions
#define ADS1115_CQUE_4CONV 0x0002 // Assert after four conversions
#define ADS1115_CQUE_NONE 0x0003  // Disable the comparator default

#define ADS1115_DEFAULT 0x8583 // From the datasheet

class ADS1115
{
public:
    /** Declare Functions */
    void ADS1115config(int fd_ADS1115, int samplingRate);
    uint16_t read_ADS1115_Register(int fd_ADS1115, uint8_t reg);
    uint16_t read_ADS1115_Channel(int fd_ADS1115, uint8_t channel);

    // Used fot the channel variable in read_ADS1115_Channel fn
    int MICROPHONE = 0;
    int NH3 = 1;
    int NO2 = 2;
    int CO = 3;
};

#endif