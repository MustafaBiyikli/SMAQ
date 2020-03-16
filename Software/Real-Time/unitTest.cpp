#include <stdexcept>

#include "wiringPiI2C.h"
#include "BME280.h"
#include "VCNL4010.h"
#include "ADS1115.h"
#include "SH1106.h"

using namespace std;

int testI2Ccommunication_BME280()
{
    int fd_BME280 = wiringPiI2CSetup(BME280_ADDRESS);
    if (fd_BME280 < 0)
    {
        throw runtime_error("BME280 communication failed");
        return -1;
    }

    return 0;
}

int testI2Ccommunication_VCNL4010()
{
    int fd_VCNL4010 = wiringPiI2CSetup(VCNL4010_ADDRESS);
    if (fd_VCNL4010 < 0)
    {
        throw runtime_error("VCNL4010 communication failed");
        return -1;
    }

    return 0;
}

int testI2Ccommunication_ADS1115()
{
    int fd_ADS1115 = wiringPiI2CSetup(ADS1115_ADDRESS);
    if (fd_ADS1115 < 0)
    {
        throw runtime_error("ADS1115 communication failed");
        return -1;
    }

    return 0;
}

int testI2Ccommunication_SH1106()
{
    int fd_SH1106 = wiringPiI2CSetup(SH1106_ADDRESS);
    if (fd_SH1106 < 0)
    {
        throw runtime_error("SH1106 communication failed");
        return -1;
    }

    return 0;
}

int main()
{
    testI2Ccommunication_BME280();
    testI2Ccommunication_VCNL4010();
    testI2Ccommunication_ADS1115();
    testI2Ccommunication_SH1106();
}
