// --- Configurações e Dados ---
let currentScreen = 'login';
let selectedBookIndex = 0; // Livro padrão é o primeiro

// Credenciais de login atualizadas
const validMatricula = 'unifor'; 
const validSenha = '2025';

// Elementos DOM
const appContainer = document.getElementById('app-container');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');

const mapData = {
    // 9 Ruas e 9 Avenidas para separar as 8x8 estantes (Grid 17x17)
    ruas: [
        'Rua Lima Barreto', 'Rua Machado de Assis', 'Rua Clarice Lispector', 
        'Rua Eça de Queiroz', 'Rua Jorge Amado', 'Rua José Saramago', 
        'Rua Fernando Pessoa', 'Rua Cora Coralina', 'Rua Guimarães Rosa'
    ],
    avenidas: [
        'Av. Lygia F. Telles', 'Av. Luís Vaz de Camões', 'Av. Cecília Meireles', 
        'Av. Graciliano Ramos', 'Av. Ariano Suassuna', 'Av. Vinicius de Moraes', 
        'Av. Manuel Bandeira', 'Av. Rachel de Queiroz', 'Av. Mia Couto'
    ],
    shelfRowCount: 8, // 8 linhas de estantes
    shelfColCount: 8, // 8 colunas de estantes
};

// Livros cadastrados com localizações específicas e status de cópias
const mockBooks = [
    {
        id: 0,
        title: "Engenharia de Software",
        author: "Ian Sommerville",
        edition: "10ª Edição",
        // Estante 39: 5ª linha (R4), 7ª coluna (C6) na matriz 8x8
        shelfNumber: 39, 
        shelfSide: "A",
        prateleira: "P3",
        roadIndex: 4, 
        address: "Estante 39, Lado A, Prateleira P3, na Rua Jorge Amado.",
        copies: { disponivel: 2, emprestado: 5, reservado: 1 }
    },
    {
        id: 1,
        title: "Cem Anos de Solidão",
        author: "Gabriel García Márquez",
        edition: "Edição Especial",
        // Estante 01: 1ª linha (R0), 1ª coluna (C0) na matriz 8x8
        shelfNumber: 1, 
        shelfSide: "B",
        prateleira: "P1",
        roadIndex: 0, 
        address: "Estante 01, Lado B, Prateleira P1, na Rua Lima Barreto.",
        copies: { disponivel: 1, emprestado: 0, reservado: 0 }
    },
    {
        id: 2,
        title: "A Metamorfose",
        author: "Franz Kafka",
        edition: "Clássico",
        // Estante 64: 8ª linha (R7), 8ª coluna (C7) na matriz 8x8
        shelfNumber: 64, 
        shelfSide: "A",
        prateleira: "P5",
        roadIndex: 8, 
        address: "Estante 64, Lado A, Prateleira P5, na Rua Guimarães Rosa.",
        copies: { disponivel: 0, emprestado: 1, reservado: 3 }
    }
];

// --- Funções de Renderização de Telas ---

function renderLoginScreen() {
    appContainer.innerHTML = `
        <div id="login-screen" class="space-y-6">
            <h2 class="text-3xl font-bold text-gray-800 text-center mb-6">Localizador de Livros - Acesso</h2>
            <p class="text-sm text-center text-gray-500">Credenciais de teste: Matrícula unifor | Senha 2025</p>

            <div class="space-y-4">
                <label class="block text-gray-700 font-semibold" for="matricula">Matrícula</label>
                <input id="matricula" type="text" placeholder="Sua Matrícula (Ex: unifor)"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-150">
            </div>

            <div class="space-y-4">
                <label class="block text-gray-700 font-semibold" for="senha">Senha</label>
                <input id="senha" type="password" placeholder="Sua Senha (Ex: 2025)"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-150">
            </div>

            <div id="login-error" class="text-red-500 text-center font-medium hidden"></div>

            <button id="login-button"
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-[1.01]">
                Acessar
            </button>
        </div>
    `;
    document.getElementById('login-button').addEventListener('click', handleLogin);
}

