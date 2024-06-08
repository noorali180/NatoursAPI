const loginForm = document.querySelector(".form__login");

const login = async function (email, password) {
  try {
    const res = await axios({
      path: "/",
      method: "POST",
      maxAge: 900000,
      url: "http://127.0.0.1:3000/api/v1/users/login",
      withCredentials: true,
      data: { email: email, password: password },
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
