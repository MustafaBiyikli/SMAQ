cmake_minimum_required(VERSION 3.10)

# Set the project name
project(sampleData)

# Add executable
add_executable(${PROJECT_NAME} demo.cpp sampler.cpp BME280.cpp VCNL4010.cpp ADS1115.cpp)

# Unit tests
enable_testing()
add_executable(unit_test unitTest.cpp)
add_test(test_result unit_test)

set(CMAKE_CXX_STANDARD 11)

# Locate libraries and headers
find_library(wiringPi_LIB wiringPi)
find_package(Threads)

# Link against libraries
target_link_libraries(unit_test ${wiringPi_LIB})
target_link_libraries(${PROJECT_NAME} ${wiringPi_LIB})
target_link_libraries(${PROJECT_NAME} ${CMAKE_THREAD_LIBS_INIT})

# Run tests after building
add_custom_command(TARGET unit_test
		   	POST_BUILD
			COMMAND ctest --output-on-failure)
