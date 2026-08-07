/* ============================================================
   GORDIN BURGUER — dados.js
   Fonte única do cardápio. Este arquivo é usado tanto pelo site
   (script.js) quanto pelo painel administrativo (admin.js).

   COMO ATUALIZAR O CARDÁPIO MANUALMENTE:
   Copie um objeto do array PRODUTOS_PADRAO, cole no fim do array
   e altere os dados. Não é preciso mexer no HTML.
   (O jeito mais fácil, porém, é usar o admin.html.)
   ============================================================ */

"use strict";

/* ---------- CONFIGURAÇÕES GERAIS (edite aqui) ---------- */
const CONFIG = {
  whatsapp: "5534992171517",            // número no formato 55DDDNÚMERO (só dígitos)
  ifoodUrl: "https://www.ifood.com.br/delivery/uberlandia-mg/brasa-burger--ponto-do-gordinho-marta-helena/f74ce6fc-8a3b-4ad2-9e37-6d0fcc59d743", // link da loja no iFood
  nomeLoja: "Gordin Burguer",
  usuarioAdmin: "admin1",
  senhaAdmin: "admin123456",
  chaveStorageProdutos: "gordin_burguer_produtos",
  chaveStorageCategorias: "gordin_burguer_categorias",
  chaveStorageCarrinho: "gordin_burguer_carrinho",
};

/* ---------- CATEGORIAS PADRÃO (ordem de exibição) ---------- */
const CATEGORIAS_PADRAO = [
  "Hambúrgueres",
  "Espetinhos",
  "Porções",
  "Caldos",
  "Bebidas",
  "Sobremesas",
];

/* Emoji usado como imagem de reserva por categoria, caso a foto
   do produto ainda não exista dentro da pasta /img. */
const EMOJI_CATEGORIA = {
  "Hambúrgueres": "🍔",
  "Espetinhos": "🍢",
  "Porções": "🍟",
  "Caldos": "🍲",
  "Bebidas": "🥤",
  "Sobremesas": "🍨",
};

const IMAGENS_EXISTENTES = new Set([
  "gordinclassic.jpeg",
  "gordinxcatupiry.jpeg",
  "baconchedar.jpeg",
  "gordinbacon.jpeg",
  "gordinbrabão.jpeg",
  "gordinsuperqueijo.jpeg",
  "placeholder.svg",
]);

function normalizarImagemProduto(produto) {
  if (!produto || !produto.imagem) return "img/placeholder.svg";
  const arquivo = produto.imagem.split("/").pop().toLowerCase();
  return IMAGENS_EXISTENTES.has(arquivo) ? produto.imagem : "img/placeholder.svg";
}

