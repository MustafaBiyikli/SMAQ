#include <iostream>
#include <thread>
#include <ostream>
#include <cmath>

#include "BME280.h"
#include "wiringPiI2C.h"

using namespace std;

void BME280::BME280config(int fd_BME280, int samplingRate)
{
    wiringPiI2CWriteReg8(fd_BME280, 0xf2, samplingRate);                              // humidity oversampling 1, 2, 3, 4, 5
    wiringPiI2CWriteReg8(fd_BME280, 0xf4, samplingRate << 5 | samplingRate << 2 | 3); // pressure and temperature oversampling x 1, mode normal
}

int32_t BME280::getTemperatureCalibration(bme280_calib_data *cal, int32_t adc_T)
{
    int32_t var1 = ((((adc_T >> 3) - ((int32_t)cal->dig_T1 << 1))) *
                    ((int32_t)cal->dig_T2)) >>
                   11;

    int32_t var2 = (((((adc_T >> 4) - ((int32_t)cal->dig_T1)) *
                      ((adc_T >> 4) - ((int32_t)cal->dig_T1))) >>
                     12) *
                    ((int32_t)cal->dig_T3)) >>
                   14;

    return var1 + var2;
}

void BME280::readCalibrationData(int fd_BME280, bme280_calib_data *data)
{
    data->dig_T1 = (uint16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_T1);
    data->dig_T2 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_T2);
    data->dig_T3 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_T3);

    data->dig_P1 = (uint16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P1);
    data->dig_P2 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P2);
    data->dig_P3 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P3);
    data->dig_P4 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P4);
    data->dig_P5 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P5);
    data->dig_P6 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P6);
    data->dig_P7 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P7);
    data->dig_P8 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P8);
    data->dig_P9 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_P9);

    data->dig_H1 = (uint8_t)wiringPiI2CReadReg8(fd_BME280, BME280_REGISTER_DIG_H1);
    data->dig_H2 = (int16_t)wiringPiI2CReadReg16(fd_BME280, BME280_REGISTER_DIG_H2);
    data->dig_H3 = (uint8_t)wiringPiI2CReadReg8(fd_BME280, BME280_REGISTER_DIG_H3);
    data->dig_H4 = (wiringPiI2CReadReg8(fd_BME280, BME280_REGISTER_DIG_H4) << 4) | (wiringPiI2CReadReg8(fd_BME280, BME280_REGISTER_DIG_H4 + 1) & 0xF);
    data->dig_H5 = (wiringPiI2CReadReg8(fd_BME280, BME280_REGISTER_DIG_H5 + 1) << 4) | (wiringPiI2CReadReg8(fd_BME280, BME280_REGISTER_DIG_H5) >> 4);
    data->dig_H6 = (int8_t)wiringPiI2CReadReg8(fd_BME280, BME280_REGISTER_DIG_H6);
}

float BME280::compensateTemperature(int32_t t_fine)
{
    float T = (t_fine * 5 + 128) >> 8;
    return T / 100;
}

float BME280::compensatePressure(int32_t adc_P, bme280_calib_data *cal, int32_t t_fine)
{
    int64_t var1, var2, p;

    var1 = ((int64_t)t_fine) - 128000;
    var2 = var1 * var1 * (int64_t)cal->dig_P6;
    var2 = var2 + ((var1 * (int64_t)cal->dig_P5) << 17);
    var2 = var2 + (((int64_t)cal->dig_P4) << 35);
    var1 = ((var1 * var1 * (int64_t)cal->dig_P3) >> 8) +
           ((var1 * (int64_t)cal->dig_P2) << 12);
    var1 = (((((int64_t)1) << 47) + var1)) * ((int64_t)cal->dig_P1) >> 33;

    if (var1 == 0)
    {
        return 0; // avoid exception caused by division by zero
    }
    p = 1048576 - adc_P;
    p = (((p << 31) - var2) * 3125) / var1;
    var1 = (((int64_t)cal->dig_P9) * (p >> 13) * (p >> 13)) >> 25;
    var2 = (((int64_t)cal->dig_P8) * p) >> 19;

    p = ((p + var1 + var2) >> 8) + (((int64_t)cal->dig_P7) << 4);
    return (float)p / 256;
}

