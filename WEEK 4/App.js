// =======================================
// TypeScript-like Interface (for understanding)
// interface User {
//    id: number;
//    name: string;
//    email: string;
// }
// =======================================
// API Layer (Async Programming)
const UserAPI = {
    fetchUsers: async function () {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const success = true;
                if (success) {
                    resolve([
                        { id: 1, name: "Aman", email: "aman@gmail.com" },
                        { id: 2, name: "Sumith", email: "sumith@gmail.com" },
                        { id: 3, name: "Jashwanth", email: "jashwanth@gmail.com" },
                        { id: 4, name: "Afreeda", email: "afreeda@gmail.com" },
                        { id: 5, name: "Asthra", email: "asthra@gmail.com" },
                        { id: 6, name: "Zaid", email: "zaid@gmail.com" },
                        { id: 7, name: "Faisal", email: "faisal@gmail.com" },
                        { id: 8, name: "Charan", email: "charan@gmail.com" },
                        { id: 9, name: "Harsha", email: "harsha@gmail.com" },
                        { id: 10, name: "Vishwa", email: "vishwa@gmail.com" }
                    ]);
                } else {
                    reject("Failed to fetch users");
                }
            }, 2000);
        });
    }
};
// UI Layer
const UI = {
    displayUsers(users) {
        const userList = document.getElementById("userList");
        userList.innerHTML = "";
        users.forEach(user => {
            const li = document.createElement("li");
            li.textContent = `${user.name} - ${user.email}`;
            userList.appendChild(li);
        });
    }
};
// Controller Layer
async function loadUsers() {
    try {
        console.log("Loading users...");
        const users = await UserAPI.fetchUsers();
        UI.displayUsers(users);
        console.log("Users loaded successfully");
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
    }
}