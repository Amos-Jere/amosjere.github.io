const apiKey = '9abaf7561f03a5566cbe8c13ec1c22ef';
const currentWeatherElement = document.getElementById('current-weather');
const locationElement = document.getElementById('location');
const descriptionElement = document.getElementById('description');
const temperatureElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const weatherIconElement = document.getElementById('weather-icon');
const forecastElement = document.getElementById('forecast');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const suggestionsElement = document.getElementById('suggestions');
const timeElement = document.getElementById('time');
const weatherForecastElement = document.getElementById('weather-forecast');

function fetchWeather(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const { name, weather, main, wind } = data;
            locationElement.textContent = name;
            descriptionElement.textContent = weather[0].description;
            temperatureElement.textContent = `Temperature: ${main.temp}°C`;
            humidityElement.textContent = `Humidity: ${main.humidity}%`;
            windSpeedElement.textContent = `Wind Speed: ${wind.speed} m/s`;
            weatherIconElement.className = `fas ${getWeatherIcon(weather[0].icon)}`;
            updateBackgroundColor(weather[0].main);
            updateTurbineSpeed(wind.speed);
        });

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            forecastElement.innerHTML = '';
            const dates = new Set();
            data.list.forEach(item => {
                const [date, time] = item.dt_txt.split(' ');
                if (!dates.has(date) && dates.size < 7) {
                    dates.add(date);
                    const { main, weather } = item;
                    const forecastTile = document.createElement('div');
                    forecastTile.className = 'forecast-tile';
                    forecastTile.innerHTML = `
                        <p>${getDayName(date)}</p>
                        <p>${date}</p>
                        <p><i class="fas ${getWeatherIcon(weather[0].icon)}"></i></p>
                        <p>${main.temp}°C</p>
                    `;
                    forecastElement.appendChild(forecastTile);
                }
            });
        });
    displayWeatherForecast(lat, lon); // Add call to display hourly forecast
}

function updateTurbineSpeed(speed) {
    const turbine = document.querySelector('.turbine');
    const animationSpeed = Math.max(1, 20 / speed); // Adjust the multiplier as needed
    turbine.style.animationDuration = `${animationSpeed}s`;
}

function getWeatherIcon(icon) {
    const icons = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy',
        '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-sun-rain',
        '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };
    return icons[icon] || 'fa-sun';
}

function updateBackgroundColor(condition) {
    const conditions = {
        Clear: '#ffeb3b',
        Clouds: '#90a4ae',
        Rain: '#4fc3f7',
        Snow: '#81d4fa',
        Thunderstorm: '#f44336',
        Drizzle: '#4fc3f7',
        Mist: '#b0bec5'
    };
    currentWeatherElement.style.backgroundColor = conditions[condition] || '#fff';
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
        }, () => {
            promptLocation();
        });
    } else {
        promptLocation();
    }
}

function promptLocation() {
    const defaultLocation = searchInput.value || prompt('Enter your location:');
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${defaultLocation}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            fetchWeather(data.coord.lat, data.coord.lon);
        });
}

function showSuggestions(query) {
    if (query.length < 3) {
        suggestionsElement.innerHTML = '';
        return;
    }
    fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            suggestionsElement.innerHTML = '';
            data.list.forEach(item => {
                const suggestionItem = document.createElement('div');
                suggestionItem.textContent = `${item.name}, ${item.sys.country}`;
                suggestionItem.onclick = () => {
                    searchInput.value = `${item.name}, ${item.sys.country}`;
                    suggestionsElement.innerHTML = '';
                    fetchWeather(item.coord.lat, item.coord.lon);
                };
                suggestionsElement.appendChild(suggestionItem);
            });
        });
}

function getDayName(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function updateTime() {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString();
}

function displayWeatherForecast(lat, lon) {
    const apiKey = '9abaf7561f03a5566cbe8c13ec1c22ef'; // Replace with your actual API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let forecastHtml = '<h2>Hourly Weather Forecast</h2><div class="forecast-tiles">';
            
            data.list.slice(0, 24).forEach(hour => { // Limit to next 24 hours
                const time = new Date(hour.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                forecastHtml += `
                    <div class="tile">
                        <p>${time}</p>
                        <p>${hour.main.temp}°C</p>
                        <p>${hour.weather[0].description}</p>
                    </div>`;
            });
            
            forecastHtml += '</div>';
            weatherForecastElement.innerHTML = forecastHtml;
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    promptLocation();
});

setInterval(() => {
    getLocation();
    updateTime();
}, 60000);

updateTime();
getLocation();




function displayCalendar() {
    const calendarElement = document.getElementById('calendar');
    const now = new Date();

    const month = now.getMonth();
    const year = now.getFullYear();

    // Days of week and month names
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Get the first day of the month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate the calendar
    let calendarHtml = `<h2>${monthNames[month]} ${year}</h2>`;
    calendarHtml += '<table><tr>';
    
    // Header row with days of the week
    daysOfWeek.forEach(day => {
        calendarHtml += `<th>${day}</th>`;
    });

    calendarHtml += '</tr><tr>';
    
    // Fill in the blanks for the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarHtml += '<td></td>';
    }

    // Fill in the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        if ((day + firstDay - 1) % 7 === 0 && day !== 1) {
            calendarHtml += '</tr><tr>';
        }

        if (day === now.getDate()) {
            calendarHtml += `<td class="today">${day}</td>`;
        } else {
            calendarHtml += `<td>${day}</td>`;
        }
    }

    calendarHtml += '</tr></table>';
    calendarElement.innerHTML = calendarHtml;
}

// Call the displayCalendar function to show the calendar
displayCalendar();

