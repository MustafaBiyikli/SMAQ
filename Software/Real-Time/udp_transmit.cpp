#include <cstdint>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <cstring>
#include <sys/ioctl.h>
#include <linux/types.h>
#include <linux/spi/spidev.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/signal.h>

#include "sampler.h"

class smaqUDP : public Callback
{
public:
    smaqUDP()
    {
        /*Create UDP socket*/
        udpSocket = socket(PF_INET, SOCK_DGRAM, 0);
        if (-1 == udpSocket)
        {
            const char tmp[] = "Could net get an UDP socket!\n";
            fprintf(stderr, tmp);
            throw tmp;
        }

        /*Configure settings in address struct*/
        clientAddr.sin_family = AF_INET;
        clientAddr.sin_port = htons(65000);
        clientAddr.sin_addr.s_addr = htonl(INADDR_ANY);
        cout << "Transmitting on port: 65000" << endl;
    }

    virtual void hasSample(time_t timeStamp, int ambientLight, int proximity, float temperature, float pressure, float humidity, float altitude,
                           int microphone, int nh3, int no2, int co)
    {
        char buffer[256];

        sprintf(buffer, "timeStamp:%ti\nambientLight:%d|proximity:%d\ntemperature:%f|pressure:%f\nhumidity:%f|altitude:%f\nmicrophone:%d\nNH3:%d\nNO2:%d\nCO:%d\n",
                timeStamp, ambientLight, proximity, temperature, pressure, humidity, altitude, microphone, nh3, no2, co);
        sendto(udpSocket, buffer, strlen(buffer) + 1, 0,
               (const struct sockaddr *)&clientAddr,
               sizeof(clientAddr));
        // cout << buffer << endl;
    }
    virtual ~smaqUDP()
    {
        close(udpSocket);
    }

private:
    int udpSocket;
    struct sockaddr_in clientAddr;
};

int running = 1;

void sigHandler(int sig)
{
    if (sig == SIGHUP)
    {
        running = 0;
    }
}

// run in background with &
// kill -HUP <pid>
void setHandler()
{
    struct sigaction act;
    memset(&act, 0, sizeof(act));
    act.sa_handler = sigHandler;
    if (sigaction(SIGHUP, &act, NULL) < 0)
    {
        perror("sigaction");
        exit(-1);
    }
}

int main(int argc, char *argv[])
{
    Communicate *communicate = new Communicate();
    smaqUDP smaqSampleCallback;
    communicate->setCallBack(&smaqSampleCallback);
    communicate->start(Communicate::_2HZ);
    setHandler();
    while (running)
        sleep(1);
    communicate->stop();
    delete communicate;
    cerr << "\nUDP transmit terminated.\n";
    return 0;
}