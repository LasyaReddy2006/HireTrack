-- ====================================================================
-- HireTrack — Job Application Tracker Database Schema
-- Database Name: hiretrack
-- Target: MySQL 8.0+
-- ====================================================================

-- 1. Create database if it does not already exist
CREATE DATABASE IF NOT EXISTS hiretrack;
USE hiretrack;

-- 2. Drop existing tables in reverse order of foreign key dependency
DROP TABLE IF EXISTS Applications;
DROP TABLE IF EXISTS JobListings;
DROP TABLE IF EXISTS Users;

-- ====================================================================
-- Table 1: Users
-- Stores registered students / job seekers
-- ====================================================================
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Stored as bcrypt hash (60 chars)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- Table 2: Applications
-- Tracks job applications created by users.
-- Linked to Users via user_id foreign key (One-to-Many relationship).
-- ON DELETE CASCADE ensures if a user account is deleted, their applications are cleaned up.
-- ====================================================================
CREATE TABLE Applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    job_type ENUM('Full-time', 'Part-time', 'Internship') NOT NULL DEFAULT 'Full-time',
    status ENUM('Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn') NOT NULL DEFAULT 'Applied',
    application_date DATE NOT NULL,
    job_url VARCHAR(500) NULL,
    salary VARCHAR(100) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint connecting to Users table
    CONSTRAINT fk_applications_user
        FOREIGN KEY (user_id) REFERENCES Users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Indexes to speed up common queries (filtering by user, status, and date)
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_app_date (application_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- Table 3: JobListings
-- Curated campus & off-campus job openings that students can browse
-- and add directly to their tracker.
-- ====================================================================
CREATE TABLE JobListings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    job_type ENUM('Full-time', 'Part-time', 'Internship') NOT NULL DEFAULT 'Full-time',
    required_skills VARCHAR(255) NOT NULL,
    application_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_job_type (job_type),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- Sample Data for JobListings
-- Clearly labeled sample CSE placement opportunities
-- ====================================================================
INSERT INTO JobListings (company_name, job_title, location, job_type, required_skills, application_url)
VALUES
('Google', 'Software Engineering Intern (Summer 2026)', 'Bangalore, India', 'Internship', 'Data Structures, Algorithms, C++, Java, Python', 'https://careers.google.com'),
('Microsoft', 'Software Engineer (Full-Time Graduate)', 'Hyderabad, India', 'Full-time', 'C#, Azure, React, Distributed Systems, SQL', 'https://careers.microsoft.com'),
('Amazon', 'SDE 1 (Campus Placement)', 'Bangalore, India', 'Full-time', 'Java, Object-Oriented Design, AWS, Microservices', 'https://amazon.jobs'),
('Zoho Corporation', 'Software Developer', 'Chennai, India', 'Full-time', 'Java, JavaScript, C++, Problem Solving, Database Systems', 'https://careers.zohocorp.com'),
('TCS Digital', 'Systems Engineer (Cadre)', 'Pan-India / Remote', 'Full-time', 'Full Stack Development, Python, Cloud, SQL', 'https://www.tcs.com/careers'),
('Infosys Springboard', 'Graduate Trainee Engineer', 'Mysore / Pune', 'Full-time', 'Java, Spring Boot, React, Web Development', 'https://www.infosys.com/careers'),
('Razorpay', 'Backend Engineering Intern', 'Bangalore, India', 'Internship', 'Node.js, Express, MySQL, Redis, REST APIs', 'https://razorpay.com/jobs'),
('Cred', 'Frontend Developer (Junior)', 'Bangalore, India', 'Full-time', 'React.js, CSS, JavaScript ES6+, Web Performance', 'https://careers.cred.club'),
('Accenture', 'Associate Software Engineer', 'Hyderabad, India', 'Full-time', 'Computer Networks, DBMS, Software Engineering, Python', 'https://accenture.com/careers'),
('Swiggy', 'Product Engineering Intern', 'Bangalore, India', 'Internship', 'Golang, Node.js, MySQL, Distributed Caching', 'https://swiggy.com/careers');
