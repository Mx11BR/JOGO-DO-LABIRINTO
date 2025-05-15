// Geração de labirinto usando Backtracking em JavaScript

// Seleção do canvas
const canvas = document.getElementById('canvas'); // Seleciona o canvas pelo ID
const ctx = canvas.getContext('2d'); // Obtém o contexto 2D

// Adicione estas variáveis no início do arquivo
let entradaX, entradaY, saidaX, saidaY;
let tamanhoCelula = 20; // Alterado de const para let
const colunas = 25;
const linhas = 25;

// Configuração do tamanho do canvas
canvas.width = colunas * tamanhoCelula;
canvas.height = linhas * tamanhoCelula;

function ajustarCanvas() {
    const tamanho = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    // Mantém a proporção do labirinto
    canvas.width = Math.floor(tamanho / colunas) * colunas;
    canvas.height = Math.floor(tamanho / linhas) * linhas;
    tamanhoCelula = canvas.width / colunas; // Atualiza o tamanho da célula
}

// Adicione estas variáveis no início do arquivo
let jogoPausado = false;
let intervalo;
let jogoFinalizado = false;
const botaoPausar = document.getElementById('pausar');

// Classe para representar uma célula do labirinto
class Celula {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visitada = false;
        this.rastro = false;
        this.paredes = { cima: true, direita: true, baixo: true, esquerda: true };
    }

    desenhar() {
        const x = this.x * tamanhoCelula;
        const y = this.y * tamanhoCelula;

        // Cor de fundo para entrada, saída e rastro
        if (this.x === entradaX && this.y === entradaY) {
            ctx.fillStyle = '#4CAF50'; // Verde para entrada
        } else if (this.x === saidaX && this.y === saidaY) {
            ctx.fillStyle = '#F44336'; // Vermelho para saída
        } else if (this.rastro) {
            ctx.fillStyle = '#FFEB3B'; // Amarelo para o rastro do jogador
        } else {
            ctx.fillStyle = '#FFFFFF'; // Branco para células normais
        }
        ctx.fillRect(x, y, tamanhoCelula, tamanhoCelula);

        // Desenho das paredes
        ctx.strokeStyle = '#000000'; // Preto para as paredes
        ctx.lineWidth = 2;

        ctx.beginPath();
        if (this.paredes.cima) { ctx.moveTo(x, y); ctx.lineTo(x + tamanhoCelula, y); }
        if (this.paredes.direita) { ctx.moveTo(x + tamanhoCelula, y); ctx.lineTo(x + tamanhoCelula, y + tamanhoCelula); }
        if (this.paredes.baixo) { ctx.moveTo(x, y + tamanhoCelula); ctx.lineTo(x + tamanhoCelula, y + tamanhoCelula); }
        if (this.paredes.esquerda) { ctx.moveTo(x, y); ctx.lineTo(x, y + tamanhoCelula); }
        ctx.stroke();
    }
}

// Inicialização do labirinto
const grade = [];

// Função para calcular o índice de uma célula
function indice(x, y) {
    if (x < 0 || y < 0 || x >= colunas || y >= linhas) return -1;
    return x + y * colunas;
}

// Função para remover paredes entre duas células
function removerParedes(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (dx === 1) { a.paredes.esquerda = false; b.paredes.direita = false; }
    else if (dx === -1) { a.paredes.direita = false; b.paredes.esquerda = false; }

    if (dy === 1) { a.paredes.cima = false; b.paredes.baixo = false; }
    else if (dy === -1) { a.paredes.baixo = false; b.paredes.cima = false; }
}

// Função para obter os vizinhos de uma célula
function obterVizinhos(x, y) {
    return {
        cima: grade[indice(x, y - 1)],
        direita: grade[indice(x + 1, y)],
        baixo: grade[indice(x, y + 1)],
        esquerda: grade[indice(x - 1, y)],
    };
}

// Algoritmo de geração do labirinto (Backtracking)
let atual;
const pilha = [];

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