/* ---------- BASE DE PRODUTOS (formato JSON) ----------
   Campos de cada produto:
     id            -> identificador único (texto)
     categoria     -> precisa bater com uma categoria existente
     nome          -> nome do produto
     descricao     -> texto curto (aparece no card e no modal)
     ingredientes  -> lista de ingredientes (aparece no modal)
     preco         -> número (use ponto, ex: 19.90)
     precoAntigo   -> opcional, mostra o preço "de" riscado (promoção)
     imagem        -> caminho da foto, ex: "img/classico.jpg"
     maisVendido / novidade / promocao -> true/false, controla os selos
     visivel       -> true/false, controla se o produto aparece no site
--------------------------------------------------------------- */
const PRODUTOS_PADRAO = [
  // ----- HAMBÚRGUERES -----
  {
    id: "hb-01", categoria: "Hambúrgueres", nome: "Gordin Clássico",
    descricao: "Pão brioche, hambúrguer Angus, mussarela e maionese da casa.",
    ingredientes: ["Pão brioche", "Hambúrguer Angus", "Mussarela", "Maionese da casa"],
    preco: 19.90, imagem: "img/gordinclassic.jpeg",
    maisVendido: true, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "hb-02", categoria: "Hambúrgueres", nome: "Gordin X Catupiry",
    descricao: "Pão brioche, Angus, catupiry, mussarela, tomate, alface e maionese da casa.",
    ingredientes: ["Pão brioche", "Hambúrguer Angus", "Catupiry", "Mussarela", "Tomate", "Alface", "Maionese da casa"],
    preco: 24.90, imagem: "img/gordinXcatupiry.jpeg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "hb-03", categoria: "Hambúrgueres", nome: "Gordin Bacon Cheddar",
    descricao: "Pão brioche, Angus, cheddar, bacon crocante e molho especial da casa.",
    ingredientes: ["Pão brioche", "Hambúrguer Angus", "Cheddar", "Bacon", "Molho especial"],
    preco: 24.90, precoAntigo: 28.90, imagem: "img/baconchedar.jpeg",
    maisVendido: false, novidade: false, promocao: true, visivel: true,
  },
  {
    id: "hb-04", categoria: "Hambúrgueres", nome: "Gordin Bacon",
    descricao: "Pão brioche, Angus, dobro de bacon, cheddar e molho especial.",
    ingredientes: ["Pão brioche", "Hambúrguer Angus", "Dobro de bacon", "Cheddar", "Molho especial"],
    preco: 25.90, imagem: "img/gordinbacon.jpeg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "hb-05", categoria: "Hambúrgueres", nome: "Gordin Brabão",
    descricao: "Pão brioche, Angus, cheddar, catupiry, cebola caramelizada e barbecue.",
    ingredientes: ["Pão brioche", "Hambúrguer Angus", "Cheddar", "Catupiry", "Cebola caramelizada", "Barbecue"],
    preco: 26.90, imagem: "img/gordinbrabão.jpeg",
    maisVendido: false, novidade: true, promocao: false, visivel: true,
  },
  {
    id: "hb-06", categoria: "Hambúrgueres", nome: "Gordin Super Queijo",
    descricao: "Pão brioche, Angus, mussarela, dobro de cheddar, dobro de catupiry, provolone e cebola caramelizada.",
    ingredientes: ["Pão brioche", "Hambúrguer Angus", "Mussarela", "Dobro de cheddar", "Dobro de catupiry", "Provolone", "Cebola caramelizada"],
    preco: 31.90, imagem: "img/gordinsuperqueijo.jpeg",
    maisVendido: true, novidade: false, promocao: false, visivel: true,
  },

  // ----- ESPETINHOS -----
  {
    id: "es-01", categoria: "Espetinhos", nome: "Espetinho de Picanha",
    descricao: "Picanha suculenta grelhada na brasa, servida no ponto que você pedir.",
    ingredientes: ["Picanha", "Sal grosso", "Farofa", "Vinagrete"],
    preco: 14.90, imagem: "img/placeholder.svg",
    maisVendido: true, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "es-02", categoria: "Espetinhos", nome: "Espetinho de Frango com Bacon",
    descricao: "Frango temperado, enrolado no bacon e grelhado na brasa.",
    ingredientes: ["Frango", "Bacon", "Temperos da casa"],
    preco: 12.90, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "es-03", categoria: "Espetinhos", nome: "Espetinho de Linguiça Artesanal",
    descricao: "Linguiça artesanal grelhada, acompanha pão de alho.",
    ingredientes: ["Linguiça artesanal", "Pão de alho"],
    preco: 11.90, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },

  // ----- PORÇÕES -----
  {
    id: "po-01", categoria: "Porções", nome: "Batata Frita da Casa",
    descricao: "Batatas crocantes por fora e macias por dentro, tempero exclusivo.",
    ingredientes: ["Batata", "Tempero da casa", "Cheiro verde"],
    preco: 26.90, imagem: "img/placeholder.svg",
    maisVendido: true, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "po-02", categoria: "Porções", nome: "Onion Rings",
    descricao: "Anéis de cebola empanados e fritos, crocância na medida.",
    ingredientes: ["Cebola", "Empanado da casa", "Molho barbecue"],
    preco: 24.90, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: true, promocao: false, visivel: true,
  },
  {
    id: "po-03", categoria: "Porções", nome: "Frango a Passarinho",
    descricao: "Pedaços de frango temperados e fritos, crocantes por fora.",
    ingredientes: ["Frango", "Alho", "Limão", "Farinha temperada"],
    preco: 32.90, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },

  // ----- CALDOS -----
  {
    id: "ca-01", categoria: "Caldos", nome: "Caldo de Mocotó",
    descricao: "Caldo encorpado, preparado lentamente com temperos especiais.",
    ingredientes: ["Mocotó", "Legumes", "Temperos da casa"],
    preco: 16.90, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "ca-02", categoria: "Caldos", nome: "Caldo de Feijão",
    descricao: "Caldo cremoso de feijão com bacon e toque de couve.",
    ingredientes: ["Feijão", "Bacon", "Couve", "Temperos da casa"],
    preco: 14.90, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },

  // ----- BEBIDAS -----
  {
    id: "be-01", categoria: "Bebidas", nome: "Chopp Artesanal 500ml",
    descricao: "Chopp gelado, servido na hora, direto do barril.",
    ingredientes: ["Chopp artesanal"],
    preco: 13.90, imagem: "img/placeholder.svg",
    maisVendido: true, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "be-02", categoria: "Bebidas", nome: "Refrigerante Lata",
    descricao: "Coca-Cola, Guaraná, Fanta ou Sprite, geladinho.",
    ingredientes: ["Lata 350ml"],
    preco: 7.00, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "be-03", categoria: "Bebidas", nome: "Suco Natural",
    descricao: "Suco natural da fruta, feito na hora, sem adição de açúcar.",
    ingredientes: ["Fruta da estação", "Água ou leite"],
    preco: 10.90, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },

  // ----- SOBREMESAS -----
  {
    id: "so-01", categoria: "Sobremesas", nome: "Petit Gâteau",
    descricao: "Bolo quente de chocolate com recheio cremoso e sorvete de creme.",
    ingredientes: ["Chocolate", "Sorvete de creme", "Calda"],
    preco: 22.90, imagem: "img/placeholder.svg",
    maisVendido: false, novidade: false, promocao: false, visivel: true,
  },
  {
    id: "so-02", categoria: "Sobremesas", nome: "Brownie com Sorvete",
    descricao: "Brownie quentinho com sorvete de creme e calda de chocolate.",
    ingredientes: ["Brownie", "Sorvete de creme", "Calda de chocolate"],
    preco: 19.90, imagem: "img/placeholder.svg",
    maisVendido: true, novidade: false, promocao: false, visivel: true,
  },
];

