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


function updateWeather() {
    // Simulate real-time data (replace with actual API calls)
    const temperature = (25 + Math.random() * 5).toFixed(1);
    const humidity = (60 + Math.random() * 20).toFixed(1);
    const heatIndex = calculateHeatIndex(parseFloat(temperature), parseFloat(humidity));
    const now = new Date().toLocaleTimeString();

    document.getElementById('temperature').textContent = temperature;
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('heatIndex').textContent = heatIndex;
    document.getElementById('lastUpdate').textContent = now;
}

// Update immediately and then every 3 seconds
updateWeather();
setInterval(updateWeather, 3000);