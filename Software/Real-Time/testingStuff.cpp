#include <iostream>
#include <cerrno>
#include <cstdint>
#include <ctime>
#include <cstring>
#include <string>
#include <sstream>
#include <iterator>
#include <vector>
#include <cmath>
#include <stdexcept>

#include "wiringPiI2C.h"
#include "BME280.h"
#include "VCNL4010.h"
#include "ADS1115.h"
#include "SH1106.h"
#include "fonts.h"

#include <chrono>
#include <thread>

using namespace std;

int main()
{
    /**-------------------Init-Sensors--------------------*/

    int fd_BME280 = wiringPiI2CSetup(BME280_ADDRESS);
    int fd_VCNL4010 = wiringPiI2CSetup(VCNL4010_ADDRESS);
    int fd_ADS1115 = wiringPiI2CSetup(ADS1115_ADDRESS);
    int fd_SH1106 = wiringPiI2CSetup(SH1106_ADDRESS);

    /**-------------------TimeStamp---------------------*/

    time_t timeStamp = time(0);
    string dt = ctime(&timeStamp);
    istringstream iss(dt);

    vector<string> date_buffer;
    copy(istream_iterator<string>(iss),
         istream_iterator<string>(),
         back_inserter(date_buffer));
    ostringstream dateToFormat;
    dateToFormat << date_buffer[2] << " " << date_buffer[1] << " " << date_buffer[4];

    string formatted_date = dateToFormat.str();
    string formatted_time = date_buffer[3];

    /**-------------------BME280---------------------*/

    bme280_calib_data cal;
    readCalibrationData(fd_BME280, &cal);

    wiringPiI2CWriteReg8(fd_BME280, 0xf2, 0x01); // humidity oversampling x 1
    wiringPiI2CWriteReg8(fd_BME280, 0xf4, 0x25); // pressure and temperature oversampling x 1, mode normal

    bme280_raw_data rawBME280;
    getRawData(fd_BME280, &rawBME280);

    int32_t t_fine = getTemperatureCalibration(&cal, rawBME280.temperature);
    float t = compensateTemperature(t_fine);                              // C
    float p = compensatePressure(rawBME280.pressure, &cal, t_fine) / 100; // hPa
    float h = compensateHumidity(rawBME280.humidity, &cal, t_fine);       // %
    float a = getAltitude(p);                                             // meters

    /**-------------------VCNL4010---------------------*/

    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_PROXRATE, 0x00); // Set PROXRATE to 125samples/s
    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_IRLED, 20);      // set IR LED current to 200mA;

    uint16_t proximity = getProximity(fd_VCNL4010);
    uint16_t ambientLight = getAmbientLight(fd_VCNL4010);

    /**-------------------ADS1115---------------------*/

    uint16_t microphone = read_ADS1115_Channel(fd_ADS1115, 0); // Microphone
    uint16_t NH3 = read_ADS1115_Channel(fd_ADS1115, 1);        // MICS6814 (Ammonia)
    uint16_t NO2 = read_ADS1115_Channel(fd_ADS1115, 2);        // MICS6814 (Nitrogen Dioxide)
    uint16_t CO = read_ADS1115_Channel(fd_ADS1115, 3);         // MICS6814 (Carbon Monoxide)

    /**-------------------SH1106---------------------*/
    // FOR TESTING ONLY
    string userInput1;
    string userInput2;
    string userInput3;
    sh1106_init(fd_SH1106);
    sh1106_display(fd_SH1106);
    cout << "Press ENTER to clear screen and continue";
    getline(cin, userInput1);
    sh1106_clearDisplay(fd_SH1106);

    cout << "Press ENTER to show sensor data";
    getline(cin, userInput2);
    ostringstream sensorData;
    sensorData << " Date:" << formatted_date << "\n Time:" << formatted_time << "\n"
               << " --------------------\n"
               << " " << round(t * 10) / 10 << " C | " << round(p * 10) / 10 << "hPa\n" // will need to add rounding functions
               << " --------------------\n"
               << " " << round(h * 10) / 10 << "% | " << round(a * 10) / 10 << "m";
    string sensorDataOut = sensorData.str();
    sh1106_drawString(sensorDataOut);
    sh1106_display(fd_SH1106);
    cout << "Date: " << formatted_date << endl;
    cout << "Time: " << formatted_time << endl;
    cout << "Temp: " << t << " | Press: " << p << " | Humid: " << h << endl;
    cout << "Prox: " << proximity << " | Light: " << ambientLight << endl;
    cout << "NH3: " << NH3 << " | NO2: " << NO2 << " | CO: " << CO << endl;
    cout << "Mic: " << microphone << endl;

    cout << "Press ENTER to switch off";
    getline(cin, userInput3);
    sh1106_clearDisplay(fd_SH1106);
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_DISPLAYOFF);
    // END OF TESTING

    /** Sampling wrapper for testing purposes ONLY! */
    // while (1)
    // {
    //     this_thread::sleep_for(chrono::microseconds(1000));
    // }

    /*-------------------JSON-OUTPUT--------------------*/

    // Proximity & Gas sensor data to be added

    // ostringstream json;
    // json << "SMAQ:[\n"
    //     "  \"timeStamp\":" << timeStamp << ",\n"
    //     "  \"BME280\":{\n"
    //     "    \"temperature\":" << t << ",\n"
    //     "    \"pressure\":" << p << ",\n"
    //     "    \"humidity\":" << h << ",\n"
    //     "    \"altitude\":" << a << "\n"
    //     "  },\n"
    //     "  \"LTR559\":{\n"
    //     "    \"lightLevel\":" << ambientLight << ",\n"
    //     "    \"distance\":" << proximity << "\n"
    //     "  },\n"
    //     "  \"MICS6814\":{\n"
    //     "    \"CO\":" << CO << ",\n"
    //     "    \"NO2\":" << NO2 << ",\n"
    //     "    \"NH3\":" << NH3 << ",\n"
    //     "  },\n"
    //     "  \"MICROPHONE\":{\n"
    //     "    \"soundLevel\":" << microphone << "\n"
    //     "  }\n"
    //     "]\n";
    // string smaqOut = json.str();

    // cout << smaqOut << endl;

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

