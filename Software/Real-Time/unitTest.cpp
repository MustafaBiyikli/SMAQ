#include <stdexcept>

#include "wiringPiI2C.h"
#include "BME280.h"
#include "VCNL4010.h"

using namespace std;

int testI2Ccommunication()
{
    int fd_BME280 = wiringPiI2CSetup(BME280_ADDRESS);
    int fd_VCNL4010 = wiringPiI2CSetup(VCNL4010_ADDRESS);

    if (fd_BME280 < 0) {
        throw runtime_error("BME280 communication failed");
        return -1;
    }
    if (fd_VCNL4010 < 0) {
        throw runtime_error("VCNL4010 communication failed");
        return -1;
    }
    return 0;
}

int main()
{
    testI2Ccommunication();
}

