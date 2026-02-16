-- Create table for Daily Questions
CREATE TABLE IF NOT EXISTS `daily_questions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `question_date` date NOT NULL,
    `pdf_url` varchar(255) NOT NULL,
    `correct_answer` char(1) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_date` (`question_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create table for User Answers to Daily Questions
CREATE TABLE IF NOT EXISTS `daily_question_answers` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `question_id` int(11) NOT NULL,
    `given_answer` char(1) NOT NULL,
    `is_correct` tinyint(1) NOT NULL,
    `answered_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `time_taken_seconds` int(11) DEFAULT 0, -- Optional: calculate time difference if frontend tracks it, or just use answered_at
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_question` (`user_id`, `question_id`)
    -- Removed Foreign Keys to avoid type mismatches with existing user_data table
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
