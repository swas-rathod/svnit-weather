const mqtt = require('mqtt');
const fs = require('fs');

// MQTT broker connection details
const brokerUrl = 'mqtt://broker.emqx.io';
const options = {
    clientId: `mqtt_client_${Math.random().toString(16).substr(2, 8)}`,
    username: 'emqx',
    password: 'YOUR_PASSWORD_HERE', // Replace with your actual password
    port: 1883
};
const topic = 'tcp/1';

// Get the runtime duration from command-line arguments (in seconds)
const runTime = process.argv[2] ? parseInt(process.argv[2], 10) : null;

// File to save the data
const outputFile = 'sensor_data.json';

// Create or clear the output file initially
fs.writeFileSync(outputFile, '[]');

console.log(`Connecting to MQTT broker at ${brokerUrl}...`);

const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
    console.log(`Connected to broker. Subscribing to topic: ${topic}`);
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Successfully subscribed to topic: ${topic}`);
        }
    });
});

client.on('message', (topic, message) => {
    const timestamp = new Date().toISOString();

    // Store the raw message as received
    const data = {
        timestamp,
        topic,
        rawMessage: message.toString()
    };

    // Read existing data from the file
    const existingData = JSON.parse(fs.readFileSync(outputFile));
    existingData.push(data);

    // Save updated data to the file
    fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2));

    console.log(`Raw data saved: ${JSON.stringify(data)}`);
});

// Timer functionality to stop after a certain time if specified
if (runTime) {
    console.log(`Running for ${runTime} seconds...`);
    setTimeout(() => {
        console.log('Time is up! Stopping the program.');
        client.end();
        process.exit(0);
    }, runTime * 1000);
}

client.on('error', (err) => {
    console.error('MQTT Error:', err);
});
