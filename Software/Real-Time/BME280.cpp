#include <iostream>
#include <cerrno>
#include <cstdint>
#include <ctime>
#include <cmath>
#include <sstream>
#include "wiringPiI2C.h"
#include "BME280.h"
#include "VCNL4010.h"

#include <chrono>
#include <thread>

using namespace std;

int main()
{

    int fd_BME280 = wiringPiI2CSetup(BME280_ADDRESS);
    int fd_VCNL4010 = wiringPiI2CSetup(VCNL4010_ADDRESS);

    /** BME280 */
    bme280_calib_data cal;
    readCalibrationData(fd_BME280, &cal);

    wiringPiI2CWriteReg8(fd_BME280, 0xf2, 0x01); // humidity oversampling x 1
    wiringPiI2CWriteReg8(fd_BME280, 0xf4, 0x25); // pressure and temperature oversampling x 1, mode normal

    time_t timeStamp = time(0);
    char* dt = ctime(&timeStamp);

    bme280_raw_data rawBME280;
    getRawData(fd_BME280, &rawBME280);

    int32_t t_fine = getTemperatureCalibration(&cal, rawBME280.temperature);
    float t = compensateTemperature(t_fine);                        // C
    float p = compensatePressure(rawBME280.pressure, &cal, t_fine) / 100; // hPa
    float h = compensateHumidity(rawBME280.humidity, &cal, t_fine);       // %
    float a = getAltitude(p);                                       // meters

    /** VCNL4010 */
    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_PROXRATE, 0x00); // Set PROXRATE to 125samples/s
    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_IRLED, 20);; // set IR LED current to 200mA;

    // For testing purposes ONLY!
    while (1) {
        uint16_t proximity = getProximity(fd_VCNL4010);
        uint16_t ambientLight = getAmbientLight(fd_VCNL4010);

        cout << "temperature: " << t << " C" << endl;
        cout << "pressure: " << p << " hPa" << endl;
        cout << "humidity: " << h << " %" << endl;
        cout << "proximity: " << proximity << " unit" << endl;
        cout << "ambientLight: " << ambientLight << " lx" << endl;
        cout << "-------------------------" << endl;

        if (proximity > 2400) {
            break;
        }

        this_thread::sleep_for(chrono::milliseconds(100));
    }

    /*-------------------JSON---------------------*/

    // Proximity & Gas sensor data to be added
    /**
    ostringstream json;
    json << "SMAQ:[\n"
        "  \"timeStamp\":" << timeStamp << ",\n"
        "  \"BME280\":{\n"
        "    \"temperature\":" << t << ",\n"
        "    \"pressure\":" << p << ",\n"
        "    \"humidity\":" << h << ",\n"
        "    \"altitude\":" << a << "\n"
        "  },\n"
        "  \"LTR559\":{\n"
        "    \"lightLevel\":" << ambientLight << ",\n"
        "    \"distance\":" << proximty << "\n"
        "  },\n"
        "  \"MICS6814\":{\n"
        "    \"CO\":" << "1-1000ppm" << ",\n"
        "    \"NO2\":" << "0.05-10ppm" << ",\n"
        "    \"C2H5OH\":" << "10-500ppm" << ",\n"
        "    \"H2\":" << "1-1000ppm" << ",\n"
        "    \"NH3\":" << "1-500ppm" << ",\n"
        "    \"CH4\":" << ">1000ppm" << ",\n"
        "    \"C3H8\":" << ">1000ppm" << ",\n"
        "    \"C4H10\":" << ">1000ppm" << "\n"
        "  }\n"
        "]\n";
    string smaqOut = json.str();

    cout << smaqOut << endl;
    */

    return 0;
}

/**-------------------BME-280-FUNCTIONS--------------------*/

int32_t getTemperatureCalibration(bme280_calib_data *cal, int32_t adc_T)
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

void readCalibrationData(int fd_BME280, bme280_calib_data *data)
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

float compensateTemperature(int32_t t_fine)
{
    float T = (t_fine * 5 + 128) >> 8;
    return T / 100;
}

float compensatePressure(int32_t adc_P, bme280_calib_data *cal, int32_t t_fine)
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

float compensateHumidity(int32_t adc_H, bme280_calib_data *cal, int32_t t_fine)
{
    int32_t v_x1_u32r;

    v_x1_u32r = (t_fine - ((int32_t)76800));

    v_x1_u32r = (((((adc_H << 14) - (((int32_t)cal->dig_H4) << 20) - (((int32_t)cal->dig_H5) * v_x1_u32r)) + ((int32_t)16384)) >> 15) *
                 (((((((v_x1_u32r * ((int32_t)cal->dig_H6)) >> 10) * (((v_x1_u32r * ((int32_t)cal->dig_H3)) >> 11) + ((int32_t)32768))) >> 10) +
                    ((int32_t)2097152)) * ((int32_t)cal->dig_H2) + 8192) >> 14));

    v_x1_u32r = (v_x1_u32r - (((((v_x1_u32r >> 15) * (v_x1_u32r >> 15)) >> 7) * ((int32_t)cal->dig_H1)) >> 4));

    v_x1_u32r = (v_x1_u32r < 0) ? 0 : v_x1_u32r;
    v_x1_u32r = (v_x1_u32r > 419430400) ? 419430400 : v_x1_u32r;
    float h = (v_x1_u32r >> 12);
    return h / 1024.0;
}

void getRawData(int fd_BME280, bme280_raw_data *rawBME280)
{
    wiringPiI2CWrite(fd_BME280, 0xf7);

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

float getAltitude(float pressure)
{
    // Equation taken from BMP180 datasheet (page 16):
    //  http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf

    // Note that using the equation from wikipedia can give bad results
    // at high altitude.  See this thread for more information:
    //  http://forums.adafruit.com/viewtopic.php?f=22&t=58064

    return 44330.0 * (1.0 - pow(pressure / MEAN_SEA_LEVEL_PRESSURE, 0.190294957));
}

/**-------------------VCNL-4010-FUNCTIONS--------------------*/

uint16_t getProximity(int fd_VCNL4010) {

    uint8_t interruptStatus = wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_INTSTAT);
    interruptStatus &= ~0x80;
    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_INTSTAT, interruptStatus);

    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_COMMAND, VCNL4010_MEASUREPROXIMITY);

    while (1) {
        uint8_t result = wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_COMMAND);
        if(result & VCNL4010_PROXIMITYREADY) {
            uint16_t distance_mm = (wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_PROXIMITYDATA) << 8 | wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_PROXIMITYDATA + 1));
            return distance_mm;
        }
    }
}

uint16_t getAmbientLight(int fd_VCNL4010) {

    uint8_t interruptStatus = wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_INTSTAT);
    interruptStatus &= ~0x40;
    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_INTSTAT, interruptStatus);

    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_COMMAND, VCNL4010_MEASUREAMBIENT);

    while (1) {
        uint8_t result = wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_COMMAND);
        if(result & VCNL4010_AMBIENTREADY) {
            uint16_t distance_mm = (wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_AMBIENTDATA) << 8 | wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_AMBIENTDATA + 1));
            return distance_mm;
        }
    }
}