// Algoritmo de geração do labirinto completo
function gerarLabirintoCompleto() {
    while (pilha.length > 0) {
        gerarLabirinto();
    }
}

// Função para resetar o estado de visitadas
function resetarVisitadas() {
    grade.forEach(celula => celula.visitada = false);
}

// Objeto do jogador virtual
const jogador = {
    x: 0,
    y: 0,
    desenhar: function () {
        const x = this.x * tamanhoCelula + tamanhoCelula / 2;
        const y = this.y * tamanhoCelula + tamanhoCelula / 2;
        const raio = tamanhoCelula / 3;

        ctx.fillStyle = '#2196F3'; // Azul vibrante para o jogador
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, Math.PI * 2); // Desenha o jogador como um círculo
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

            // Verifica se a célula de destino existe e se não há parede na direção
            if (celulaDestino) {
                if (
                    (direcao === 'cima' && !celulaAtual.paredes.cima) ||
                    (direcao === 'direita' && !celulaAtual.paredes.direita) ||
                    (direcao === 'baixo' && !celulaAtual.paredes.baixo) ||
                    (direcao === 'esquerda' && !celulaAtual.paredes.esquerda)
                ) {
                    celulaAtual.rastro = true; // Marca a célula atual como parte do rastro
                    this.x = destino.x;
                    this.y = destino.y;
                    celulaDestino.rastro = true; // Marca a célula de destino como parte do rastro
                    desenhar(); // Redesenha o labirinto e o jogador
                }
            }
        }
    }
};

// Função para desenhar o labirinto e o jogador
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

    // Desenha cada célula do labirinto
    grade.forEach(celula => celula.desenhar());

    // Desenha o jogador
    jogador.desenhar();
}

