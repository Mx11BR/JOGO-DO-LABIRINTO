
// LABIRINTO COM BACKTRACKING

// --- Seleciona o canvas e contexto ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- Variáveis globais de configuração ---
let tamanhoCelula = 20;
const colunas = 25;
const linhas = 25;

// --- Variáveis de controle do jogo ---
let entradaX, entradaY, saidaX, saidaY;
let jogoPausado = false;
let jogoFinalizado = false;
let intervalo;
const botaoPausar = document.getElementById('pausar');

// --- Ajuste dinâmico do canvas ---
function ajustarCanvas() {
    const tamanho = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = Math.floor(tamanho / colunas) * colunas;
    canvas.height = Math.floor(tamanho / linhas) * linhas;
    tamanhoCelula = canvas.width / colunas;
}

// CLASSE E FUNÇÕES DO LABIRINTO

// --- Classe Celula ---
class Celula {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visitada = false;
        this.rastro = false;
        this.paredes = { cima: true, direita: true, baixo: true, esquerda: true };
    }
    // Método para desenhar a célula no canvas
    desenhar() {
        const x = this.x * tamanhoCelula;
        const y = this.y * tamanhoCelula;

        // Cor de fundo para entrada, saída e rastro
        if (this.x === entradaX && this.y === entradaY) {
            ctx.fillStyle = '#4CAF50'; // Entrada
        } else if (this.x === saidaX && this.y === saidaY) {
            ctx.fillStyle = '#F44336'; // Saída
        } else if (this.rastro) {
            ctx.fillStyle = '#FFEB3B'; // Rastro do jogador
        } else {
            ctx.fillStyle = '#FFFFFF'; // Normal
        }
        ctx.fillRect(x, y, tamanhoCelula, tamanhoCelula);

        // Desenho das paredes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.paredes.cima) ctx.moveTo(x, y), ctx.lineTo(x + tamanhoCelula, y);
        if (this.paredes.direita) ctx.moveTo(x + tamanhoCelula, y), ctx.lineTo(x + tamanhoCelula, y + tamanhoCelula);
        if (this.paredes.baixo) ctx.moveTo(x, y + tamanhoCelula), ctx.lineTo(x + tamanhoCelula, y + tamanhoCelula);
        if (this.paredes.esquerda) ctx.moveTo(x, y), ctx.lineTo(x, y + tamanhoCelula);
        ctx.stroke();
    }
}

//  Estrutura do labirinto 
const grade = [];
let atual;
const pilha = [];

// --- Utilitários do labirinto ---
function indice(x, y) {
    if (x < 0 || y < 0 || x >= colunas || y >= linhas) return -1;
    return x + y * colunas;
}

function removerParedes(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    if (dx === 1) { a.paredes.esquerda = false; b.paredes.direita = false; }
    else if (dx === -1) { a.paredes.direita = false; b.paredes.esquerda = false; }
    if (dy === 1) { a.paredes.cima = false; b.paredes.baixo = false; }
    else if (dy === -1) { a.paredes.baixo = false; b.paredes.cima = false; }
}

function obterVizinhos(x, y) {
    return {
        cima: grade[indice(x, y - 1)],
        direita: grade[indice(x + 1, y)],
        baixo: grade[indice(x, y + 1)],
        esquerda: grade[indice(x - 1, y)],
    };
}

// GERAÇÃO DO LABIRINTO

// Função para gerar o labirinto usando backtracking
function gerarLabirinto() {
    atual.visitada = true;
    const vizinhos = [];
    const { cima, direita, baixo, esquerda } = obterVizinhos(atual.x, atual.y);
    if (cima && !cima.visitada) vizinhos.push(cima);
    if (direita && !direita.visitada) vizinhos.push(direita);
    if (baixo && !baixo.visitada) vizinhos.push(baixo);
    if (esquerda && !esquerda.visitada) vizinhos.push(esquerda);

    if (vizinhos.length > 0) {
        const proximo = vizinhos[Math.floor(Math.random() * vizinhos.length)];
        pilha.push(atual);
        removerParedes(atual, proximo);
        atual = proximo;
    } else if (pilha.length > 0) {
        atual = pilha.pop();
    }
}

