function calculateHeatIndex(tempCelsius, humidity) {
    const tempF = (tempCelsius * 9/5) + 32;
    
    let heatIndex = 0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (humidity * 0.094));

    if (tempF >= 80) {
        heatIndex = -42.379 + 
                   (2.04901523 * tempF) +
                   (10.14333127 * humidity) +
                   (-0.22475541 * tempF * humidity) +
                   (-0.00683783 * tempF * tempF) +
                   (-0.05481717 * humidity * humidity) +
                   (0.00122874 * tempF * tempF * humidity) +
                   (0.00085282 * tempF * humidity * humidity) +
                   (-0.00000199 * tempF * tempF * humidity * humidity);
    }

    return ((heatIndex - 32) * 5/9).toFixed(1);
}

document.addEventListener('DOMContentLoaded', function () {
    const scriptElement = document.createElement('script');
    scriptElement.src = "https://unpkg.com/mqtt/dist/mqtt.min.js";
    document.head.appendChild(scriptElement);

    scriptElement.onload = function () {
        console.log("MQTT.js library loaded.");

        const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
        const topic = 'tcp/1';
        const options = {
            clientId: `mqtt_client_${Math.random().toString(16).substr(2, 8)}`,
            username: 'emqx',
            password: 'admin',
            keepalive: 60,
            reconnectPeriod: 1000
        };

        const tempElement = document.getElementById('temperature');
        const humidityElement = document.getElementById('humidity');
        const heatIndexElement = document.getElementById('heatIndex');
        const heatIndexUnitElement = document.getElementById('heatIndexUnit');
        const currentDateElement = document.getElementById('currentDate');
        const statusDotElement = document.getElementById('statusDot');
        const sensorStatusElement = document.getElementById('sensorStatus');

        function formatDateTime(date) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'Asia/Kolkata'
            };
            return date.toLocaleDateString('en-US', options) + ' IST';
        }

        let lastMessageTimestamp = null;
        let statusCheckInterval;

        function resetSensorValues() {
            tempElement.textContent = '--';
            humidityElement.textContent = '--';
            heatIndexElement.textContent = '--';
            currentDateElement.textContent = '--';
            updateHeatIndexColor('--');
        }

        function updateHeatIndexColor(value) {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue) && parsedValue > 40) {
                heatIndexElement.className = 'text-4xl font-bold text-red-600';
                heatIndexUnitElement.className = 'text-2xl text-red-600 ml-1';
            } else {
                heatIndexElement.className = 'text-4xl font-bold text-orange-600';
                heatIndexUnitElement.className = 'text-2xl text-orange-600 ml-1';
            }
        }

        function updateSensorStatus(isOnline) {
            if (isOnline) {
                statusDotElement.className = 'inline-block w-2 h-2 rounded-full mr-2 bg-green-500';
                sensorStatusElement.className = 'font-medium text-green-500';
                sensorStatusElement.textContent = 'Live';
            } else {
                statusDotElement.className = 'inline-block w-2 h-2 rounded-full mr-2 bg-red-500';
                sensorStatusElement.className = 'font-medium text-red-500';
                sensorStatusElement.textContent = 'Offline';
                resetSensorValues();
            }
        }

        const client = mqtt.connect(brokerUrl, options);

        // Initial status check
        updateSensorStatus(false);

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                    updateSensorStatus(false);
                } else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });

            // Start monitoring sensor status - check every second
            statusCheckInterval = setInterval(() => {
                const isOnline = lastMessageTimestamp && (Date.now() - lastMessageTimestamp < 10000);
                updateSensorStatus(isOnline);
            }, 1000);
        });

        client.on('message', (topic, message) => {
            console.log(`Received message on topic ${topic}: ${message.toString()}`);
            lastMessageTimestamp = Date.now();

            currentDateElement.textContent = formatDateTime(new Date());

            const rawData = message.toString();
            console.log("Raw Data:", rawData);

            const tempMatch = rawData.match(/Temperature:\s?([\d.]+)/);
            const humidityMatch = rawData.match(/Humidity:\s?([\d.]+)/);

            if (tempMatch && humidityMatch) {
                const temp = parseFloat(tempMatch[1]);
                const humidity = parseFloat(humidityMatch[1]);
                
                tempElement.textContent = temp.toFixed(1);
                humidityElement.textContent = humidity.toFixed(1);
                
                const heatIndex = calculateHeatIndex(temp, humidity);
                heatIndexElement.textContent = heatIndex;
                updateHeatIndexColor(heatIndex);
            }
        });

        client.on('error', (err) => {
            console.error('Connection error:', err);
            updateSensorStatus(false);
        });

        client.on('close', () => {
            console.log('Disconnected from MQTT broker');
            updateSensorStatus(false);
            if (statusCheckInterval) {
                clearInterval(statusCheckInterval);
            }
        });
    };
});