function reiniciarJogo() {
    clearTimeout(intervalo);
    jogoPausado = false;
    jogoFinalizado = false; // Reseta o estado de finalizado
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

// Movimento dinâmico do jogador
function moverJogadorDinamico() {
    const caminho = []; // Pilha para armazenar o caminho percorrido

    function moverParaProximoPasso() {
        if (jogoPausado || jogoFinalizado) return; // Interrompe se pausado ou finalizado

        const celulaAtual = grade[indice(jogador.x, jogador.y)];
        celulaAtual.rastro = true; // Marca a célula atual como parte do rastro

        // Verifique os vizinhos válidos
        const vizinhos = [];
        const { cima, direita, baixo, esquerda } = obterVizinhos(jogador.x, jogador.y);

        if (cima && !cima.visitada && !celulaAtual.paredes.cima) vizinhos.push({ direcao: 'cima', celula: cima });
        if (direita && !direita.visitada && !celulaAtual.paredes.direita) vizinhos.push({ direcao: 'direita', celula: direita });
        if (baixo && !baixo.visitada && !celulaAtual.paredes.baixo) vizinhos.push({ direcao: 'baixo', celula: baixo });
        if (esquerda && !esquerda.visitada && !celulaAtual.paredes.esquerda) vizinhos.push({ direcao: 'esquerda', celula: esquerda });

        // Ordena os vizinhos pela distância de Manhattan até a saída
        vizinhos.sort((a, b) => {
            const distanciaA = Math.abs(a.celula.x - saidaX) + Math.abs(a.celula.y - saidaY);
            const distanciaB = Math.abs(b.celula.x - saidaX) + Math.abs(b.celula.y - saidaY);
            return distanciaA - distanciaB;
        });

        if (vizinhos.length > 0) {
            const proximo = vizinhos[0]; // Escolhe o vizinho mais próximo da saída
            caminho.push({ x: jogador.x, y: jogador.y });
            jogador.mover(proximo.direcao);
            proximo.celula.visitada = true;
        } else if (caminho.length > 0) {
            const anterior = caminho.pop();
            jogador.x = anterior.x;
            jogador.y = anterior.y;
        }

        desenhar();

        // Verifica se o jogador chegou à saída
        if (jogador.x === saidaX && jogador.y === saidaY) {
            console.log('Jogador chegou ao final do labirinto!');
            exibirMensagem('Parabéns! Você chegou ao final do labirinto! Clique em "Reiniciar" para jogar novamente.');
            jogoFinalizado = true;
            botaoPausar.disabled = true; // Desabilita o botão de pausar
            return;
        }

        intervalo = setTimeout(moverParaProximoPasso, 100);
    }

    moverParaProximoPasso();
}

// Função para exibir mensagens
function exibirMensagem(texto) {
    const mensagemTexto = document.getElementById('mensagem-texto');
    const mensagem = document.getElementById('mensagem');
    mensagemTexto.textContent = texto;
    mensagem.style.display = 'block';
}

// Função para pausar/continuar o jogo
function pausarContinuarJogo() {
    if (jogoFinalizado) return; // Não faz nada se o jogo foi finalizado
    
    jogoPausado = !jogoPausado;

    if (jogoPausado) {
        clearTimeout(intervalo);
        botaoPausar.textContent = 'Continuar';
        console.log('Jogo pausado.');
    } else {
        botaoPausar.textContent = 'Pausar';
        moverJogadorDinamico(); // Continua o movimento
        console.log('Jogo continuado.');
    }
}

// Inicialização do labirinto
function inicializarLabirinto() {
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Limpa a grade e a pilha
    grade.length = 0;
    pilha.length = 0;

    // Recria as células do labirinto
    for (let y = 0; y < linhas; y++) {
        for (let x = 0; x < colunas; x++) {
            grade.push(new Celula(x, y));
        }
    }

    // Define posições aleatórias para entrada e saída (em paredes opostas)
    const ladoEntrada = Math.floor(Math.random() * 4); // 0: cima, 1: direita, 2: baixo, 3: esquerda
    const ladoSaida = (ladoEntrada + 2) % 4; // Lado oposto

    // Função auxiliar para obter coordenadas em um lado específico
    const obterCoordenadasNoLado = (lado) => {
        switch(lado) {
            case 0: // Cima
                return [Math.floor(Math.random() * colunas), 0];
            case 1: // Direita
                return [colunas - 1, Math.floor(Math.random() * linhas)];
            case 2: // Baixo
                return [Math.floor(Math.random() * colunas), linhas - 1];
            case 3: // Esquerda
                return [0, Math.floor(Math.random() * linhas)];
        }
    };

    [entradaX, entradaY] = obterCoordenadasNoLado(ladoEntrada);
    [saidaX, saidaY] = obterCoordenadasNoLado(ladoSaida);

    // Define a célula inicial (entrada)
    atual = grade[indice(entradaX, entradaY)];
    if (atual) {
        atual.visitada = true;
    }
    pilha.push(atual);

    // Posiciona o jogador na entrada
    jogador.x = entradaX;
    jogador.y = entradaY;
}

// Função principal para inicializar e executar o jogo
function iniciarJogo() {
    jogoFinalizado = false; // Garante que o estado seja resetado
    resetarVisitadas();
    desenhar();
    moverJogadorDinamico();

    document.getElementById('iniciar').disabled = true;
    botaoPausar.disabled = false;
    document.getElementById('reiniciar').disabled = false;

    console.log('Jogo iniciado.');
}

// Adicione os eventos para os botões
document.getElementById('iniciar').addEventListener('click', iniciarJogo);
document.getElementById('reiniciar').addEventListener('click', reiniciarJogo);
botaoPausar.addEventListener('click', pausarContinuarJogo);
document.getElementById('fechar-mensagem').addEventListener('click', () => {
    document.getElementById('mensagem').style.display = 'none';
});

// Gera e desenha o labirinto ao carregar a página
window.onload = () => {
    ajustarCanvas();
    inicializarLabirinto();
    gerarLabirintoCompleto();
    desenhar();
};

// Adicionar listener para redimensionamento
window.addEventListener('resize', () => {
    ajustarCanvas();
    desenhar();
});