function renderSearchScreen() {
    // Encontra o livro atualmente selecionado para pré-preencher
    const currentBook = mockBooks[selectedBookIndex];

    appContainer.innerHTML = `
        <div id="search-screen" class="space-y-8">
            <h2 class="text-3xl font-bold text-gray-800 text-center">Localizador de Livros - Pesquisa</h2>

            <div class="space-y-4">
                <label class="block text-gray-700 font-semibold" for="book-select">Livro e Autor</label>
                <select id="book-select" 
                    class="w-full p-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition duration-150">
                    ${mockBooks.map((book, index) => `
                        <option value="${index}" ${selectedBookIndex === index ? 'selected' : ''}>
                            ${book.title}, ${book.author}
                        </option>
                    `).join('')}
                </select>
                <p class="text-xs text-gray-500 mt-1">Selecione o livro para simular a busca.</p>
            </div>
            
            <div id="selected-book-info" class="p-4 bg-gray-50 rounded-lg border">
                <p class="text-sm font-semibold text-gray-700">Livro Selecionado:</p>
                <p class="text-lg font-bold text-indigo-600">${currentBook.title}</p>
                <p class="text-sm text-gray-500">Autor: ${currentBook.author}</p>
            </div>

            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button id="search-book-button"
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-[1.01]">
                    Ver Endereço e Status do Livro
                </button>
                <button id="generate-route-button"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-[1.01]">
                    Gerar Trajeto
                </button>
            </div>
        </div>
    `;
    // Listener para atualizar o livro selecionado
    document.getElementById('book-select').addEventListener('change', (e) => {
        selectedBookIndex = parseInt(e.target.value);
        const bookInfoDiv = document.getElementById('selected-book-info');
        const book = mockBooks[selectedBookIndex];
        bookInfoDiv.innerHTML = `
            <p class="text-sm font-semibold text-gray-700">Livro Selecionado:</p>
            <p class="text-lg font-bold text-indigo-600">${book.title}</p>
            <p class="text-sm text-gray-500">Autor: ${book.author}</p>
        `;
    });

    document.getElementById('search-book-button').addEventListener('click', showBookDetails);
    document.getElementById('generate-route-button').addEventListener('click', () => {
        currentScreen = 'route';
        renderApp();
    });
}

function renderRouteScreen() {
    const currentBook = mockBooks[selectedBookIndex];

    appContainer.innerHTML = `
        <div id="route-screen" class="space-y-6">
            <h2 class="text-3xl font-bold text-gray-800 text-center">Trajeto até o Livro</h2>
            <p class="text-center text-gray-600">
                O mapa abaixo exibe o trajeto do Ponto A (Início) até o Ponto B (Estante) do livro.
            </p>
            <div id="map-container" class="shadow-xl rounded-lg overflow-hidden">
                <!-- O mapa da biblioteca será renderizado aqui -->
            </div>
            <div class="text-center text-sm font-medium text-gray-700">
                 Livro: <span class="text-indigo-600 font-bold">${currentBook.title}</span><br>
                 Localização: <span class="text-red-500 font-bold">${currentBook.address}</span>
            </div>

            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                <!-- NOVO BOTÃO CONCLUIR PESQUISA -->
                <button id="concluir-pesquisa-button"
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-[1.01]">
                    Concluir Pesquisa (Livro Encontrado)
                </button>
                <button id="back-to-search-button"
                    class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-[1.01]">
                    Voltar à Pesquisa
                </button>
            </div>
        </div>
    `;
    drawLibraryMap(currentBook);
    
    // Listener para o novo botão "Concluir Pesquisa"
    document.getElementById('concluir-pesquisa-button').addEventListener('click', showFinalPopup); 
    document.getElementById('back-to-search-button').addEventListener('click', () => {
        currentScreen = 'search';
        renderApp();
    });
}

// --- Funções de Lógica ---

