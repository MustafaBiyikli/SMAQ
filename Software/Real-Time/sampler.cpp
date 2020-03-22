#include <iostream>
#include <thread>
#include <ostream>

#include "sampler.h"
#include "VCNL4010.h"
#include "BME280.h"
#include "ADS1115.h"
#include "wiringPiI2C.h"

using namespace std;

BME280 *bme280 = new BME280();
VCNL4010 *vcnl4010 = new VCNL4010();
ADS1115 *ads1115 = new ADS1115();

Communicate::Communicate()
{
    fd_VCNL4010 = wiringPiI2CSetup(VCNL4010_ADDRESS);
    if (fd_VCNL4010 < 0)
        throw "I2C communication failed";

    fd_BME280 = wiringPiI2CSetup(BME280_ADDRESS);
    if (fd_BME280 < 0)
        throw "I2C communication failed";

    fd_ADS1115 = wiringPiI2CSetup(ADS1115_ADDRESS);
    if (fd_ADS1115 < 0)
        throw "I2C communication failed";
}

void Communicate::setCallBack(Callback *cb)
{
    callback = cb;
}

void Communicate::run(Communicate *communicate)
{
    communicate->running = 1;

    while (communicate->running)
    {
        communicate->interruptStatus = wiringPiI2CReadReg8(communicate->fd_VCNL4010, VCNL4010_COMMAND);
        if (communicate->interruptStatus & VCNL4010_AMBIENTREADY)
        {
            // VCNL4010
            uint16_t ambientLight = vcnl4010->getAmbient(communicate->fd_VCNL4010);
            uint16_t proximity = vcnl4010->getProximity(communicate->fd_VCNL4010);

            // BME280
            float temperature = bme280->extractData(communicate->fd_BME280, bme280->TEMPERATURE);
            float pressure = bme280->extractData(communicate->fd_BME280, bme280->PRESSURE);
            float humidity = bme280->extractData(communicate->fd_BME280, bme280->HUMIDITY);
            float altitude = bme280->extractData(communicate->fd_BME280, bme280->ALTITUDE);

            // ADS1115
            uint16_t microphone = ads1115->read_ADS1115_Channel(communicate->fd_ADS1115, ads1115->MICROPHONE);
            uint16_t nh3 = ads1115->read_ADS1115_Channel(communicate->fd_ADS1115, ads1115->NH3);
            uint16_t no2 = ads1115->read_ADS1115_Channel(communicate->fd_ADS1115, ads1115->NO2);
            uint16_t co = ads1115->read_ADS1115_Channel(communicate->fd_ADS1115, ads1115->CO);

            // STORE RESULTS
            communicate->callback->hasSample(ambientLight, proximity, temperature, pressure, humidity, altitude,
                                             microphone, nh3, no2, co);
        }
    }
}

void Communicate::start(int samplingRate)
/** sampling-rates: _1HZ, _2HZ, _3HZ, _4HZ, _5HZ, _6HZ, _8HZ, _10HZ **/
{
    if (Thread)
        throw "Called while sensor is already running";
    if (samplingRate < 0 || samplingRate > 7)
        throw "Invalid sampling rate";

    // VCNL4010 configure + Set interrupt
    vcnl4010->VCNL4010config(fd_VCNL4010, samplingRate);

    // BME280 congfigure
    bme280->BME280config(fd_BME280, samplingRate);

    // ADS1115 configure
    ads1115->ADS1115config(fd_ADS1115, samplingRate);

    Thread = new thread(run, this);
}

void Communicate::stop()
{
    running = 0;
    if (Thread)
    {
        Thread->join();
        delete Thread;
        Thread = NULL;
    }
}