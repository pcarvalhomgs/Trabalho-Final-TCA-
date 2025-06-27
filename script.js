// Variáveis globais
let provider = null;
let signer = null;
let contract = null;
let userAddress = null;

// Elementos DOM
const connectWalletBtn = document.getElementById('connectWallet');
const walletAddressDiv = document.getElementById('walletAddress');
const tokenizeForm = document.getElementById('tokenizeForm');
const compraForm = document.getElementById('compraForm');
const consultarBtn = document.getElementById('consultarImovel');
const calcularPrecoBtn = document.getElementById('calcularPreco');
const statusDiv = document.getElementById('status');

// Event Listeners
document.addEventListener('DOMContentLoaded', init);
connectWalletBtn.addEventListener('click', connectWallet);
tokenizeForm.addEventListener('submit', tokenizarImovel);
compraForm.addEventListener('submit', comprarTokens);
consultarBtn.addEventListener('click', consultarImovel);
calcularPrecoBtn.addEventListener('click', calcularPreco);

// Inicialização
async function init() {
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.BrowserProvider(window.ethereum);
        
        // Verificar se já está conectado
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            await setupWallet();
        }
        
        // Escutar mudanças de conta
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
    } else {
        showStatus('MetaMask não encontrado! Instale a extensão MetaMask.', 'error');
    }
}

// Conectar carteira
async function connectWallet() {
    try {
        showStatus('Conectando carteira...', 'loading');
        
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await setupWallet();
        
        showStatus('Carteira conectada com sucesso!', 'success');
    } catch (error) {
        showStatus('Erro ao conectar carteira: ' + error.message, 'error');
    }
}

// Configurar carteira
async function setupWallet() {
    try {
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Atualizar UI
        walletAddressDiv.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        connectWalletBtn.textContent = 'Carteira Conectada';
        connectWalletBtn.disabled = true;
        
        // Verificar e configurar rede
        await checkNetwork();
        
        // Inicializar contrato
        if (CONTRACT_CONFIG.CONTRACT_ADDRESS && CONTRACT_CONFIG.CONTRACT_ABI.length > 0) {
            contract = new ethers.Contract(CONTRACT_CONFIG.CONTRACT_ADDRESS, CONTRACT_CONFIG.CONTRACT_ABI, signer);
            showStatus('Contrato carregado com sucesso!', 'success');
        } else {
            showStatus('Configure o endereço e ABI do contrato no arquivo config.js', 'error');
        }
        
    } catch (error) {
        showStatus('Erro ao configurar carteira: ' + error.message, 'error');
    }
}

// Verificar rede
async function checkNetwork() {
    try {
        const network = await provider.getNetwork();
        const currentChainId = '0x' + network.chainId.toString(16);
        
        if (currentChainId !== CURRENT_NETWORK.chainId) {
            await switchNetwork();
        }
    } catch (error) {
        console.error('Erro ao verificar rede:', error);
    }
}

// Trocar rede
async function switchNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CURRENT_NETWORK.chainId }]
        });
    } catch (error) {
        if (error.code === 4902) {
            await addNetwork();
        }
    }
}

// Adicionar rede
async function addNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CURRENT_NETWORK]
        });
    } catch (error) {
        showStatus('Erro ao adicionar rede: ' + error.message, 'error');
    }
}

// Lidar com mudança de contas
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // Usuário desconectou
        userAddress = null;
        contract = null;
        walletAddressDiv.textContent = '';
        connectWalletBtn.textContent = 'Conectar Carteira';
        connectWalletBtn.disabled = false;
    } else {
        // Conta mudou
        setupWallet();
    }
}

// Tokenizar imóvel
async function tokenizarImovel(event) {
    event.preventDefault();
    
    if (!contract) {
        showStatus('Conecte sua carteira primeiro!', 'error');
        return;
    }
    
    try {
        showStatus('Tokenizando imóvel...', 'loading');
        
        const formData = new FormData(event.target);
        const dados = {
            proprietarioCarteira: document.getElementById('proprietarioCarteira').value,
            quantidadeTokens: parseInt(document.getElementById('quantidadeTokens').value),
            valorTotalWei: document.getElementById('valorTotalWei').value,
            nome: document.getElementById('nomeImovel').value,
            enderecoCompleto: document.getElementById('enderecoCompleto').value,
            urlImagem: document.getElementById('urlImagem').value || '',
            inscricaoImobiliaria: document.getElementById('inscricaoImobiliaria').value,
            matricula: document.getElementById('matricula').value,
            oficio: document.getElementById('oficio').value
        };
        
        const tx = await contract.tokenizarImovel(
            dados.proprietarioCarteira,
            dados.quantidadeTokens,
            dados.valorTotalWei,
            dados.nome,
            dados.enderecoCompleto,
            dados.urlImagem,
            dados.inscricaoImobiliaria,
            dados.matricula,
            dados.oficio
        );
        
        showStatus('Transação enviada. Aguardando confirmação...', 'loading');
        await tx.wait();
        
        showStatus('Imóvel tokenizado com sucesso!', 'success');
        tokenizeForm.reset();
        
    } catch (error) {
        showStatus('Erro ao tokenizar imóvel: ' + error.message, 'error');
    }
}

