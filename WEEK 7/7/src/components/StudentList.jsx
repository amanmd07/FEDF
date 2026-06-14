import { useContext } from "react";
import StudentContext from "../StudentContext";
import "./StudentList.css";

function StudentList() {

    const { students } = useContext(StudentContext);

    return (
        <section className="student-list-card">
            <div className="student-list-header">
                <div>
                    <h3 className="student-list-title">Student List</h3>
                    <p className="student-list-subtitle">
                        {students.length === 1
                            ? "1 student enrolled"
                            : `${students.length} students enrolled`}
                    </p>
                </div>

                <span className="student-list-count">{students.length}</span>
            </div>

            {students.length === 0 ? (
                <p className="student-list-empty">No students added yet.</p>
            ) : (
                <ul className="student-list">
                    {students.map((student, index) => (
                        <li className="student-list-item" key={index}>
                            <span className="student-list-avatar">
                                {student.trim().charAt(0).toUpperCase() || "S"}
                            </span>
                            <span className="student-list-name">{student}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default StudentList;