uint16_t getProximity(int fd_VCNL4010)
{

    uint8_t interruptStatus = wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_INTSTAT);
    interruptStatus &= ~0x80;
    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_INTSTAT, interruptStatus);

    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_COMMAND, VCNL4010_MEASUREPROXIMITY);

    while (1)
    {
        uint8_t result = wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_COMMAND);
        if (result & VCNL4010_PROXIMITYREADY)
        {
            uint16_t distance_mm = (wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_PROXIMITYDATA) << 8 | wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_PROXIMITYDATA + 1));
            return distance_mm;
        }
    }
}

uint16_t getAmbientLight(int fd_VCNL4010)
{

    uint8_t interruptStatus = wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_INTSTAT);
    interruptStatus &= ~0x40;
    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_INTSTAT, interruptStatus);

    wiringPiI2CWriteReg8(fd_VCNL4010, VCNL4010_COMMAND, VCNL4010_MEASUREAMBIENT);

    while (1)
    {
        uint8_t result = wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_COMMAND);
        if (result & VCNL4010_AMBIENTREADY)
        {
            uint16_t distance_mm = (wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_AMBIENTDATA) << 8 | wiringPiI2CReadReg8(fd_VCNL4010, VCNL4010_AMBIENTDATA + 1));
            return distance_mm;
        }
    }
}

/**-------------------ADS-1115-FUNCTIONS--------------------*/

uint16_t read_ADS1115_Register(int fd_ADS1115, uint8_t reg)
{
    wiringPiI2CWrite(fd_ADS1115, ADS1115_POINTER_CONVERSION);

    uint16_t reading = wiringPiI2CReadReg16(fd_ADS1115, reg);

    reading = (reading >> 8) | (reading << 8); // yes, wiringPi did not assemble the bytes as we want

    return reading;
}

