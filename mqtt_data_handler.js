function calculateHeatIndex(tempCelsius, humidity) {
    // Convert Celsius to Fahrenheit for the calculation
    const tempF = (tempCelsius * 9/5) + 32;
    
    // Simple formula for heat index
    let heatIndex = 0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (humidity * 0.094));

    // If temperature is above 80°F, use the full regression equation
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

    // Convert back to Celsius
    return ((heatIndex - 32) * 5/9).toFixed(1);
}

// Wait for the document to fully load before running the script
document.addEventListener('DOMContentLoaded', function () {
    // Load the MQTT.js library via CDN
    const scriptElement = document.createElement('script');
    scriptElement.src = "https://unpkg.com/mqtt/dist/mqtt.min.js";
    document.head.appendChild(scriptElement);

    // Run the rest of the code only after the library has loaded
    scriptElement.onload = function () {
        console.log("MQTT.js library loaded.");

        // Configuration for connecting to the MQTT broker
        const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
        const topic = 'tcp/1';
        const options = {
            clientId: `mqtt_client_${Math.random().toString(16).substr(2, 8)}`,
            username: 'emqx',
            password: 'admin',
            keepalive: 60,
            reconnectPeriod: 1000 // Automatically reconnect after 1 second if disconnected
        };

        // Elements for displaying data on the webpage
        const tempElement = document.getElementById('temperature');
        const humidityElement = document.getElementById('humidity');
        // const heatIndex = calculateHeatIndex(parseFloat(tempElement), parseFloat(humidityElement));
        // document.getElementById('heatIndex').textContent = heatIndex;
        // Connect to the MQTT broker
        const client = mqtt.connect(brokerUrl, options);

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                } else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });

        client.on('message', (topic, message) => {
            // console.log(message.jsonify());
            console.log(`Received message on topic ${topic}: ${message.toString()}`);

            // Display raw data in the console (for debugging)
            const rawData = message.toString();
            console.log("Raw Data:", rawData);

            // Extract temperature and humidity from the message
            const tempMatch = rawData.match(/Temperature:\s?([\d.]+)/);
            const humidityMatch = rawData.match(/Humidity:\s?([\d.]+)/);
            const heatIndex = calculateHeatIndex(parseFloat(parseInt(tempMatch[1], 10)), parseFloat(parseInt(humidityMatch[1],10)));
            document.getElementById('heatIndex').textContent = heatIndex;

            // Update the HTML elements if data matches the expected format
            if (tempMatch) {
                tempElement.textContent = tempMatch[1];
            }
            if (humidityMatch) {
                humidityElement.textContent = humidityMatch[1];
            }
        });
       

        client.on('error', (err) => {
            console.error('Connection error:', err);
        });

        client.on('close', () => {
            console.log('Disconnected from MQTT broker');
        });
    };
});
