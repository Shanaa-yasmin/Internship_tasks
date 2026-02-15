📚 Library Management System (CLI – OOP + CSV)

A Command Line Interface (CLI) based Library Management System built using Python and Object-Oriented Programming (OOP).
The system manages books, members, and transactions with due date tracking and late fee calculation.

📂 Project Structure
Library-Management-System/
│
├── library.py
├── books.csv
├── members.csv
├── transactions.csv
└── README.md

▶ How to Run

Make sure Python is installed.

python library.py

🖥 Sample Run
python library.py

====== Library Management System ======
1. Add Book
2. Register Member
3. Borrow Book
4. Return Book
5. Exit

Enter choice: 1
Enter title: It Ends With Us
Enter author: Colleen Hoover
Enter copies: 20
Book added successfully!

====== Library Management System ======
1. Add Book
2. Register Member
3. Borrow Book
4. Return Book
5. Exit

Enter choice: 2
Enter name: Aiswarya
Enter phone: 9747423690
Member registered successfully!

====== Library Management System ======
1. Add Book
2. Register Member
3. Borrow Book
4. Return Book
5. Exit

Enter choice: 3
Enter book ID: 3
Enter member ID: 3

Book borrowed successfully!
Transaction ID: 3
Due Date: 2026-02-22

====== Library Management System ======
1. Add Book
2. Register Member
3. Borrow Book
4. Return Book
5. Exit

Enter choice: 4
Enter transaction ID: 3

Book returned successfully!
Late Fee: 0

====== Library Management System ======
1. Add Book
2. Register Member
3. Borrow Book
4. Return Book
5. Exit
Enter choice: 5

📄 CSV File Format

📘 books.csv
book_id,title,author,available_copies
3,It Ends With Us,Colleen Hoover,19

👤 members.csv
member_id,name,phone
3,Aiswarya,9747423690

🔄 transactions.csv
transaction_id,book_id,member_id,borrow_date,due_date,return_date,late_fee
3,3,3,2026-02-15,2026-02-22,2026-02-15,0