function gerarLabirintoCompleto() {
    while (pilha.length > 0) {
        gerarLabirinto();
    }
}

function resetarVisitadas() {
    grade.forEach(celula => celula.visitada = false);
}

// JOGADOR

const jogador = {
    x: 0,
    y: 0,
    desenhar: function () {
        const x = this.x * tamanhoCelula + tamanhoCelula / 2;
        const y = this.y * tamanhoCelula + tamanhoCelula / 2;
        const raio = tamanhoCelula / 3;
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, Math.PI * 2);
        ctx.fill();
    },
    mover: function (direcao) {
        const destino = {
            cima: { x: this.x, y: this.y - 1 },
            direita: { x: this.x + 1, y: this.y },
            baixo: { x: this.x, y: this.y + 1 },
            esquerda: { x: this.x - 1, y: this.y },
        }[direcao];

        if (destino) {
            const celulaAtual = grade[indice(this.x, this.y)];
            const celulaDestino = grade[indice(destino.x, destino.y)];
            if (celulaDestino) {
                if (
                    (direcao === 'cima' && !celulaAtual.paredes.cima) ||
                    (direcao === 'direita' && !celulaAtual.paredes.direita) ||
                    (direcao === 'baixo' && !celulaAtual.paredes.baixo) ||
                    (direcao === 'esquerda' && !celulaAtual.paredes.esquerda)
                ) {
                    celulaAtual.rastro = true;
                    this.x = destino.x;
                    this.y = destino.y;
                    celulaDestino.rastro = true;
                    desenhar();
                }
            }
        }
    }
};

// DESENHO E CONTROLE DE JOGO

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grade.forEach(celula => celula.desenhar());
    jogador.desenhar();
}

function reiniciarJogo() {
    clearTimeout(intervalo);
    jogoPausado = false;
    jogoFinalizado = false;
    botaoPausar.textContent = 'Pausar';
    botaoPausar.disabled = true;

    grade.forEach(celula => {
        celula.visitada = false;
        celula.rastro = false;
    });

    inicializarLabirinto();
    gerarLabirintoCompleto();
    resetarVisitadas();
    desenhar();

    document.getElementById('iniciar').disabled = false;
    document.getElementById('reiniciar').disabled = true;
}

// --- Movimento automático do jogador ---
function moverJogadorDinamico() {
    const caminho = [];
    function moverParaProximoPasso() {
        if (jogoPausado || jogoFinalizado) return;

        const celulaAtual = grade[indice(jogador.x, jogador.y)];
        celulaAtual.rastro = true;

        // Busca vizinhos válidos
        const vizinhos = [];
        const { cima, direita, baixo, esquerda } = obterVizinhos(jogador.x, jogador.y);
        if (cima && !cima.visitada && !celulaAtual.paredes.cima) vizinhos.push({ direcao: 'cima', celula: cima });
        if (direita && !direita.visitada && !celulaAtual.paredes.direita) vizinhos.push({ direcao: 'direita', celula: direita });
        if (baixo && !baixo.visitada && !celulaAtual.paredes.baixo) vizinhos.push({ direcao: 'baixo', celula: baixo });
        if (esquerda && !esquerda.visitada && !celulaAtual.paredes.esquerda) vizinhos.push({ direcao: 'esquerda', celula: esquerda });

        // Ordena vizinhos pela distância até a saída
        //Utiliza a distância Manhattan para ordenar os vizinhos 
        vizinhos.sort((a, b) => {
            const distanciaA = Math.abs(a.celula.x - saidaX) + Math.abs(a.celula.y - saidaY);
            const distanciaB = Math.abs(b.celula.x - saidaX) + Math.abs(b.celula.y - saidaY);
            return distanciaA - distanciaB;
        });

        if (vizinhos.length > 0) {
            const proximo = vizinhos[0];
            caminho.push({ x: jogador.x, y: jogador.y });
            jogador.mover(proximo.direcao);
            proximo.celula.visitada = true;
        } else if (caminho.length > 0) {
            const anterior = caminho.pop();
            jogador.x = anterior.x;
            jogador.y = anterior.y;
        }

        desenhar();

        // Verifica se chegou à saída
        if (jogador.x === saidaX && jogador.y === saidaY) {
            console.log('Jogador chegou ao final do labirinto!');
            exibirMensagem('Parabéns! Você chegou ao final do labirinto! Clique em "Reiniciar" para jogar novamente.');
            jogoFinalizado = true;
            botaoPausar.disabled = true;
            return;
        }

        intervalo = setTimeout(moverParaProximoPasso, 100);
    }
    moverParaProximoPasso();
}

