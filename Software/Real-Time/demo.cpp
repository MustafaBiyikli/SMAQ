#include <iostream>
#include "sampler.h"

using namespace std;

class printCallback : public Callback
{
    virtual void hasSample(time_t timeStamp, float ambientLight, float proximity, float temperature, float pressure, float humidity, float altitude,
                           float microphone, float nh3, float no2, float co)
    {
        cout << "timeStamp: " << timeStamp << endl;
        cout << "ambientLight: " << ambientLight << "lux | proximity: " << proximity << "mm" << endl;
        cout << "temperature: " << temperature << "C | pressure:" << pressure << "hPa" << endl;
        cout << "humidity: " << humidity << "% | altitude: " << altitude << "m" << endl;
        cout << "microphone: " << microphone << "%" << endl;
        cout << "NH3: " << nh3 << "ppm" << endl;
        cout << "NO2: " << no2 << "ppm" << endl;
        cout << "CO: " << co << "ppm" << endl;
        cout << "---------------------------------------" << endl;
    }
};

int main(int argc, char *argv[])
{
    Communicate *communicate = new Communicate();
    printCallback printcallback;
    communicate->setCallBack(&printcallback);
    communicate->start(Communicate::_2HZ);

    // Press ENTER to stop execution
    getchar();
    communicate->stop();
    delete communicate;
    return 0;
}