import csv
import os
from datetime import datetime, timedelta


BOOKS_FILE = "books.csv"
MEMBERS_FILE = "members.csv"
TRANSACTIONS_FILE = "transactions.csv"
LATE_FEE_PER_DAY = 5


# ---------------------------
# FILE INITIALIZATION
# ---------------------------
def initialize_files():
    try:
        if not os.path.exists(BOOKS_FILE):
            with open(BOOKS_FILE, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["book_id", "title", "author", "available_copies"])

        if not os.path.exists(MEMBERS_FILE):
            with open(MEMBERS_FILE, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["member_id", "name", "phone"])

        if not os.path.exists(TRANSACTIONS_FILE):
            with open(TRANSACTIONS_FILE, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["transaction_id", "book_id", "member_id",
                                 "borrow_date", "due_date", "return_date", "late_fee"])
    except Exception as e:
        print("Error initializing files:", e)


# ---------------------------
# HELPER FUNCTION
# ---------------------------
def get_next_id(filename):
    try:
        with open(filename, "r") as f:
            reader = list(csv.reader(f))
            if len(reader) <= 1:
                return 1
            return int(reader[-1][0]) + 1
    except:
        return 1


# ===========================
# BOOK CLASS
# ===========================
class Book:
    def __init__(self, title, author, copies):
        self.book_id = get_next_id(BOOKS_FILE)
        self.title = title
        self.author = author
        self.copies = copies

    def save(self):
        try:
            with open(BOOKS_FILE, "a", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([self.book_id, self.title, self.author, self.copies])
            print("Book added successfully!")
        except Exception as e:
            print("Error saving book:", e)


# ===========================
# MEMBER CLASS
# ===========================
class Member:
    def __init__(self, name, phone):
        self.member_id = get_next_id(MEMBERS_FILE)
        self.name = name
        self.phone = phone

    def save(self):
        try:
            with open(MEMBERS_FILE, "a", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([self.member_id, self.name, self.phone])
            print("Member registered successfully!")
        except Exception as e:
            print("Error saving member:", e)


# ===========================
# TRANSACTION CLASS
# ===========================
class Transaction:
    def __init__(self, book_id, member_id):
        self.transaction_id = get_next_id(TRANSACTIONS_FILE)
        self.book_id = book_id
        self.member_id = member_id
        self.borrow_date = datetime.now()
        self.due_date = self.borrow_date + timedelta(days=7)
        self.return_date = ""
        self.late_fee = 0

    def save(self):
        try:
            with open(TRANSACTIONS_FILE, "a", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([
                    self.transaction_id,
                    self.book_id,
                    self.member_id,
                    self.borrow_date.strftime("%Y-%m-%d"),
                    self.due_date.strftime("%Y-%m-%d"),
                    "",
                    self.late_fee
                ])
        except Exception as e:
            print("Error saving transaction:", e)


# ===========================
# BORROW LOGIC
# ===========================
def borrow_book():
    try:
        book_id = int(input("Enter book ID: "))
        member_id = int(input("Enter member ID: "))

        books = []
        with open(BOOKS_FILE, "r") as f:
            reader = csv.DictReader(f)
            books = list(reader)

        book_found = None
        for book in books:
            if book["book_id"] == str(book_id):
                book_found = book
                break

        if not book_found:
            raise ValueError("Book not found.")

        if int(book_found["available_copies"]) <= 0:
            raise ValueError("No copies available.")

        # Reduce copies
        book_found["available_copies"] = str(int(book_found["available_copies"]) - 1)

        with open(BOOKS_FILE, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=books[0].keys())
            writer.writeheader()
            writer.writerows(books)

        transaction = Transaction(book_id, member_id)
        transaction.save()

        print("\nBook borrowed successfully!")
        print("Transaction ID:", transaction.transaction_id)
        print("Due Date:", transaction.due_date.strftime("%Y-%m-%d"))

    except ValueError as ve:
        print("Input Error:", ve)
    except Exception as e:
        print("Unexpected Error:", e)


# ===========================
# RETURN LOGIC
# ===========================
def return_book():
    try:
        transaction_id = int(input("Enter transaction ID: "))
        transactions = []

        with open(TRANSACTIONS_FILE, "r") as f:
            reader = csv.DictReader(f)
            transactions = list(reader)

        found = None
        for t in transactions:
            if t["transaction_id"] == str(transaction_id) and t["return_date"] == "":
                found = t
                break

        if not found:
            raise ValueError("Invalid or already returned transaction ID.")

        return_date = datetime.now()
        due_date = datetime.strptime(found["due_date"], "%Y-%m-%d")

        late_days = (return_date - due_date).days
        late_fee = late_days * LATE_FEE_PER_DAY if late_days > 0 else 0

        found["return_date"] = return_date.strftime("%Y-%m-%d")
        found["late_fee"] = str(late_fee)

        with open(TRANSACTIONS_FILE, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=transactions[0].keys())
            writer.writeheader()
            writer.writerows(transactions)

        print("\nBook returned successfully!")
        print("Late Fee:", late_fee)

    except ValueError as ve:
        print("Input Error:", ve)
    except Exception as e:
        print("Unexpected Error:", e)


# ===========================
# CLI MENU
# ===========================
def main():
    initialize_files()

    while True:
        print("\n====== Library Management System ======")
        print("1. Add Book")
        print("2. Register Member")
        print("3. Borrow Book")
        print("4. Return Book")
        print("5. Exit")

        try:
            choice = int(input("Enter choice: "))

            if choice == 1:
                title = input("Enter title: ")
                author = input("Enter author: ")
                copies = int(input("Enter copies: "))
                if copies < 0:
                    raise ValueError("Copies cannot be negative.")
                Book(title, author, copies).save()

            elif choice == 2:
                name = input("Enter name: ")
                phone = input("Enter phone: ")
                if not phone.isdigit():
                    raise ValueError("Phone must be numeric.")
                Member(name, phone).save()

            elif choice == 3:
                borrow_book()

            elif choice == 4:
                return_book()

            elif choice == 5:
                break

            else:
                print("Invalid choice!")

        except ValueError as ve:
            print("Input Error:", ve)
        except Exception as e:
            print("Unexpected Error:", e)


if __name__ == "__main__":
    main()
