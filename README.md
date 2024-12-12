# TnH Sensor Setup Instructions

## Overview
This document provides step-by-step instructions to set up your Temperature and Humidity (TnH) sensor for MQTT data transmission.

## Prerequisites
- TnH Sensor
- USB-C type cable (5V, 1-2A)
- Ethernet cable
- Computer with an IP Scanner tool (e.g., Advanced IP Scanner)
- Web browser

## Setup Steps

### 1. Power Connection
- Connect the sensor to a **5V, 1-2A power source** using a **USB-C type cable**.
- Ensure the **RED light turns on** to indicate that power is supplied.

### 2. Network Connection
- Connect the sensor to your local network using an **Ethernet cable**.

### 3. Find Sensor IP Address
- Use an **IP Scanner tool** like **Advanced IP Scanner** to find the IP address of the sensor device.
- Note down the IP address for later use.

### 4. Power Cycle the Device
- Power OFF the sensor and wait for **30 seconds**.
- Power it ON again while keeping the Ethernet cable connected.

### 5. Configure Sensor Settings
- Within the initial **2-3 minutes** after powering on, open a web browser and enter the noted IP address.
- Fill in the following configuration details:
  - **Host IP or domain:** `broker.emqx.io`
  - **Topic:** `{any alphanumeric word}` (replace with your choice)
  - **Username:** `{admin}` (configurable)
  - **Password:** `{admin}` (configurable)
  - **Port:** `1883`
  - **Data Rate/sec:** `{enter your desired value in seconds}`

### 6. Submit Configuration
- After entering all necessary details, click on **Submit**. Your device is now configured and ready to receive data using any MQTT compatible software.

## Usage
Once configured, you can use any MQTT client to subscribe to the topic you set up and start receiving temperature and humidity data from your TnH sensor.

## License
This setup guide is provided under the [MIT License](LICENSE).

