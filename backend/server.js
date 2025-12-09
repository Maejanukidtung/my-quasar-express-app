const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}


app.get('/api/demo', (req, res) => {
    const logMessage = `Request at ${new Date().toISOString()}: ${req.ip}\n`;
    fs.appendFileSync(path.join(logsDir, 'access.log'), logMessage);


        git: {
            title: 'Advanced Git Workflow',
            detail: 'ใช้ branch protection บน GitHub, code review ใน PR, และ squash merge เพื่อ history สะอาด'
        },
        docker: {
            title: 'Advanced Docker',
            detail: 'ใช้ multi-stage build, healthcheck ใน Dockerfile, และ orchestration ด้วย Compose/Swarm'
        }
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


});