function handleLogin() {
    const matricula = document.getElementById('matricula').value;
    const senha = document.getElementById('senha').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.classList.add('hidden');

    if (matricula === validMatricula && senha === validSenha) {
        currentScreen = 'search';
        renderApp();
    } else {
        errorDiv.textContent = 'Matrícula ou senha inválida. Tente novamente.';
        errorDiv.classList.remove('hidden');
    }
}

function showBookDetails() {
    const currentBook = mockBooks[selectedBookIndex];
    const copies = currentBook.copies;

    modalContent.innerHTML = `
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Detalhes e Status do Livro</h3>
        <div class="space-y-3 text-gray-700">
            <p><strong>Título:</strong> ${currentBook.title}</p>
            <p><strong>Autor:</strong> ${currentBook.author}</p>
            <p><strong>Edição:</strong> ${currentBook.edition}</p>

            <div class="border-t pt-3 mt-3">
                <p class="font-semibold text-gray-800 mb-2">Status de Cópias:</p>
                <ul class="space-y-1 text-sm">
                    <li class="flex justify-between">
                        <span class="text-green-600 font-medium">Disponível:</span> 
                        <span class="font-bold">${copies.disponivel}</span>
                    </li>
                    <li class="flex justify-between">
                        <span class="text-red-600 font-medium">Emprestado:</span> 
                        <span class="font-bold">${copies.emprestado}</span>
                    </li>
                    <li class="flex justify-between">
                        <span class="text-yellow-600 font-medium">Reservado:</span> 
                        <span class="font-bold">${copies.reservado}</span>
                    </li>
                </ul>
            </div>

            <p class="text-lg font-semibold text-red-600 border-t pt-3 mt-3">
                Endereço na Biblioteca: <br>
                ${currentBook.address}
            </p>
        </div>
        <button id="close-modal"
            class="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition duration-150">
            Fechar
        </button>
    `;
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    document.getElementById('close-modal').addEventListener('click', closeModal);
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
}

function showFinalPopup() {
    modalContent.innerHTML = `
        <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Fim do Trajeto!</h3>
        <p class="text-center text-gray-700 mb-6">
            Você chegou ao endereço do livro. Deseja pesquisar outro livro ou sair do programa?
        </p>
        <div class="flex space-x-4">
            <button id="search-again-button"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition duration-150">
                Pesquisar Outro
            </button>
            <button id="exit-program-button"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition duration-150">
                Sair
            </button>
        </div>
    `;
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    document.getElementById('search-again-button').addEventListener('click', () => {
        closeModal();
        currentScreen = 'search';
        renderApp();
    });
    document.getElementById('exit-program-button').addEventListener('click', () => {
        closeModal();
        // Simular saída, voltando para a tela de login
        currentScreen = 'login';
        renderApp();
    });
}

/**
 * Desenha o mapa da biblioteca 17x17 e o trajeto do Ponto A (Início) ao Ponto B (Livro).
 * @param {object} currentBook - O objeto do livro atualmente selecionado.
 */