/* ---------- Utilitário compartilhado: carregar do localStorage ---------- */
// Sempre lê o localStorage primeiro (onde o admin.html salva as alterações).
// Se ainda não existir nada salvo, usa os dados padrão acima e já grava
// uma cópia, para o admin.html poder editar a partir do mesmo ponto.
function carregarProdutos() {
  try {
    const salvos = localStorage.getItem(CONFIG.chaveStorageProdutos);
    if (salvos) {
      const produtosSalvos = JSON.parse(salvos);
      produtosSalvos.forEach(p => { p.imagem = normalizarImagemProduto(p); });
      return produtosSalvos;
    }
  } catch (e) {
    console.warn("Não foi possível ler produtos salvos, usando padrão.", e);
  }

  const produtosPadraoNormalizados = JSON.parse(JSON.stringify(PRODUTOS_PADRAO));
  produtosPadraoNormalizados.forEach(p => { p.imagem = normalizarImagemProduto(p); });
  localStorage.setItem(CONFIG.chaveStorageProdutos, JSON.stringify(produtosPadraoNormalizados));
  return produtosPadraoNormalizados;
}

function salvarProdutos(lista) {
  localStorage.setItem(CONFIG.chaveStorageProdutos, JSON.stringify(lista));
}

function carregarCategorias(produtosAtuais) {
  let categorias;
  try {
    const salvas = localStorage.getItem(CONFIG.chaveStorageCategorias);
    categorias = salvas ? JSON.parse(salvas) : [...CATEGORIAS_PADRAO];
  } catch (e) {
    categorias = [...CATEGORIAS_PADRAO];
  }
  produtosAtuais.forEach(p => { if (!categorias.includes(p.categoria)) categorias.push(p.categoria); });
  return categorias;
}

function salvarCategorias(lista) {
  localStorage.setItem(CONFIG.chaveStorageCategorias, JSON.stringify(lista));
}
