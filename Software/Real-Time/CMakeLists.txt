cmake_minimum_required(VERSION 3.10)

# Set the project name
project(BME280)

# Add executable
add_executable(${PROJECT_NAME} BME280.cpp BME280.h VCNL4010.h)

# Unit tests
enable_testing()
add_executable(unit_test unitTest.cpp BME280.h VCNL4010.h)
add_test(test_result unit_test)

# Locate libraries and headers
find_library(wiringPi_LIB wiringPi)

# Link against libraries
target_link_libraries(unit_test ${wiringPi_LIB})
target_link_libraries(${PROJECT_NAME} ${wiringPi_LIB})

# Run tests after building
add_custom_command(TARGET unit_test
		   	POST_BUILD
			COMMAND ctest --output-on-failure)