function drawLibraryMap(currentBook) {
    const mapDiv = document.getElementById('map-container');
    if (!mapDiv) return;

    mapDiv.innerHTML = '';
    
    // Ponto A: Entrada [0, 0] (Canto superior esquerdo - Ponto de Início)
    const startPoint = { row: 0, col: 0 }; 

    // Cálculo das coordenadas do Ponto B no grid 17x17
    const shelfRowIndex = Math.floor((currentBook.shelfNumber - 1) / mapData.shelfColCount); // 0-7 (Linha da estante 8x8)
    const shelfColIndex = (currentBook.shelfNumber - 1) % mapData.shelfColCount;             // 0-7 (Coluna da estante 8x8)
    
    // Coordenadas do centro da Estante no Grid 17x17 (posições ímpares 1, 3, 5, ..., 15)
    const shelfGridRow = (shelfRowIndex * 2) + 1; 
    const shelfGridCol = (shelfColIndex * 2) + 1; 
    const endPoint = { row: shelfGridRow, col: shelfGridCol };

    // --- Lógica de Geração do Trajeto (Caminho Reto L) ---
    const pathCells = [];
    
    // 1. Deslocamento horizontal: Da coluna 0 até a coluna do livro (na primeira rua, linha 0)
    for (let c = startPoint.col; c <= endPoint.col; c++) {
        pathCells.push(`${startPoint.row}-${c}`);
    }
    
    // 2. Deslocamento vertical: Da linha 1 até a linha do livro (na avenida do livro)
    for (let r = startPoint.row + 1; r <= endPoint.row; r++) {
        pathCells.push(`${r}-${endPoint.col}`);
    }

    // --- Construção do Grid 17x17 ---
    let shelfCounter = 1;
    const gridSize = 17;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.createElement('div');
            cell.classList.add('w-full', 'h-full', 'grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.id = `cell-${r}-${c}`;

            // É uma Estante (posições ímpares: 1, 3, 5, ...)
            if (r % 2 !== 0 && c % 2 !== 0) {
                cell.classList.add('shelf-block');
                cell.textContent = `E${shelfCounter}`;
                cell.title = `Estante ${shelfCounter}`;

                // Marcar o Ponto B (Livro)
                if (r === endPoint.row && c === endPoint.col) {
                    cell.classList.add('end-point');
                    cell.textContent = 'Ponto B (Livro)';
                }
                shelfCounter++;

            // É uma Rua (Horizontal)
            } else if (r % 2 === 0 && c % 2 !== 0) {
                cell.classList.add('road', 'row-separator');
                cell.textContent = mapData.ruas[r / 2];
                cell.title = mapData.ruas[r / 2];

            // É uma Avenida (Vertical)
            } else if (r % 2 !== 0 && c % 2 === 0) {
                cell.classList.add('avenue', 'avenue-label');
                cell.textContent = mapData.avenidas[c / 2];
                cell.title = mapData.avenidas[c / 2];

            // É um Cruzamento (Rua/Avenida)
            } else if (r % 2 === 0 && c % 2 === 0) {
                cell.classList.add('road', 'avenue', 'bg-red-200');
                cell.textContent = 'X';
                cell.title = `Cruzamento ${mapData.ruas[r / 2]} / ${mapData.avenidas[c / 2]}`;
            }

            // --- Aplicação do Trajeto ---
            const cellId = `${r}-${c}`;
            const isStartOrEnd = (r === endPoint.row && c === endPoint.col) || (r === startPoint.row && c === startPoint.col);
            
            if (pathCells.includes(cellId) && !isStartOrEnd) {
                cell.classList.add('path');
                // Se for estrada, só pinta. Se for cruzamento (X), mantém o X.
                if (cell.textContent !== 'X') { 
                    cell.textContent = ''; 
                }
            }

            // Marcar o Ponto A (Início)
            if (r === startPoint.row && c === startPoint.col) {
                cell.classList.remove('path');
                cell.classList.add('start-point', 'bg-green-600');
                cell.textContent = 'Ponto A (Início)';
            }
            
            mapDiv.appendChild(cell);
        }
    }
}

// --- Função de Início da Aplicação ---
function renderApp() {
    // Removendo classes para garantir que o contêiner se ajuste
    appContainer.classList.remove('max-w-4xl', 'max-w-md', 'max-w-xl');

    if (currentScreen === 'login') {
        appContainer.classList.add('max-w-md');
        renderLoginScreen();
    } else if (currentScreen === 'search') {
        appContainer.classList.add('max-w-xl');
        renderSearchScreen();
    } else if (currentScreen === 'route') {
        appContainer.classList.add('max-w-4xl');
        renderRouteScreen();
    }
}

// Inicia a aplicação na tela de Login após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
     renderApp();
     // Inicializa o Listener para fechar o modal ao clicar fora
     modalOverlay.addEventListener('click', (e) => {
         if (e.target === modalOverlay) {
             closeModal();
         }
     });
});