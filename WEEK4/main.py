from sqlalchemy import MetaData, Table, select
from database import engine, SessionLocal
import csv


metadata = MetaData()

students = Table("students", metadata, autoload_with=engine)
marks = Table("marks", metadata, autoload_with=engine)


# ---------------- GRADE FUNCTION ----------------
def calculate_grade(score):
    if score >= 90:
        return "A"
    elif score >= 75:
        return "B"
    elif score >= 60:
        return "C"
    elif score >= 40:
        return "D"
    else:
        return "F"


# ---------------- ADD STUDENT ----------------
def add_student():
    db = SessionLocal()

    name = input("Enter student name: ")
    result = db.execute(students.insert().values(name=name))
    db.commit()

    student_id = result.lastrowid

    n = int(input("How many subjects? "))
    for _ in range(n):
        subject = input("Subject: ")
        score = int(input("Score: "))
        grade = calculate_grade(score)

        db.execute(
            marks.insert().values(
                student_id=student_id,
                subject=subject,
                score=score,
                grade=grade
            )
        )

    db.commit()
    db.close()
    print("Student added successfully!\n")


# ---------------- VIEW STUDENTS ----------------
def view_students():
    db = SessionLocal()

    stmt = select(
        students.c.id,
        students.c.name,
        marks.c.subject,
        marks.c.score,
        marks.c.grade
    ).join(
        marks, students.c.id == marks.c.student_id, isouter=True
    ).order_by(students.c.id)

    result = db.execute(stmt).fetchall()

    current_student = None

    for row in result:
        if current_student != row.id:
            print(f"\nStudent ID: {row.id}")
            print(f"Name: {row.name}")
            print("Marks:")
            current_student = row.id

        print(f"   {row.subject} - {row.score} ({row.grade})")

    db.close()


# ---------------- SEARCH STUDENT ----------------
def search_student():
    db = SessionLocal()

    search_type = input("Search by (name/grade/id): ").strip().lower()

    base_stmt = select(
        students.c.id,
        students.c.name,
        marks.c.subject,
        marks.c.score,
        marks.c.grade
    ).join(
        marks, students.c.id == marks.c.student_id, isouter=True
    )

    if search_type == "name":
        search_name = input("Enter student name to search: ").strip()
        stmt = base_stmt.where(students.c.name.like(f"%{search_name}%"))
    elif search_type == "grade":
        search_grade = input("Enter grade to search (A/B/C/D/F): ").strip().upper()
        stmt = base_stmt.where(marks.c.grade == search_grade)
    elif search_type == "id":
        try:
            search_id = int(input("Enter student ID to search: "))
        except ValueError:
            print("Invalid input. Please enter a numeric student ID.\n")
            db.close()
            return
        stmt = base_stmt.where(students.c.id == search_id)
    else:
        print("Invalid search type. Please choose name, grade, or id.\n")
        db.close()
        return

    result = db.execute(stmt).fetchall()

    if not result:
        print("No student found!\n")
    else:
        for row in result:
            print(f"\nStudent ID: {row.id}")
            print(f"Name: {row.name}")
            print(f"   {row.subject} - {row.score} ({row.grade})")

    db.close()


# ---------------- UPDATE STUDENT ----------------
def update_student():
    db = SessionLocal()

    try:
        student_id = int(input("Enter student ID to update: "))
    except ValueError:
        print("Invalid input. Please enter a numeric student ID.\n")
        db.close()
        return
    student_exists = db.execute(
        select(students.c.id).where(students.c.id == student_id)
    ).fetchone()

    if not student_exists:
        print("Student not found.\n")
        db.close()
        return

    new_name = input("Enter new name (leave blank to keep unchanged): ").strip()
    if new_name:
        db.execute(
            students.update()
            .where(students.c.id == student_id)
            .values(name=new_name)
        )

    subject = input("Enter subject to update mark (leave blank to skip): ").strip()
    if subject:
        try:
            new_score = int(input("Enter new score: "))
        except ValueError:
            print("Invalid input. Please enter a numeric score.\n")
            db.close()
            return

        new_grade = calculate_grade(new_score)
        result = db.execute(
            marks.update()
            .where(
                (marks.c.student_id == student_id) &
                (marks.c.subject == subject)
            )
            .values(score=new_score, grade=new_grade)
        )

        if result.rowcount == 0:
            print("Subject not found for this student.\n")
            db.close()
            return

    db.commit()
    db.close()
    print("Student record updated successfully!\n")


# ---------------- DELETE STUDENT ----------------
def delete_student():
    db = SessionLocal()

    try:
        student_id = int(input("Enter student ID to delete: "))
    except ValueError:
        print("Invalid input. Please enter a numeric student ID.\n")
        db.close()
        return
    db.execute(
        students.delete().where(students.c.id == student_id)
    )

    db.commit()
    db.close()
    print("Student deleted successfully!\n")


# ---------------- EXPORT TO CSV ----------------
def export_to_csv():
    db = SessionLocal()

    stmt = select(
        students.c.id,
        students.c.name,
        marks.c.subject,
        marks.c.score,
        marks.c.grade
    ).join(
        marks, students.c.id == marks.c.student_id, isouter=True
    )

    result = db.execute(stmt).fetchall()

    with open("students_export.csv", "w", newline="") as file:
        writer = csv.writer(file)

        writer.writerow(["Student ID", "Name", "Subject", "Score", "Grade"])

        for row in result:
            writer.writerow([row.id, row.name, row.subject, row.score, row.grade])

    db.close()
    print("Data exported to students_export.csv successfully!\n")


# ---------------- MENU ----------------
def menu():
    while True:
        print("\n===== STUDENT MANAGEMENT SYSTEM =====")
        print("1. Add Student")
        print("2. View Students")
        print("3. Search Student")
        print("4. Update Student")
        print("5. Delete Student")
        print("6. Export to CSV")
        print("7. Exit")

        choice = input("Enter choice: ")

        if choice == "1":
            add_student()
        elif choice == "2":
            view_students()
        elif choice == "3":
            search_student()
        elif choice == "4":
            update_student()
        elif choice == "5":
            delete_student()
        elif choice == "6":
            export_to_csv()
        elif choice == "7":
            break
        else:
            print("Invalid choice!")


if __name__ == "__main__":
    menu()