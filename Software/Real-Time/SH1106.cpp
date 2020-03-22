#include <iostream>
#include <cerrno>
#include <cstdint>
#include <ctime>
#include <cstring>
#include <string>
#include <sstream>
#include <iterator>
#include <vector>
#include <stdexcept>

#include "fonts.h"
#include "SH1106.h"
#include "wiringPiI2C.h"

using namespace std;

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

void SH1106::sh1106_init(int fd_SH1106)
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

void SH1106::sh1106_display(int fd_SH1106)
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

void SH1106::sh1106_clearDisplay(int fd_SH1106)
{
    memset(buffer, 0, (WIDTH * HEIGHT / 8) * sizeof(int));
    cursor_y = 0;
    cursor_x = 0;
    sh1106_display(fd_SH1106);
}

void SH1106::sh1106_drawPixel(int x, int y, unsigned int color)
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

void SH1106::sh1106_write(int c)
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

void SH1106::sh1106_drawString(string str)
{
    int i, len;
    len = str.length();
    for (i = 0; i < len; i++)
    {
        sh1106_write(str[i]);
    }
}

void SH1106::sh1106_drawChar(int x, int y, unsigned char c, int color, int size)
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