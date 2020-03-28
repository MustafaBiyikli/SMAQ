#include <iostream>
#include <cmath>

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

float ADS1115::get_ADS1115_Converted(int fd_ADS1115, uint8_t channel)
{

    uint16_t gasValue = read_ADS1115_Channel(fd_ADS1115, channel);

    int ADC_reading = gasValue * 1000 / pow(2, 16);
    float Rs = 56 * ADC_reading / (1023 - ADC_reading);

    float ratio;
    float c = 0;

    // Resistance in clean air
    float nh3_r0 = 860;
    nh3_r0 = nh3_r0 / (1023 - nh3_r0);
    float no2_r0 = 555;
    no2_r0 = no2_r0 / (1023 - no2_r0);
    float co_r0 = 800;
    co_r0 = co_r0 / (1023 - co_r0);

    switch (channel)
    {
    case 0: // Microphone
    {
        float per = ((float)gasValue * 100) / (65536);
        c = pow(per, 0.43) * 13.8;
        break;
    }
    case 1: // NH3
    {
        ratio = Rs / nh3_r0;
        c = pow(ratio, -1.903) * 0.6151;
        break;
    }
    case 2: // NO2
    {
        ratio = Rs / 1000 / no2_r0;
        c = pow(ratio, 0.9979) * 0.1516;
        break;
    }
    case 3: // CO
    {
        ratio = Rs / co_r0;
        c = pow(ratio, -1.177) * 4.4638;
        break;
    }
    default:
        break;
    }

    return isnan(c) ? -3 : c;
}