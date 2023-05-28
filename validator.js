const axios = require('axios');

async function validate() {
    try {
        // Validate XSS vulnerability
        const xssResponse = await axios.get('http://localhost:3000/?name=<script>alert("XSS")</script>');
        if (xssResponse.data.includes('<script>alert("XSS")</script>')) {
            console.log('XSS vulnerability exists. Not fixed yet.');
        } else {
            console.log('XSS vulnerability fixed successfully!');
        }

        // Validate Broken Access Control and IDOR vulnerabilities
        const userResponse = await axios.get('http://localhost:3000/user/1');
        if (userResponse.data.includes('<p>Name: Alice</p><p>Email: alice@example.com</p>')) {
            console.log('Broken Access Control and IDOR vulnerabilities exist. Not fixed yet.');
        } else {
            console.log('Broken Access Control and IDOR vulnerabilities fixed successfully!');
        }
    } catch (error) {
        console.error('Error occurred during validation:', error.message);
    }
}

validate();
