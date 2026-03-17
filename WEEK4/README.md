# Student Management System (CLI)

A Python command-line application to manage students and their subject marks using **MySQL** and **SQLAlchemy**.

## Features

- Add a student with multiple subjects and scores
- Automatically calculate grades (`A`, `B`, `C`, `D`, `F`)
- View all students with marks
- Search by name, grade, or student ID
- Update student name and subject score
- Delete student records
- Export student data to CSV (`students_export.csv`)

## Project Structure

- `main.py` - CLI menu and student operations
- `database.py` - SQLAlchemy database connection/session setup
- `database_schema` - SQL script for database/table creation
- `students_export.csv` - exported data file

## Prerequisites

- Python 3.8+
- MySQL Server running locally
- A MySQL user with permission to create/use databases

## Database Setup

1. Open MySQL and run the SQL in `database_schema`:

```sql
CREATE DATABASE student_db;
USE student_db;

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE marks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    subject VARCHAR(100),
    score INT,
    grade VARCHAR(2),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

2. Update connection credentials in `database.py` if needed:

```python
DATABASE_URL = "mysql+pymysql://<username>:<password>@localhost/student_db"
```

## Installation

From the project folder:

```powershell
pip install sqlalchemy pymysql
```

## Run

```powershell
python main.py
```

## Menu Options

1. Add Student
2. View Students
3. Search Student
4. Update Student
5. Delete Student
6. Export to CSV
7. Exit

## Notes

- The app uses SQLAlchemy Core reflection (`autoload_with=engine`) to load tables.
- Deleting a student also deletes marks (`ON DELETE CASCADE`).