// INTERFACE E CONTROLE DE BOTÕES

function exibirMensagem(texto) {
    const mensagemTexto = document.getElementById('mensagem-texto');
    const mensagem = document.getElementById('mensagem');
    mensagemTexto.textContent = texto;
    mensagem.style.display = 'block';
}

function pausarContinuarJogo() {
    if (jogoFinalizado) return;
    jogoPausado = !jogoPausado;
    if (jogoPausado) {
        clearTimeout(intervalo);
        botaoPausar.textContent = 'Continuar';
        console.log('Jogo pausado.');
    } else {
        botaoPausar.textContent = 'Pausar';
        moverJogadorDinamico();
        console.log('Jogo continuado.');
    }
}

// INICIALIZAÇÃO DO LABIRINTO

function inicializarLabirinto() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grade.length = 0;
    pilha.length = 0;

    // Sorteia entrada e saída em lados opostos
    const ladoEntrada = Math.floor(Math.random() * 4); // 0: cima, 1: direita, 2: baixo, 3: esquerda
    const ladoSaida = (ladoEntrada + 2) % 4;

    const obterCoordenadasNoLado = (lado) => {
        switch(lado) {
            case 0: return [Math.floor(Math.random() * colunas), 0];
            case 1: return [colunas - 1, Math.floor(Math.random() * linhas)];
            case 2: return [Math.floor(Math.random() * colunas), linhas - 1];
            case 3: return [0, Math.floor(Math.random() * linhas)];
        }
    };

    [entradaX, entradaY] = obterCoordenadasNoLado(ladoEntrada);
    [saidaX, saidaY] = obterCoordenadasNoLado(ladoSaida);

    // Inicializa células
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            grade.push(new Celula(x, y));
        }
    }

    // Define célula inicial
    atual = grade[indice(entradaX, entradaY)];
    if (atual) atual.visitada = true;
    pilha.push(atual);

    // Posiciona o jogador na entrada
    jogador.x = entradaX;
    jogador.y = entradaY;
}

// FUNÇÃO PRINCIPAL DE INÍCIO

function iniciarJogo() {
    jogoFinalizado = false;
    resetarVisitadas();
    desenhar();
    moverJogadorDinamico();

    document.getElementById('iniciar').disabled = true;
    botaoPausar.disabled = false;
    document.getElementById('reiniciar').disabled = false;

    console.log('Jogo iniciado.');
}

// EVENTOS DE INTERFACE

document.getElementById('iniciar').addEventListener('click', iniciarJogo);
document.getElementById('reiniciar').addEventListener('click', reiniciarJogo);
botaoPausar.addEventListener('click', pausarContinuarJogo);
document.getElementById('fechar-mensagem').addEventListener('click', () => {
    document.getElementById('mensagem').style.display = 'none';
});

// INICIALIZAÇÃO AUTOMÁTICA

window.onload = () => {
    ajustarCanvas();
    inicializarLabirinto();
    gerarLabirintoCompleto();
    desenhar();
};

window.addEventListener('resize', () => {
    ajustarCanvas();
    desenhar();
});

