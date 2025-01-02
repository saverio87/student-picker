const arr = [
    'Mark', 'Bob', 'Marta', 'Jerry', 'Dean', 'Sam', 'Don', 'Dolores', 'Nathan', 'Thomas', 'Conan', 'Connor',
    'Zelda', 'Link', 'Trent', 'Gigi', 'Angel', 'Angela', 'David', 'Helen', 'Ronald', 'Nick', 'Kyle', 'Connor2',
    'Donald', 'Nicky', 'Nikita', 'Chris', 'Sarah', 'Andrew', 'Christopher',
    'Greg', 'Nelson', 'Ned', 'Homer', 'Peter', 'Max', 'Jude', 'Diego', 'Martin',
]


document.getElementById("generateSampleList").addEventListener("click", () => {
    const students = arr;
    // Save the students array in localStorage to pass to the classroom page
    localStorage.setItem("students", JSON.stringify(students));
    // Redirect to classroom.html
    window.location.href = "classroom.html";


});


document.getElementById("generateClassroom").addEventListener("click", () => {
    const studentList = document.querySelector(".studentList").value.trim();

    if (!studentList) {
        alert("Please enter at least one student.");
        return;
    }

    // Split the list into an array based on line breaks
    const students = studentList.split(/\r?\n/).filter(name => name.trim() !== "");
    // Save the students array in localStorage to pass to the classroom page
    localStorage.setItem("students", JSON.stringify(students));
    // Redirect to classroom.html
    window.location.href = "classroom.html";
});

