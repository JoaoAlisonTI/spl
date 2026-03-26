const form = document.querySelector("form");

const nome = document.getElementById("input-nome");
const cpf = document.getElementById("input-cpf");
const telefone = document.getElementById("input-telefone");
const email = document.getElementById("input-email");
const senha = document.getElementById("input-password");
const confirmarSenha = document.getElementById("input-confirmar-password");

function showError(input, message) {
    let error = input.nextElementSibling;

    if (!error || error.tagName !== "SMALL") {
        error = document.createElement("small");
        input.parentNode.appendChild(error);
    }

    error.textContent = message;
    error.style.color = "red";
    input.style.border = "1px solid red";
}

function clearError(input) {
    let error = input.nextElementSibling;
    if (error && error.tagName === "SMALL") {
        error.remove();
    }
    input.style.border = "";
}

function validarCPF(cpf) {
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
}

function validarTelefone(tel) {
    return /^\(\d{2}\)\s\d{5}-\d{4}$/.test(tel);
}

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let valido = true;

    [nome, cpf, telefone, email, senha, confirmarSenha].forEach(clearError);

    if (!validarCPF(cpf.value)) {
        showError(cpf, "CPF inválido");
        valido = false;
    }

    if (!validarTelefone(telefone.value)) {
        showError(telefone, "Telefone inválido");
        valido = false;
    }

    if (!email.value.includes("@")) {
        showError(email, "E-mail inválido");
        valido = false;
    }

    if (senha.value.length < 8) {
        showError(senha, "Senha deve ter no mínimo 8 caracteres");
        valido = false;
    }

    if (senha.value !== confirmarSenha.value) {
        showError(confirmarSenha, "As senhas não coincidem");
        valido = false;
    }

    if (valido) {
        alert("Página de triagem está em construção!");
        const user = {
            nome: nome.value,
            cpf: cpf.value,
            telefone: telefone.value,
            email: email.value
        };
        console.log("Usuário criado:", user);
    }
});