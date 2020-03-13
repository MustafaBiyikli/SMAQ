cmake_minimum_required(VERSION 3.10)

# set the project name
project(BME280)

#add executable
add_executable(${PROJECT_NAME} BME280.cpp BME280.h)


# Locate libraries and headers
find_library(wiringPi_LIB wiringPi)

# Link against libraries
target_link_libraries(${PROJECT_NAME} ${wiringPi_LIB})
