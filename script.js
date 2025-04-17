// องค์ประกอบของ DOM
const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const forecastContainer = document.querySelector('.forecast-container');
const celsiusBtn = document.querySelector('.celsius');
const fahrenheitBtn = document.querySelector('.fahrenheit');

// API Key สำหรับ OpenWeatherMap
const API_KEY = '3ad5780286f82bc093533e51890eb143'; // ใส่ API Key จาก OpenWeatherMap ของคุณที่นี่

// ตัวแปรสำหรับเก็บข้อมูลอุณหภูมิ
let tempData = {
    celsius: 0,
    fahrenheit: 0,
    unit: 'celsius',
    forecastCelsius: [],
    forecastFahrenheit: []
};

// วันในสัปดาห์เป็นภาษาไทย
const daysInThai = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const monthsInThai = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

// แปลคำอธิบายสภาพอากาศเป็นภาษาไทย
const weatherTranslations = {
    'clear sky': 'ท้องฟ้าโปร่ง',
    'few clouds': 'มีเมฆบางส่วน',
    'scattered clouds': 'มีเมฆกระจาย',
    'broken clouds': 'มีเมฆเป็นส่วนมาก',
    'shower rain': 'ฝนตกปรอยๆ',
    'rain': 'ฝนตก',
    'thunderstorm': 'พายุฝนฟ้าคะนอง',
    'snow': 'หิมะตก',
    'mist': 'มีหมอก',
    'overcast clouds': 'เมฆมาก',
    'light rain': 'ฝนตกเล็กน้อย',
    'moderate rain': 'ฝนตกปานกลาง',
    'heavy intensity rain': 'ฝนตกหนัก',
    'very heavy rain': 'ฝนตกหนักมาก',
    'extreme rain': 'ฝนตกรุนแรง',
    'freezing rain': 'ฝนที่เป็นน้ำแข็ง',
    'light intensity shower rain': 'ฝนตกปรอยเล็กน้อย',
    'heavy intensity shower rain': 'ฝนตกปรอยหนัก',
    'drizzle': 'ฝนละอองเล็กน้อย'
};

// ฟังก์ชันสำหรับแปลงวันที่เป็นรูปแบบไทย
function formatDateThai(date) {
    const day = daysInThai[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = monthsInThai[date.getMonth()];
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    
    return `วัน${day}ที่ ${dayOfMonth} ${month} ${year}`;
}

// สร้างฟังก์ชันสำหรับแปลงวันในรูปแบบย่อ (สำหรับพยากรณ์)
function formatShortDayThai(date) {
    return `วัน${daysInThai[date.getDay()]}`;
}

// Event Listener สำหรับปุ่มค้นหา
search.addEventListener('click', () => {
    getWeatherData();
});

// Event Listener สำหรับกดปุ่ม Enter
document.querySelector('.search-box input').addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        getWeatherData();
    }
});

