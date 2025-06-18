

const ID_RESTAURANTE = 1;

let dadosDoRestaurante = {};

const URL_JSON_SERVER = `http://localhost:3000/restaurantes/${ID_RESTAURANTE}`;

async function buscarDadosDoRestaurante() {
    try {
        const resposta = await fetch(URL_JSON_SERVER);
        if (!resposta.ok) {
            throw new Error(`Erro ao carregar dados do JSON Server: ${resposta.statusText}`);
        }
        const restaurante = await resposta.json();

        if (!restaurante) {
            throw new Error(`Restaurante com ID ${ID_RESTAURANTE} não encontrado.`);
        }

        dadosDoRestaurante = { ...restaurante };
        preencherCamposDoFormulario();
        document.getElementById('restaurantName').textContent = restaurante.nome;
        document.getElementById('restaurantId').textContent = ID_RESTAURANTE;

        console.log(`Dados carregados para o restaurante: ${restaurante.nome} (ID: ${ID_RESTAURANTE})`);

    } catch (erro) {
        console.error('Erro ao carregar dados do restaurante do JSON Server:', erro);
        alert('Erro ao carregar dados do restaurante: ' + erro.message);
    }
}

function preencherCamposDoFormulario() {
    document.getElementById('nome').value = dadosDoRestaurante.nome || '';
    document.getElementById('email').value = dadosDoRestaurante.email || '';
    document.getElementById('categoria').value = dadosDoRestaurante.categoria || '';
    document.getElementById('capacidade').value = dadosDoRestaurante.capacidade || '';
    document.getElementById('telefone').value = dadosDoRestaurante.telefone || '';
    document.getElementById('endereco').value = dadosDoRestaurante.endereco || '';
    
    const urlDaImagem = dadosDoRestaurante.fotoPerfil || dadosDoRestaurante.imageUrl || 'https://via.placeholder.com/120/8B0000/ffffff?text=LOGO';
    document.getElementById('profileImage').src = urlDaImagem;
}

function preVisualizarImagem(entrada) {
    if (entrada.files && entrada.files[0]) {
        const leitor = new FileReader();
        leitor.onload = function(evento) {
            document.getElementById('profileImage').src = evento.target.result;
        }
        leitor.readAsDataURL(entrada.files[0]);
    }
}

function alternarVisibilidadeSenha(idDoCampo) {
    const campo = document.getElementById(idDoCampo);
    const alternador = document.getElementById('toggle' + idDoCampo.charAt(0).toUpperCase() + idDoCampo.slice(1));
    
    if (campo.type === 'password') {
        campo.type = 'text';
        alternador.classList.remove('fa-eye');
        alternador.classList.add('fa-eye-slash');
    } else {
        campo.type = 'password';
        alternador.classList.remove('fa-eye-slash');
        alternador.classList.add('fa-eye');
    }
}

document.getElementById('restaurantForm').addEventListener('submit', async function(evento) {
    evento.preventDefault();
    
    const dadosDoFormulario = {
        id: ID_RESTAURANTE,
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        categoria: document.getElementById('categoria').value,
        capacidade: parseInt(document.getElementById('capacidade').value),
        telefone: document.getElementById('telefone').value,
        endereco: document.getElementById('endereco').value,
        fotoPerfil: document.getElementById('profileImage').src
    };
    
    const novaSenha = document.getElementById('senha').value;
    if (novaSenha.trim() !== '') {
        dadosDoFormulario.senha = novaSenha;
    } else {
        dadosDoFormulario.senha = dadosDoRestaurante.senha; 
    }
    
    try {
        const resposta = await fetch(URL_JSON_SERVER, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosDoFormulario)
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao salvar dados no JSON Server: ${resposta.statusText}`);
        }

        const restauranteAtualizado = await resposta.json();
        console.log('Dados salvos com sucesso no JSON Server:', restauranteAtualizado);
        
        Object.assign(dadosDoRestaurante, restauranteAtualizado);
        document.getElementById('restaurantName').textContent = dadosDoRestaurante.nome;
        mostrarMensagemDeSucesso('Informações salvas com sucesso!');
        document.getElementById('senha').value = '';
        
    } catch (erro) {
        console.error('Erro ao salvar dados:', erro);
        mostrarMensagemDeErro('Erro ao salvar informações. Tente novamente.');
    }
});

function cancelarEdicao() {
    if (confirm('Deseja cancelar as alterações?')) {
        preencherCamposDoFormulario();
        document.getElementById('senha').value = '';
        mostrarMensagemDeInformacao('Alterações canceladas.');
    }
}

function mostrarMensagemDeSucesso(mensagem) {
    mostrarToast(mensagem, 'success');
}

function mostrarMensagemDeErro(mensagem) {
    mostrarToast(mensagem, 'danger');
}

function mostrarMensagemDeInformacao(mensagem) {
    mostrarToast(mensagem, 'info');
}

function mostrarToast(mensagem, tipo) {
    const recipienteToast = document.createElement('div');
    recipienteToast.style.position = 'fixed';
    recipienteToast.style.top = '20px';
    recipienteToast.style.right = '20px';
    recipienteToast.style.zIndex = '9999';
    
    recipienteToast.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(recipienteToast);
    
    setTimeout(() => {
        if (recipienteToast.parentNode) {
            recipienteToast.parentNode.removeChild(recipienteToast);
        }
    }, 5000);
}

function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        mostrarMensagemDeInformacao('Logout realizado com sucesso!');
    }
}

document.addEventListener('keydown', function(evento) {
    if (evento.key === 'Escape') {
        cancelarEdicao();
    }
});

document.getElementById('telefone').addEventListener('input', function(evento) {
    let valor = evento.target.value.replace(/\D/g, '');
    if (valor.length <= 11) {
        valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        if (valor.length < 14) {
            valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
    }
    evento.target.value = valor;
});

document.addEventListener('DOMContentLoaded', function() {
    buscarDadosDoRestaurante();

    setTimeout(() => {
        if (dadosDoRestaurante.nome) { 
            mostrarMensagemDeInformacao(`Bem-vindo ao painel do ${dadosDoRestaurante.nome}!`);
        } else {
            mostrarMensagemDeInformacao('Bem-vindo ao painel!');
        }
    }, 1500);
});