uint16_t read_ADS1115_Channel(int fd_ADS1115, uint8_t channel)
{
    (channel > 3) ? channel = 3 : channel = channel;

    //	Set PGA/voltage range -> GAIN=1
    uint16_t config = ADS1115_DEFAULT;
    config &= ~ADS1115_PGA_MASK;
    config |= ADS1115_PGA_4_096V;

    //	Set sample speed -> 128 samples/second
    config &= ~ADS1115_DR_MASK;
    config |= ADS1115_DR_128SPS;

    //	Set single-ended channel or differential mode
    config &= ~ADS1115_MUX_MASK;

    switch (channel)
    {
    case 0:
        config |= ADS1115_MUX_SINGLE_0;
        break;
    case 1:
        config |= ADS1115_MUX_SINGLE_1;
        break;
    case 2:
        config |= ADS1115_MUX_SINGLE_2;
        break;
    case 3:
        config |= ADS1115_MUX_SINGLE_3;
        break;
    }

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

/**-------------------SH-1106-FUNCTIONS--------------------*/
int cursor_x = 0;
int cursor_y = 0;
int textsize = 1;
int wrap = 1;

#define pgm_read_byte(addr) (*(const unsigned char *)(addr))

#define sh1106_swap(a, b) \
    {                     \
        int t = a;        \
        a = b;            \
        b = t;            \
    }

void sh1106_init(int fd_SH1106)
{
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_DISPLAYOFF);
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETDISPLAYCLOCKDIV);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0xF0); // Suggested Ratio
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETMULTIPLEX);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0x3f);
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETDISPLAYOFFSET);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0x00);                      // No Offest
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETSTARTLINE | 0x0); // Line 0
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_CHARGEPUMP);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0x10); // internal VCC: 0x14 | external VCC: 0x10
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_MEMORYMODE);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0x00);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0xB0); // page 0
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_COMSCANDEC);
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETLOWCOLUMN);
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETHIGHCOLUMN);

    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETCOMPINS);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0x12);
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETCONTRAST);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0x9F); // internal VCC: 0xCF | external VCC: 0x9F

    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SEGREMAP);
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETPRECHARGE);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0x22); // internal VCC: 0xF1 | external VCC: 0x22
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_SETVCOMDETECT);
    wiringPiI2CWriteReg8(fd_SH1106, control, 0x20);

    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_DISPLAYALLON_RESUME);
    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_NORMALDISPLAY);

    wiringPiI2CWriteReg8(fd_SH1106, control, SH1106_DISPLAYON); // Finally switch the display ON
}

void sh1106_display(int fd_SH1106)
{
    for (unsigned short page = 0; page < 8; page++)
    {
        wiringPiI2CWriteReg8(fd_SH1106, control, 0x00);
        wiringPiI2CWriteReg8(fd_SH1106, control, 0x10);
        wiringPiI2CWriteReg8(fd_SH1106, control, 0xB0 | (page & 0x0F));

        for (int i = 0; i < 128; i++)
        {
            wiringPiI2CWriteReg8(fd_SH1106, 0x40, buffer[page * 128 + i]);
        }
    }
}

void sh1106_clearDisplay(int fd_SH1106)
{
    memset(buffer, 0, (WIDTH * HEIGHT / 8) * sizeof(int));
    cursor_y = 0;
    cursor_x = 0;
    sh1106_display(fd_SH1106);
}

void sh1106_drawPixel(int x, int y, unsigned int color)
{
    if ((x < 0) || (x >= WIDTH) || (y < 0) || (y >= HEIGHT))
    {
        runtime_error("Pixels out of bounds");
    }
    // Check rotation - Move pixel if necessary
    switch (rotation)
    {
    case 1:
        sh1106_swap(x, y);
        x = WIDTH - x - 1;
        break;
    case 2:
        x = WIDTH - x - 1;
        y = HEIGHT - y - 1;
        break;
    case 3:
        sh1106_swap(x, y);
        y = HEIGHT - y - 1;
        break;
    }
    // Check which column x is
    switch (color)
    {
    case WHITE:
        buffer[x + (y / 8) * WIDTH] |= (1 << (y & 7));
        break;
    case BLACK:
        buffer[x + (y / 8) * WIDTH] &= ~(1 << (y & 7));
        break;
    case INVERSE:
        buffer[x + (y / 8) * WIDTH] ^= (1 << (y & 7));
        break;
    }
}

void sh1106_write(int c)
{
    if (c == '\n')
    {
        cursor_y += textsize * 8;
        cursor_x = 0;
    }
    else if (c == '\r')
    {
        // do nothing
    }
    else
    {
        sh1106_drawChar(cursor_x, cursor_y, c, WHITE, textsize);
        cursor_x += textsize * 6;
        if (wrap && (cursor_x > (WIDTH - textsize * 6)))
        {
            cursor_y += textsize * 8;
            cursor_x = 0;
        }
    }
}

void sh1106_drawString(string str)
{
    int i, len;
    len = str.length();
    for (i = 0; i < len; i++)
    {
        sh1106_write(str[i]);
    }
}

void sh1106_drawChar(int x, int y, unsigned char c, int color, int size)
{
    if ((x >= WIDTH) ||             // Clip right
        (y >= HEIGHT) ||            // Clip bottom
        ((x + 6 * size - 1) < 0) || // Clip left
        ((y + 8 * size - 1) < 0))   // Clip top
        return;
    int i, j;
    for (i = 0; i < 6; i++)
    {
        int line;
        if (i == 5)
            line = 0x0;
        else
            line = pgm_read_byte(font + (c * 5) + i);
        for (j = 0; j < 8; j++)
        {
            if (line & 0x1)
                sh1106_drawPixel(x + i, y + j, color);
            line >>= 1;
        }
    }
}