// Event Listener สำหรับเปลี่ยนหน่วยอุณหภูมิ
celsiusBtn.addEventListener('click', () => {
    if (tempData.unit !== 'celsius') {
        tempData.unit = 'celsius';
        updateTemperatureDisplay();
        
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (tempData.unit !== 'fahrenheit') {
        tempData.unit = 'fahrenheit';
        updateTemperatureDisplay();
        
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
    }
});

// ฟังก์ชันสำหรับแปลงชื่อเมืองภาษาไทยเป็นอังกฤษ (สำหรับบางเมืองหลักที่มีการใช้บ่อย)
function translateThaiCityToEnglish(thaiCity) {
    const thaiCityMap = {
        'กรุงเทพ': 'Bangkok',
        'กรุงเทพมหานคร': 'Bangkok',
        'เชียงใหม่': 'Chiang Mai',
        'ภูเก็ต': 'Phuket',
        'พัทยา': 'Pattaya',
        'หาดใหญ่': 'Hat Yai',
        'เชียงราย': 'Chiang Rai',
        'ขอนแก่น': 'Khon Kaen',
        'อุดรธานี': 'Udon Thani',
        'นครราชสีมา': 'Nakhon Ratchasima',
        'โคราช': 'Nakhon Ratchasima',
        'อุบลราชธานี': 'Ubon Ratchathani',
        'นครศรีธรรมราช': 'Nakhon Si Thammarat',
        'สุราษฎร์ธานี': 'Surat Thani',
        'หัวหิน': 'Hua Hin',
        'ชลบุรี': 'Chonburi',
        'อยุธยา': 'Ayutthaya',
        'พระนครศรีอยุธยา': 'Ayutthaya',
        'สมุทรปราการ': 'Samut Prakan',
        'นนทบุรี': 'Nonthaburi',
        'เชียงฮาย': 'Chiang Rai',
        'แม่ฮ่องสอน': 'Mae Hong Son',
        'กระบี่': 'Krabi',
        'พังงา': 'Phang Nga',
        'สมุย': 'Koh Samui',
        'เกาะสมุย': 'Koh Samui'
    };
    
    return thaiCityMap[thaiCity] || thaiCity;
}

// ฟังก์ชันหลักสำหรับดึงข้อมูลสภาพอากาศ
function getWeatherData() {
    let city = document.querySelector('.search-box input').value;
    
    if (city === '')
        return;
    
    // ตรวจสอบว่าเป็นภาษาไทยหรือไม่และแปลงเป็นภาษาอังกฤษถ้าจำเป็น
    const isThaiLanguage = /[\u0E00-\u0E7F]/.test(city);
    if (isThaiLanguage) {
        city = translateThaiCityToEnglish(city);
    }

    // ดึงข้อมูลสภาพอากาศปัจจุบัน
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=th`)
        .then(response => response.json())
        .then(json => {
            // ถ้าเมืองไม่ถูกต้อง
            if (json.cod === '404') {
                showError();
                return;
            }

            // แสดงข้อมูลสภาพอากาศปัจจุบัน
            hideError();
            showCurrentWeather(json);
            
            // เปลี่ยนพื้นหลังตามสภาพอากาศ
            setWeatherBackground(json.weather[0].main.toLowerCase());
            
            // ดึงข้อมูลพยากรณ์อากาศ 5 วัน
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}&lang=th`);
        })
        .then(response => {
            if (response) return response.json();
        })
        .then(forecastData => {
            if (forecastData) {
                showForecast(forecastData);
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

// ฟังก์ชันแสดงข้อมูลพยากรณ์อากาศปัจจุบัน
function showCurrentWeather(data) {
    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('.temperature');
    const description = document.querySelector('.description');
    const humidity = document.querySelector('.humidity span');
    const wind = document.querySelector('.wind span');
    const dateElement = document.querySelector('.date');
    const locationElement = document.querySelector('.location');
    
    // แปลงอุณหภูมิและเก็บไว้
    tempData.celsius = Math.round(data.main.temp);
    tempData.fahrenheit = Math.round((data.main.temp * 9/5) + 32);
    
    // แสดงไอคอนสภาพอากาศ
    image.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    // แสดงคำอธิบายสภาพอากาศเป็นภาษาไทย 
    // เนื่องจากเราใช้ lang=th ใน API ทำให้ได้คำอธิบายเป็นภาษาไทยอยู่แล้ว
    description.innerHTML = data.weather[0].description;
    
    // แสดงความชื้นและความเร็วลม
    humidity.innerHTML = `${data.main.humidity}%`;
    wind.innerHTML = `${data.wind.speed} km/h`;
    
    // แสดงวันที่
    const currentDate = new Date();
    dateElement.innerHTML = formatDateThai(currentDate);
    
    // แสดงชื่อเมือง
    locationElement.innerHTML = `${data.name}, ${data.sys.country}`;
    
    // แสดงอุณหภูมิตามหน่วยที่เลือก
    updateTemperatureDisplay();
    
    // แสดงข้อมูลสภาพอากาศ
    weatherBox.classList.add('active');
}

// แก้ไขฟังก์ชันแสดงข้อมูลพยากรณ์อากาศ 5 วัน
function showForecast(data) {
    const forecastBox = document.querySelector('.forecast-box');
    forecastBox.innerHTML = '';
    
    // รีเซ็ตข้อมูลอุณหภูมิพยากรณ์
    tempData.forecastCelsius = [];
    tempData.forecastFahrenheit = [];
    
    // ดึงข้อมูลพยากรณ์โดยใช้เฉพาะข้อมูล 1 รายการต่อวัน
    const dailyForecasts = {};
    const currentDate = new Date().setHours(0, 0, 0, 0);
    
    // วนลูปข้อมูลพยากรณ์ทั้งหมด
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString(); // ใช้วันเป็น key
        
        // ถ้าเป็นวันใหม่และไม่ใช่วันปัจจุบัน
        const itemDay = date.setHours(0, 0, 0, 0);
        if (!dailyForecasts[dateKey] && itemDay > currentDate) {
            dailyForecasts[dateKey] = item;
        }
    });
    
    // แปลงเป็น array และเลือกเฉพาะ 5 วันแรก
    const fiveDayForecast = Object.values(dailyForecasts).slice(0, 5);
    
    fiveDayForecast.forEach(item => {
        const date = new Date(item.dt * 1000);
        const tempCelsius = Math.round(item.main.temp);
        const tempFahrenheit = Math.round((item.main.temp * 9/5) + 32);
        
        // เก็บข้อมูลอุณหภูมิ
        tempData.forecastCelsius.push(tempCelsius);
        tempData.forecastFahrenheit.push(tempFahrenheit);
        
        // สร้าง element สำหรับแต่ละวัน
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        
        const dayTemp = tempData.unit === 'celsius' ? tempCelsius : tempFahrenheit;
        const unit = tempData.unit === 'celsius' ? '°C' : '°F';
        
        forecastItem.innerHTML = `
            <span class="day">${formatShortDayThai(date)}</span>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="สภาพอากาศ">
            <span class="temp">${dayTemp}${unit}</span>
        `;
        
        forecastBox.appendChild(forecastItem);
    });
    
    // แสดงส่วนพยากรณ์อากาศ
    forecastContainer.classList.add('active');
}

// ฟังก์ชันอัปเดตการแสดงอุณหภูมิตามหน่วยที่เลือก
function updateTemperatureDisplay() {
    const temperature = document.querySelector('.temperature');
    const forecastItems = document.querySelectorAll('.forecast-item .temp');
    
    // อัปเดตอุณหภูมิปัจจุบัน
    if (tempData.unit === 'celsius') {
        temperature.innerHTML = `${tempData.celsius}°<span>C</span>`;
    } else {
        temperature.innerHTML = `${tempData.fahrenheit}°<span>F</span>`;
    }
    
    // อัปเดตอุณหภูมิในพยากรณ์
    if (forecastItems.length > 0) {
        forecastItems.forEach((item, index) => {
            const temp = tempData.unit === 'celsius' ? 
                tempData.forecastCelsius[index] : 
                tempData.forecastFahrenheit[index];
            const unit = tempData.unit === 'celsius' ? '°C' : '°F';
            item.innerHTML = `${temp}${unit}`;
        });
    }
}

// ฟังก์ชันแสดงข้อความเมื่อไม่พบเมือง
function showError() {
    weatherBox.classList.remove('active');
    forecastContainer.classList.remove('active');
    error404.classList.add('active');
}

// ฟังก์ชันซ่อนข้อความเมื่อไม่พบเมือง
function hideError() {
    error404.classList.remove('active');
}

// ฟังก์ชันเปลี่ยนพื้นหลังตามสภาพอากาศ
function setWeatherBackground(weatherType) {
    // ลบคลาสพื้นหลังทั้งหมดก่อน
    document.body.classList.remove('clear', 'clouds', 'rain', 'drizzle', 'snow', 'thunderstorm', 'mist', 'fog');
    
    // เพิ่มคลาสตามสภาพอากาศ
    document.body.classList.add(weatherType);
}