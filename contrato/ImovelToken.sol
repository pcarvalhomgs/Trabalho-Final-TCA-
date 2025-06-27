// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ImovelToken is ERC1155, Ownable {

    struct ImovelInfo {
        string nome;
        string enderecoCompleto;
        string urlImagem;
        string inscricaoImobiliaria;
        string matricula;
        string oficio;
        uint256 valorTotal; // Valor em Wei
        address proprietarioOriginal;
        uint256 totalDeTokens;
        bool tokenizado;
    }

    mapping(uint256 => ImovelInfo) public imoveis;
    uint256 private _nextTokenId;

    event ImovelTokenizado(
        uint256 indexed tokenId,
        address indexed proprietarioOriginal,
        string nome,
        uint256 quantidadeTokens
    );

    event TokensComprados(
        uint256 indexed tokenId,
        address indexed comprador,
        uint256 quantidade,
        uint256 valorPago
    );

    constructor() ERC1155("") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    function tokenizarImovel(
        address proprietarioCarteira, 
        uint256 quantidadeTokens, 
        uint256 valorTotalEmWei,
        string memory nome, 
        string memory enderecoCompleto, 
        string memory urlImagem,
        string memory inscricao, 
        string memory matricula, 
        string memory oficio
    ) public onlyOwner {
        require(proprietarioCarteira != address(0), "Endereco invalido");
        require(quantidadeTokens > 0, "Quantidade deve ser maior que zero");
        require(valorTotalEmWei > 0, "Valor deve ser maior que zero");
        
        uint256 tokenId = _nextTokenId++;
        
        imoveis[tokenId] = ImovelInfo({
            nome: nome,
            enderecoCompleto: enderecoCompleto,
            urlImagem: urlImagem,
            inscricaoImobiliaria: inscricao,
            matricula: matricula,
            oficio: oficio,
            valorTotal: valorTotalEmWei,
            proprietarioOriginal: proprietarioCarteira,
            totalDeTokens: quantidadeTokens,
            tokenizado: true
        });
        
        _mint(proprietarioCarteira, tokenId, quantidadeTokens, "");
        emit ImovelTokenizado(tokenId, proprietarioCarteira, nome, quantidadeTokens);
    }
    
    function getImovelInfo(uint256 tokenId) public view returns (ImovelInfo memory) {
        require(imoveis[tokenId].tokenizado, "Imovel nao existe");
        return imoveis[tokenId];
    }
    
    function proximoTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
    
    function calcularPrecoPorToken(uint256 tokenId) public view returns (uint256) {
        ImovelInfo memory imovel = imoveis[tokenId];
        require(imovel.tokenizado, "Imovel nao existe");
        require(imovel.totalDeTokens > 0, "Divisao por zero");
        
        return imovel.valorTotal / imovel.totalDeTokens;
    }

    function comprarTokens(uint256 tokenId, uint256 quantidade) public payable {
        require(quantidade > 0, "Quantidade deve ser maior que zero");
        
        ImovelInfo memory imovel = imoveis[tokenId];
        require(imovel.tokenizado, "Imovel nao existe");
        
        address vendedor = imovel.proprietarioOriginal;
        require(balanceOf(vendedor, tokenId) >= quantidade, "Tokens insuficientes");
        
        uint256 precoPorToken = calcularPrecoPorToken(tokenId);
        uint256 custoTotal = precoPorToken * quantidade;
        
        require(msg.value >= custoTotal, "Valor insuficiente");

        // Transferir tokens
        _safeTransferFrom(vendedor, msg.sender, tokenId, quantidade, "");

        // Pagar o vendedor
        payable(vendedor).transfer(custoTotal);

        // Devolver troco se houver
        if (msg.value > custoTotal) {
            payable(msg.sender).transfer(msg.value - custoTotal);
        }

        emit TokensComprados(tokenId, msg.sender, quantidade, custoTotal);
    }

    function uri(uint256) public view virtual override returns (string memory) {
        return "";
    }
}