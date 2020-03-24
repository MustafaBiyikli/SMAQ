#include <iostream>
#include "sampler.h"

using namespace std;

class printCallback : public Callback
{
    virtual void hasSample(time_t timeStamp, int ambientLight, int proximity, float temperature, float pressure, float humidity, float altitude,
                           int microphone, int nh3, int no2, int co)
    {
        cout << "timeStamp:" << timeStamp << endl;
        cout << "ambientLight:" << ambientLight << "|proximity:" << proximity << endl;
        cout << "temperature:" << temperature << "|pressure:" << pressure << endl;
        cout << "humidity:" << humidity << "|altitude:" << altitude << endl;
        cout << "microphone:" << microphone << endl;
        cout << "NH3:" << nh3 << endl;
        cout << "NO2:" << no2 << endl;
        cout << "CO:" << co << endl;
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