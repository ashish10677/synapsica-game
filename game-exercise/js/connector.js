const BASE_URL = 'http://localhost:3000/user'

function signUpUser() {
    let email = document.getElementById('register-email').value;
    let name = document.getElementById('register-name').value;
    let password = document.getElementById('register-password').value;
    let confirmPassword = document.getElementById('register-confirm').value;
    if (!email || !name || !password) {
        alert("Fields are required!");
        return;
    }
    if (password != confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({ "firstName": name, "email": email, "password": password, "attempts": 0 });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
        mode: 'cors'
    };

    fetch(`${BASE_URL}/register`, requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            if (result.success) {
                alert("User registered successfully! Please login to continue.");
                return;
            }
            showError(result.message);
        }).catch(error => {
            console.log('error', error)
        });
}

function loginUser() {
    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert("Email and password are required!");
        return;
    }

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let raw = { email, password };

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(raw),
        redirect: 'follow',
        mode: 'cors',
        credentials: 'include'
    };

    fetch(`${BASE_URL}/login`, requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if (result.success) {
                window.location.replace('http://localhost:8080/game.html')
                return;
            }
            showError(result.message);
        })
        .catch(error => {
            console.log('error', error)
        });
}

function setScore(score) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = { "score": score };

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(raw),
        redirect: 'follow',
        mode: 'cors',
        credentials: 'include'
    };

    fetch(`${BASE_URL}/setscore`, requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                console.log("Score updated");
                return;
            }
            showError(result.message);
        }).catch(error => {
            console.log(error);
        })
}

function isAllowed() {
    let requestOptions = {
        method: 'GET',
        redirect: 'follow',
        credentials: 'include'
    };

    return fetch(`${BASE_URL}/attempts`, requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            return result.isAllowed
        })
        .catch(error => console.log('error', error));
}

function getProfile() {
    let requestOptions = {
        method: 'GET',
        redirect: 'follow',
        credentials: 'include'
    };

    fetch(`${BASE_URL}/profile`, requestOptions)
        .then(response => response.json())
        .then(async result => {
            console.log(result);
            if (result.success) {
                if (window.location.href != 'http://localhost:8080/game.html')
                    window.location.replace('http://localhost:8080/game.html');
                document.getElementById('welcome').innerHTML = `Welcome ${result.name}`;
                document.getElementById('highscore').innerHTML = `High Score ${result.highScore}`;
                generateTable(result.gamesPlayed);
                let allowed = await isAllowed();
                if (!allowed) {
                    document.getElementById('game-starter').disabled = true;
                }
            }
            else if (window.location.href != 'http://localhost:8080/index.html')
                window.location.replace('http://localhost:8080/index.html')
        })
        .catch(error => console.log('error', error));
}

function logoutUser() {
    let requestOptions = {
        method: 'GET',
        redirect: 'follow',
        credentials: 'include'
    };

    fetch(`${BASE_URL}/logout`, requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // alert("You have logged out successfully!");
                if (window.location.href != 'http://localhost:8080/index.html')
                    window.location.replace('http://localhost:8080/index.html')
                return;
            }
            showError(result.message);
        })
        .catch(error => console.log('error', error));
}

function showError(errMessage) {
    alert(`ERROR: ${errMessage}`);
}