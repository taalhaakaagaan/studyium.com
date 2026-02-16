const db = require('./db');
const { app } = require('electron');

// Mock data path for session (if needed, or just hardcode for now)
const path = require('path');
const fs = require('fs');

async function debugTutorData() {
    try {
        console.log("--- DEBUGGING TUTOR DATA ---");

        // 1. List all Tutors
        const [tutors] = await db.execute("SELECT * FROM tutors");
        console.log("Total Tutors:", tutors.length);
        tutors.forEach(t => console.log(`Tutor ID: ${t.id}, User ID: ${t.user_id}, Subjects: ${t.subjects}`));

        // 2. List all Bookings
        const [bookings] = await db.execute("SELECT * FROM bookings LIMIT 10");
        console.log("\nSample Bookings:", bookings.length);
        bookings.forEach(b => console.log(`Booking ID: ${b.id}, Student ID: ${b.student_id}, Tutor ID: ${b.tutor_id}, Status: ${b.status}`));

        // 3. Specific Check for a known user (if we knew ID)
        // Let's check for ANY bookings for ANY found tutor
        if (tutors.length > 0) {
            const firstTutorId = tutors[0].id;
            console.log(`\nChecking students for Tutor ID ${firstTutorId}...`);
            const [students] = await db.execute(`
                SELECT DISTINCT u.id, u.name 
                FROM bookings b 
                JOIN user_data u ON b.student_id = u.id 
                WHERE b.tutor_id = ?
            `, [firstTutorId]);
            console.log("Students found:", students);
        }

    } catch (e) {
        console.error("Debug Error:", e);
    } finally {
        process.exit();
    }
}

debugTutorData();
