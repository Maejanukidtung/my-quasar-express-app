const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// สร้างโฟลเดอร์ logs หากยังไม่มี
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// =========================
//  ROUTE: /api/demo
// =========================
app.get('/api/demo', (req, res) => {
    const logMessage = `Request at ${new Date().toISOString()}: ${req.ip}\n`;
    fs.appendFileSync(path.join(logsDir, 'access.log'), logMessage);

    res.json({
        user: {
            firstname: "Jakapat",
            lastname: "Jaroen",
            studentId: "6604101313"
        },
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

// =========================
//  ROUTE ใหม่: /api/tasks
// =========================
app.get('/api/tasks', (req, res) => {
    res.json([
        { id: 1, task: "Learn Express", status: "done" },
        { id: 2, task: "Fix backend", status: "in-progress" },
        { id: 3, task: "Test API", status: "pending" }
    ]);
});

// =========================
//  DEFAULT ROUTE
// =========================
app.get('/', (req, res) => {
    res.send("Backend is running ✔ (Try /api/demo or /api/tasks)");
});

// =========================
//  ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// =========================
//  START SERVER
// =========================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
