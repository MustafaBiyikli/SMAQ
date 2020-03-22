#include <iostream>

#include "ADS1115.h"
#include "wiringPiI2C.h"

using namespace std;

void ADS1115::ADS1115config(int fd_ADS1115, int samplingRate)
{
    //	Set PGA/voltage range -> GAIN=1
    uint16_t config = ADS1115_DEFAULT;
    config &= ~ADS1115_PGA_MASK;
    config |= ADS1115_PGA_4_096V;

    //	Set sample speed
    config &= ~ADS1115_DR_MASK;
    config |= (samplingRate << 5);

    // write the config
    wiringPiI2CWriteReg16(fd_ADS1115, ADS1115_POINTER_CONFIG, ((config >> 8) | (config << 8)));
}

uint16_t ADS1115::read_ADS1115_Register(int fd_ADS1115, uint8_t reg)
{
    wiringPiI2CWrite(fd_ADS1115, ADS1115_POINTER_CONVERSION);

    uint16_t reading = wiringPiI2CReadReg16(fd_ADS1115, reg);

    reading = (reading >> 8) | (reading << 8);

    return reading;
}

uint16_t ADS1115::read_ADS1115_Channel(int fd_ADS1115, uint8_t channel)
{
    (channel > 3) ? channel = 3 : channel = channel;

    // Read the config
    wiringPiI2CWrite(fd_ADS1115, ADS1115_POINTER_CONFIG);
    uint16_t config = wiringPiI2CReadReg16(fd_ADS1115, ADS1115_POINTER_CONFIG);
    config = (config >> 8) | (config << 8);

    //	Set single-ended channel or differential mode
    config &= ~ADS1115_MUX_MASK;
    config |= ((channel | 4) << 12);

    // Start single conversion
    config |= ADS1115_OS_SINGLE;

    wiringPiI2CWriteReg16(fd_ADS1115, ADS1115_POINTER_CONFIG, ((config >> 8) | (config << 8)));

    // Now, wait for the conversion to complete
    uint16_t result;
    while (1)
    {
        result = wiringPiI2CReadReg16(fd_ADS1115, ADS1115_POINTER_CONFIG);
        result = (result >> 8) | (result << 8);
        if ((result & ADS1115_OS_MASK) != 0)
        {
            break;
        }
    }

    result = read_ADS1115_Register(fd_ADS1115, ADS1115_POINTER_CONVERSION);

    if ((channel < 4) && (result < 0))
    {
        throw runtime_error("ADS1115 read error");
        return 0;
    }
    else
    {
        return result;
    }
}