float BME280::compensateHumidity(int32_t adc_H, bme280_calib_data *cal, int32_t t_fine)
{
    int32_t v_x1_u32r;

    v_x1_u32r = (t_fine - ((int32_t)76800));

    v_x1_u32r = (((((adc_H << 14) - (((int32_t)cal->dig_H4) << 20) - (((int32_t)cal->dig_H5) * v_x1_u32r)) + ((int32_t)16384)) >> 15) *
                 (((((((v_x1_u32r * ((int32_t)cal->dig_H6)) >> 10) * (((v_x1_u32r * ((int32_t)cal->dig_H3)) >> 11) + ((int32_t)32768))) >> 10) +
                    ((int32_t)2097152)) *
                       ((int32_t)cal->dig_H2) +
                   8192) >>
                  14));

    v_x1_u32r = (v_x1_u32r - (((((v_x1_u32r >> 15) * (v_x1_u32r >> 15)) >> 7) * ((int32_t)cal->dig_H1)) >> 4));

    v_x1_u32r = (v_x1_u32r < 0) ? 0 : v_x1_u32r;
    v_x1_u32r = (v_x1_u32r > 419430400) ? 419430400 : v_x1_u32r;
    float h = (v_x1_u32r >> 12);
    return h / 1024.0;
}

void BME280::getRawData(int fd_BME280, bme280_raw_data *rawBME280)
{
    wiringPiI2CWrite(fd_BME280, 0xF7);

    rawBME280->pmsb = wiringPiI2CRead(fd_BME280);
    rawBME280->plsb = wiringPiI2CRead(fd_BME280);
    rawBME280->pxsb = wiringPiI2CRead(fd_BME280);

    rawBME280->tmsb = wiringPiI2CRead(fd_BME280);
    rawBME280->tlsb = wiringPiI2CRead(fd_BME280);
    rawBME280->txsb = wiringPiI2CRead(fd_BME280);

    rawBME280->hmsb = wiringPiI2CRead(fd_BME280);
    rawBME280->hlsb = wiringPiI2CRead(fd_BME280);

    rawBME280->temperature = 0;
    rawBME280->temperature = (rawBME280->temperature | rawBME280->tmsb) << 8;
    rawBME280->temperature = (rawBME280->temperature | rawBME280->tlsb) << 8;
    rawBME280->temperature = (rawBME280->temperature | rawBME280->txsb) >> 4;

    rawBME280->pressure = 0;
    rawBME280->pressure = (rawBME280->pressure | rawBME280->pmsb) << 8;
    rawBME280->pressure = (rawBME280->pressure | rawBME280->plsb) << 8;
    rawBME280->pressure = (rawBME280->pressure | rawBME280->pxsb) >> 4;

    rawBME280->humidity = 0;
    rawBME280->humidity = (rawBME280->humidity | rawBME280->hmsb) << 8;
    rawBME280->humidity = (rawBME280->humidity | rawBME280->hlsb);
}

float BME280::getAltitude(float pressure)
{
    // Equation taken from BMP180 datasheet (page 16):
    //  http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf

    return 44330.0 * (1.0 - pow(pressure / MEAN_SEA_LEVEL_PRESSURE, 0.190294957));
}

float BME280::extractData(int fd_BME280, int whichOutput)
{
    bme280_calib_data cal;
    readCalibrationData(fd_BME280, &cal);

    bme280_raw_data rawBME280;
    getRawData(fd_BME280, &rawBME280);

    int32_t t_fine = getTemperatureCalibration(&cal, rawBME280.temperature);
    float temperature = compensateTemperature(t_fine);
    float pressure = compensatePressure(rawBME280.pressure, &cal, t_fine) / 100;
    float humidity = compensateHumidity(rawBME280.humidity, &cal, t_fine);
    float altitude = getAltitude(pressure);

    switch (whichOutput)
    {
    case 0:
        return temperature;
    case 1:
        return pressure;
    case 2:
        return humidity;
    case 3:
        return altitude;
    };

    return 0;
}