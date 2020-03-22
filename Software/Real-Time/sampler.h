#ifndef __SAMPLER_H__
#define __SAMPLER_H__

#include <stdlib.h>
#include <stdint.h>
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <thread>
#include <iostream>

using namespace std;

/** Declare Class */

class Callback
{
public:
    /** Called after sample has arrived **/
    virtual void hasSample(int ambientLight, int proximity, float temperature, float pressure, float humidity, float altitude,
                           int microphone, int NH3, int NO2, int CO) = 0;
};

class Communicate
{

public:
    /** Constructor with I2C device **/
    Communicate();

    /** Set callback for when there is a sample **/
    void setCallBack(Callback *cb);

    /** Start data acquisition **/
    void start(int samplingRate = 0);

    /** Stop data acquisition **/
    void stop();

    /** Sampling Rates **/
    static const int _1HZ = 0; // Default
    static const int _2HZ = 1;
    static const int _3HZ = 2;
    static const int _4HZ = 3;
    static const int _5HZ = 4;
    static const int _6HZ = 5;
    static const int _8HZ = 6;
    static const int _10HZ = 7;

private:
    uint8_t interruptStatus = 0;

    int running = 0;
    int fd_VCNL4010 = 0;
    int fd_BME280 = 0;
    int fd_ADS1115 = 0;
    Callback *callback = NULL;
    thread *Thread = NULL;

    static void run(Communicate *communicate);
};

#endif
