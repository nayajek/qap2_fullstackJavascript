const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

class Router extends EventEmitter {
    constructor() {
        super();
        this.on('route', this.routeHandler);
        this.on('status', this.statusHandler);
        this.on('fileReadSuccess', this.fileReadSuccessHandler);
        this.on('fileReadError', this.fileReadErrorHandler);
    }

    routeHandler(req, res) {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = parsedUrl.pathname;

        console.log(`Received request for ${pathname}`);

        switch (pathname) {
            case '/':
                this.emit('status', 200, 'Home route accessed');
                this.serveFile(res, path.join(__dirname, 'views', 'index.html'));
                break;
            case '/about':
                this.emit('status', 200, 'About route accessed');
                this.serveFile(res, path.join(__dirname, 'views', 'about.html'));
                break;
            case '/contact':
                this.emit('status', 200, 'Contact route accessed');
                this.serveFile(res, path.join(__dirname, 'views', 'contact.html'));
                break;
            case '/products':
                this.emit('status', 200, 'Products route accessed');
                this.serveFile(res, path.join(__dirname, 'views', 'products.html'));
                break;
            case '/subscribe':
                this.emit('status', 200, 'Subscribe route accessed');
                this.serveFile(res, path.join(__dirname, 'views', 'subscribe.html'));
                break;
            case '/clearance':
                    this.emit('status', 200, 'Clearance route accessed');
                    this.serveFile(res, path.join(__dirname, 'views', 'clearance.html'));
                    break;
            case '/daily':
                this.emit('status', 200, 'Daily route accessed');
                this.serveFile(res, path.join(__dirname, 'views', 'daily.html'));
                break;
            default:
                this.emit('status', 404, 'error route accessed');
                this.serveFile(res, path.join(__dirname, 'views', 'error.html'), 404);
                break;
        }
    }

    async getDailyInfo(res) {
        try {
            // Replace 'London' with the desired city
            const city = 'London';
            const apiKey = process.env.OPENWEATHERMAP_API_KEY;
            const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
            const weatherData = weatherResponse.data;

            // Read the daily.html file and inject the weather data
            fs.readFile(path.join(__dirname, 'views', 'daily.html'), 'utf8', (err, data) => {
                if (err) {
                    this.emit('fileReadError', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                    return;
                }

                // Inject weather data into the HTML
                const modifiedData = data.replace('<!-- Daily information will be displayed here -->', `
                    <h2>Weather in ${weatherData.name}</h2>
                    <p>Temperature: ${(weatherData.main.temp - 273.15).toFixed(2)}°C</p>
                    <p>Weather: ${weatherData.weather[0].description}</p>
                `);

                this.emit('fileReadSuccess', path.join(__dirname, 'views', 'daily.html'));
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(modifiedData);
            });
        } catch (error) {
            this.emit('fileReadError', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }

    serveFile(res, filePath, statusCode = 200) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                this.emit('fileReadError', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
            this.emit('fileReadSuccess', filePath);
            res.writeHead(statusCode, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }

    statusHandler(statusCode, message) {
        console.log(`Status: ${statusCode} - ${message}`);
        if (statusCode >= 400) {
            console.warn(`Warning: ${message}`);
        }
    }

    fileReadSuccessHandler(filePath) {
        console.log(`File read successfully: ${filePath}`);
    }

    fileReadErrorHandler(err) {
        console.error(`Error reading file: ${err.message}`);
    }
}

module.exports = new Router();
