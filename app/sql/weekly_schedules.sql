CREATE TABLE IF NOT EXISTS weekly_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    student_id INT, -- Nullable, if for a specific student
    group_id INT,   -- Nullable, if for a group
    day_of_week VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_live BOOLEAN DEFAULT FALSE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    block_type VARCHAR(50) DEFAULT 'lesson', -- 'lesson', 'availability', etc.
    FOREIGN KEY (teacher_id) REFERENCES user_data(id) ON DELETE CASCADE
    -- Foreign keys for student/group can be added if strict integrity is desired, 
    -- but usually omitted if those tables might not exist or IDs are loose.
    -- keeping it simple for now as requested.
);
