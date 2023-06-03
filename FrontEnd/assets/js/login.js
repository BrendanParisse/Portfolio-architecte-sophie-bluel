async function login(email, password) {
    let url = 'http://localhost:5678/api/users/login';
    try {
        let response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return data = await response.json();
    }
    catch (erreur) {
        alert("error")
    }

}

async function Submit(evenement) {
    evenement.preventDefault();
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    console.log(email)
    console.log(password)

    const data = await login(email, password)
    console.log(data)

    if (data.token) {
        localStorage.setItem('token', data.token)
        document.location.href = 'http://127.0.0.1:5500/Portfolio-architecte-sophie-bluel/FrontEnd/index.html'
    }
    else (
        alert("Email ou mot de passe invalide")
    )
}

const loginform = document.querySelector('#loginform')
loginform.addEventListener('submit', Submit);