// Consultar imóvel
async function consultarImovel() {
    if (!contract) {
        showStatus('Conecte sua carteira primeiro!', 'error');
        return;
    }
    
    try {
        const tokenId = document.getElementById('tokenIdConsulta').value;
        if (!tokenId) {
            showStatus('Digite o ID do token!', 'error');
            return;
        }
        
        showStatus('Consultando imóvel...', 'loading');
        
        const imovelInfo = await contract.getImovelInfo(tokenId);
        //const saldo = await contract.balanceOf(imovelInfo.proprietarioOriginal, tokenId);
        
        document.getElementById('imovelInfo').innerHTML = `
            <div class="imovel-card">
                <div class="imovel-detail">
                    <strong>Nome:</strong>
                    ${imovelInfo.nome}
                </div>
                <div class="imovel-detail">
                    <strong>Endereço:</strong>
                    ${imovelInfo.enderecoCompleto}
                </div>
                <div class="imovel-detail">
                    <strong>Valor Total:</strong>
                    ${ethers.formatEther(imovelInfo.valorTotal)} ETH
                </div>
                <div class="imovel-detail">
                    <strong>Total de Tokens:</strong>
                    ${contract.balanceOf(imovelInfo.proprietarioOriginal, tokenId)}
                </div>
                <div class="imovel-detail">
                    <strong>Proprietário:</strong>
                    ${imovelInfo.proprietarioOriginal}
                </div>
                <div class="imovel-detail">
                    <strong>Inscrição Imobiliária:</strong>
                    ${imovelInfo.inscricaoImobiliaria}
                </div>
                <div class="imovel-detail">
                    <strong>Matrícula:</strong>
                    ${imovelInfo.matricula}
                </div>
                <div class="imovel-detail">
                    <strong>Ofício:</strong>
                    ${imovelInfo.oficio}
                </div>
            </div>
            ${imovelInfo.urlImagem ? `<img src="${imovelInfo.urlImagem}" alt="${imovelInfo.nome}" class="imovel-image">` : ''}
        `;
        
        showStatus('Imóvel consultado com sucesso!', 'success');
        
    } catch (error) {
        showStatus('Erro ao consultar imóvel: ' + error.message, 'error');
        document.getElementById('imovelInfo').innerHTML = '';
    }
}

// Calcular preço
async function calcularPreco() {
    if (!contract) {
        showStatus('Conecte sua carteira primeiro!', 'error');
        return;
    }
    
    try {
        const tokenId = document.getElementById('tokenIdCompra').value;
        const quantidade = document.getElementById('quantidadeCompra').value;
        
        if (!tokenId || !quantidade) {
            showStatus('Preencha o ID do token e a quantidade!', 'error');
            return;
        }
        
        const precoPorToken = await contract.calcularPrecoPorToken(tokenId);
        const custoTotal = precoPorToken * BigInt(quantidade);
        
        document.getElementById('precoPorToken').textContent = ethers.formatEther(precoPorToken);
        document.getElementById('custoTotal').textContent = ethers.formatEther(custoTotal);
        
        showStatus('Preço calculado!', 'success');
        
    } catch (error) {
        showStatus('Erro ao calcular preço: ' + error.message, 'error');
    }
}

// Comprar tokens
async function comprarTokens(event) {
    event.preventDefault();
    
    if (!contract) {
        showStatus('Conecte sua carteira primeiro!', 'error');
        return;
    }
    
    try {
        const tokenId = document.getElementById('tokenIdCompra').value;
        const quantidade = document.getElementById('quantidadeCompra').value;
        
        if (!tokenId || !quantidade) {
            showStatus('Preencha todos os campos!', 'error');
            return;
        }
        
        showStatus('Calculando custo da compra...', 'loading');
        
        const precoPorToken = await contract.calcularPrecoPorToken(tokenId);
        const custoTotal = precoPorToken * BigInt(quantidade);
        
        showStatus('Enviando transação de compra...', 'loading');
        
        const tx = await contract.comprarTokens(tokenId, quantidade, {
            value: custoTotal
        });
        
        showStatus('Transação enviada. Aguardando confirmação...', 'loading');
        await tx.wait();
        
        showStatus('Tokens comprados com sucesso!', 'success');
        compraForm.reset();
        document.getElementById('precoPorToken').textContent = '-';
        document.getElementById('custoTotal').textContent = '-';
        
    } catch (error) {
        showStatus('Erro ao comprar tokens: ' + error.message, 'error');
    }
}

// Mostrar status
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type} show`;
    
    setTimeout(() => {
        statusDiv.classList.remove('show');
    }, 5000);
}

// Utilitários
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatEther(value) {
    return parseFloat(ethers.formatEther(value)).toFixed(4);
}
