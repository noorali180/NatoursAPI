const loginForm = document.querySelector(".form__login");

const login = async function (email, password) {
  try {
    const res = await axios("http://127.0.0.1:3000/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // specify the content type as JSON
      },
      data: JSON.stringify({ email: email, password: password }),
    });

    console.log(res);
  } catch (err) {
    console.log(err.response.data);
  }
};

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  login(email, password);
});
