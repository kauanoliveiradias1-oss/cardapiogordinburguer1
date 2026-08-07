/* ============================================================
   GORDIN BURGUER — script.js
   Toda a lógica do cardápio digital: busca, categorias, modal de
   detalhes, animações de entrada e botões de pedido.

   Os dados dos produtos (CONFIG, categorias e a lista de produtos)
   ficam em "dados.js", carregado antes deste arquivo no index.html.

   COMO ATUALIZAR O CARDÁPIO:
   1) O jeito mais simples: abra "admin.html" no navegador e use
      o painel administrativo (adicionar, editar, ocultar, etc).
   2) O jeito manual: edite o array PRODUTOS_PADRAO em "dados.js".
   ============================================================ */

"use strict";

const produtos = carregarProdutos();
const categorias = carregarCategorias(produtos);
const carrinho = carregarCarrinho();

function carregarCarrinho() {
  try {
    const salvo = localStorage.getItem(CONFIG.chaveStorageCarrinho);
    return salvo ? JSON.parse(salvo) : [];
  } catch (e) {
    console.warn("Não foi possível ler o carrinho salvo.", e);
    return [];
  }
}

function salvarCarrinho() {
  localStorage.setItem(CONFIG.chaveStorageCarrinho, JSON.stringify(carrinho));
}

// Quando os dados de produtos ou categorias mudam em outra aba/admin,
// recarrega o cardápio automaticamente.
window.addEventListener("storage", (event) => {
  if (event.key === CONFIG.chaveStorageProdutos || event.key === CONFIG.chaveStorageCategorias) {
    window.location.reload();
  }
});

function contarItensCarrinho() {
  return carrinho.reduce((total, item) => total + item.quantidade, 0);
}

function calcularTotalCarrinho() {
  return carrinho.reduce((total, item) => {
    const produto = produtos.find(p => p.id === item.id);
    return total + (produto ? produto.preco * item.quantidade : 0);
  }, 0);
}

function linkWhatsappCarrinho() {
  const itens = carrinho.map(item => {
    const produto = produtos.find(p => p.id === item.id);
    return produto ? `${item.quantidade}x ${produto.nome}` : null;
  }).filter(Boolean).join("\n");

  const texto = `Olá! Quero pedir:\n${itens}\n\nTotal: ${formatarPreco(calcularTotalCarrinho())}`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/* ---------- FUNÇÕES AUXILIARES ---------- */
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function slugCategoria(categoria) {
  return "cat-" + categoria
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-");
}

// Gera um SVG simples em base64 como imagem de reserva, usando o
// emoji da categoria — evita quebrar o layout quando a foto real
// ainda não foi adicionada em /img.
function imagemReserva(categoria) {
  const emoji = EMOJI_CATEGORIA[categoria] || "🍽️";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#241a10"/>
        <stop offset="100%" stop-color="#0d0d0d"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <text x="50%" y="54%" font-size="72" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

function linkWhatsapp(produto) {
  const texto = `Olá! Vim pelo cardápio digital e quero pedir: *${produto.nome}* (${formatarPreco(produto.preco)}).`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/* ---------- 6. RENDERIZAÇÃO DOS SELOS ---------- */
function selosDoProduto(produto) {
  const selos = [];
  if (produto.promocao) selos.push({ classe: "selo--promocao", texto: "Promoção" });
  if (produto.maisVendido) selos.push({ classe: "selo--mais-vendido", texto: "Mais Pedido" });
  if (produto.novidade) selos.push({ classe: "selo--novidade", texto: "Novidade" });
  return selos;
}

function htmlSelo(produto) {
  const selos = selosDoProduto(produto);
  if (!selos.length) return "";
  const principal = selos[0];
  return `<span class="selo ${principal.classe}">${principal.texto}</span>`;
}

/* ---------- 7. CARD DE PRODUTO ---------- */
function criarCardProduto(produto) {
  const card = document.createElement("article");
  card.className = "produto-card";
  card.dataset.id = produto.id;

  const precoAntigoHtml = produto.precoAntigo
    ? `<span class="produto-card__preco-de">${formatarPreco(produto.precoAntigo)}</span>`
    : "";

  card.innerHTML = `
    <div class="produto-card__imagem-wrap">
      ${htmlSelo(produto)}
      <img class="produto-card__imagem" src="${produto.imagem}" alt="${produto.nome}"
           onerror="this.onerror=null; this.src='${imagemReserva(produto.categoria)}';" loading="lazy">
    </div>
    <div class="produto-card__corpo">
      <h3 class="produto-card__nome">${produto.nome}</h3>
      <p class="produto-card__desc">${produto.descricao}</p>
      <div class="produto-card__rodape">
        <div>
          ${precoAntigoHtml}
          <span class="produto-card__preco">${formatarPreco(produto.preco)}</span>
        </div>
        <button class="produto-card__btn" type="button">Ver detalhes</button>
      </div>
    </div>
  `;

  card.querySelector(".produto-card__btn").addEventListener("click", () => abrirModal(produto));
  card.querySelector(".produto-card__imagem-wrap").addEventListener("click", () => abrirModal(produto));

  return card;
}

/* ---------- 8. RENDERIZAÇÃO PRINCIPAL ---------- */
const containerProdutos = document.getElementById("produtosContainer");
const chipsCategorias = document.getElementById("categoriasChips");
const listaPromocoes = document.getElementById("listaPromocoes");
const listaDestaques = document.getElementById("listaDestaques");
const secaoPromocoes = document.getElementById("promocoes");
const secaoDestaques = document.getElementById("mais-vendidos");

const botaoCarrinho = document.getElementById("botaoCarrinho");
const carrinhoContador = document.getElementById("carrinhoContador");
const carrinhoFundo = document.getElementById("carrinhoFundo");
const carrinhoDrawer = document.getElementById("carrinhoDrawer");
const carrinhoItens = document.getElementById("carrinhoItens");
const carrinhoTotal = document.getElementById("carrinhoTotal");
const carrinhoContagemResumo = document.getElementById("carrinhoContagemResumo");
const botaoFecharCarrinho = document.getElementById("fecharCarrinho");
const botaoFinalizarCarrinho = document.getElementById("botaoFinalizarCarrinho");
const botaoLimparCarrinho = document.getElementById("botaoLimparCarrinho");
const modalAdicionarCarrinho = document.getElementById("modalAdicionarCarrinho");

function abrirCarrinho() {
  carrinhoFundo.hidden = false;
  carrinhoFundo.classList.add("ativo");
  document.body.style.overflow = "hidden";
}

function fecharCarrinhoDrawer() {
  carrinhoFundo.classList.remove("ativo");
  setTimeout(() => { if (!carrinhoFundo.classList.contains("ativo")) carrinhoFundo.hidden = true; }, 220);
  document.body.style.overflow = "";
}

function atualizarCarrinhoUI() {
  const quantidadeTotal = contarItensCarrinho();
  carrinhoContador.textContent = quantidadeTotal;
  carrinhoContagemResumo.textContent = `${quantidadeTotal} item${quantidadeTotal !== 1 ? "s" : ""}`;
  carrinhoTotal.textContent = formatarPreco(calcularTotalCarrinho());

  if (!carrinho.length) {
    carrinhoItens.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio.</p>`;
    botaoFinalizarCarrinho.disabled = true;
    botaoLimparCarrinho.disabled = true;
    return;
  }

  botaoFinalizarCarrinho.disabled = false;
  botaoLimparCarrinho.disabled = false;

  carrinhoItens.innerHTML = carrinho.map(item => {
    const produto = produtos.find(p => p.id === item.id);
    if (!produto) return "";
    return `
      <div class="carrinho-item">
        <div class="carrinho-item__info">
          <strong>${produto.nome}</strong>
          <span>${formatarPreco(produto.preco * item.quantidade)}</span>
        </div>
        <div class="carrinho-item__acoes">
          <button class="carrinho-btn" data-action="menos" data-id="${item.id}">−</button>
          <span>${item.quantidade}</span>
          <button class="carrinho-btn" data-action="mais" data-id="${item.id}">+</button>
          <button class="carrinho-btn carrinho-btn--remover" data-action="remover" data-id="${item.id}">Remover</button>
        </div>
      </div>`;
  }).join("");
}

function adicionarAoCarrinho(id, quantidade = 1) {
  const item = carrinho.find(i => i.id === id);
  if (item) {
    item.quantidade += quantidade;
  } else {
    carrinho.push({ id, quantidade });
  }
  salvarCarrinho();
  atualizarCarrinhoUI();
}

function atualizarQuantidadeCarrinho(id, quantidade) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.quantidade = Math.max(1, quantidade);
  if (item.quantidade <= 0) {
    removerItemCarrinho(id);
    return;
  }
  salvarCarrinho();
  atualizarCarrinhoUI();
}

function removerItemCarrinho(id) {
  const index = carrinho.findIndex(i => i.id === id);
  if (index === -1) return;
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarCarrinhoUI();
}

botaoCarrinho.addEventListener("click", () => {
  atualizarCarrinhoUI();
  abrirCarrinho();
});

botaoFecharCarrinho.addEventListener("click", fecharCarrinhoDrawer);

carrinhoFundo.addEventListener("click", (ev) => {
  if (ev.target === carrinhoFundo) fecharCarrinhoDrawer();
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && carrinhoFundo.classList.contains("ativo")) {
    fecharCarrinhoDrawer();
  }
});

carrinhoItens.addEventListener("click", (ev) => {
  const botao = ev.target.closest("button[data-action]");
  if (!botao) return;
  const id = botao.dataset.id;
  const item = carrinho.find(i => i.id === id);
  if (!item) return;

  if (botao.dataset.action === "mais") atualizarQuantidadeCarrinho(id, item.quantidade + 1);
  else if (botao.dataset.action === "menos") {
    if (item.quantidade <= 1) removerItemCarrinho(id);
    else atualizarQuantidadeCarrinho(id, item.quantidade - 1);
  } else if (botao.dataset.action === "remover") removerItemCarrinho(id);
});

botaoFinalizarCarrinho.addEventListener("click", () => {
  if (!carrinho.length) return;
  window.open(linkWhatsappCarrinho(), "_blank");
});

botaoLimparCarrinho.addEventListener("click", () => {
  if (!carrinho.length) return;
  if (!confirm("Limpar o carrinho?")) return;
  carrinho.splice(0, carrinho.length);
  salvarCarrinho();
  atualizarCarrinhoUI();
});

modalAdicionarCarrinho.addEventListener("click", () => {
  const id = modalAdicionarCarrinho.dataset.id;
  if (!id) return;
  adicionarAoCarrinho(id);
  abrirCarrinho();
});
function renderizarChipsCategorias(categoriasComProdutos) {
  chipsCategorias.innerHTML = "";
  categoriasComProdutos.forEach((categoria, index) => {
    const chip = document.createElement("a");
    chip.href = `#${slugCategoria(categoria)}`;
    chip.className = "categoria-chip" + (index === 0 ? " ativa" : "");
    chip.textContent = `${EMOJI_CATEGORIA[categoria] || ""} ${categoria}`.trim();
    chip.addEventListener("click", (ev) => {
      ev.preventDefault();
      document.querySelectorAll(".categoria-chip").forEach(c => c.classList.remove("ativa"));
      chip.classList.add("ativa");
      const alvo = document.getElementById(slugCategoria(categoria));
      if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    chipsCategorias.appendChild(chip);
  });
}

function renderizarCarrossel(container, lista) {
  container.innerHTML = "";
  lista.forEach(produto => container.appendChild(criarCardProduto(produto)));
  observarCards(container.querySelectorAll(".produto-card"));
}

function renderizarProdutos(termoBusca = "") {
  containerProdutos.innerHTML = "";
  const termo = termoBusca.trim().toLowerCase();

  const visiveis = produtos.filter(p => p.visivel !== false);
  const filtrados = termo
    ? visiveis.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo) ||
        (p.ingredientes || []).some(i => i.toLowerCase().includes(termo))
      )
    : visiveis;

  // texto de resultado da busca
  const resultadoEl = document.getElementById("buscaResultado");
  if (termo) {
    resultadoEl.hidden = false;
    resultadoEl.textContent = filtrados.length
      ? `${filtrados.length} produto${filtrados.length > 1 ? "s" : ""} encontrado${filtrados.length > 1 ? "s" : ""} para "${termoBusca}"`
      : `Nenhum produto encontrado para "${termoBusca}"`;
  } else {
    resultadoEl.hidden = true;
  }

  // esconde promoções/destaques durante a busca para focar no resultado
  const emBusca = !!termo;
  secaoPromocoes.style.display = emBusca ? "none" : "";
  secaoDestaques.style.display = emBusca ? "none" : "";

  if (!filtrados.length) {
    containerProdutos.innerHTML = `<p class="sem-resultado">Nenhum produto encontrado. Tente buscar por outro termo 🔍</p>`;
    return;
  }

  const categoriasComProdutos = categorias.filter(cat => filtrados.some(p => p.categoria === cat));
  if (!emBusca) renderizarChipsCategorias(categoriasComProdutos);

  categoriasComProdutos.forEach(categoria => {
    const itensCategoria = filtrados.filter(p => p.categoria === categoria);
    if (!itensCategoria.length) return;

    const secao = document.createElement("section");
    secao.className = "categoria-secao";
    secao.id = slugCategoria(categoria);

    secao.innerHTML = `
      <h2 class="categoria-secao__titulo">
        ${EMOJI_CATEGORIA[categoria] || ""} ${categoria}
        <span class="contagem">${itensCategoria.length} ${itensCategoria.length > 1 ? "itens" : "item"}</span>
      </h2>
    `;

    const grid = document.createElement("div");
    grid.className = "grid-produtos";
    itensCategoria.forEach(produto => grid.appendChild(criarCardProduto(produto)));
    secao.appendChild(grid);

    containerProdutos.appendChild(secao);
    observarCards(grid.querySelectorAll(".produto-card"));
  });
}

/* ---------- 9. ANIMAÇÃO DE ENTRADA DOS CARDS (scroll) ---------- */
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada, indice) => {
    if (entrada.isIntersecting) {
      setTimeout(() => entrada.target.classList.add("em-vista"), indice * 45);
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });

function observarCards(cards) {
  cards.forEach(card => observador.observe(card));
}

/* ---------- 10. MODAL DE PRODUTO ---------- */
const modalFundo = document.getElementById("modalFundo");
const modalImagem = document.getElementById("modalImagem");
const modalSelo = document.getElementById("modalSelo");
const modalCategoria = document.getElementById("modalCategoria");
const modalNome = document.getElementById("modalNome");
const modalDescricao = document.getElementById("modalDescricao");
const modalIngredientesWrap = document.getElementById("modalIngredientesWrap");
const modalIngredientes = document.getElementById("modalIngredientes");
const modalPrecoDe = document.getElementById("modalPrecoDe");
const modalPreco = document.getElementById("modalPreco");
const modalWhatsapp = document.getElementById("modalWhatsapp");
const modalIfood = document.getElementById("modalIfood");

function abrirModal(produto) {
  modalImagem.src = produto.imagem;
  modalImagem.alt = produto.nome;
  modalImagem.onerror = function () { this.onerror = null; this.src = imagemReserva(produto.categoria); };

  const selos = selosDoProduto(produto);
  if (selos.length) {
    modalSelo.hidden = false;
    modalSelo.textContent = selos[0].texto;
    modalSelo.className = "selo modal__selo " + selos[0].classe;
  } else {
    modalSelo.hidden = true;
  }

  modalCategoria.textContent = produto.categoria;
  modalNome.textContent = produto.nome;
  modalDescricao.textContent = produto.descricao;

  if (produto.ingredientes && produto.ingredientes.length) {
    modalIngredientesWrap.style.display = "";
    modalIngredientes.innerHTML = produto.ingredientes
      .map(ing => `<span class="pill">${ing}</span>`).join("");
  } else {
    modalIngredientesWrap.style.display = "none";
  }

  if (produto.precoAntigo) {
    modalPrecoDe.hidden = false;
    modalPrecoDe.textContent = formatarPreco(produto.precoAntigo);
  } else {
    modalPrecoDe.hidden = true;
  }
  modalPreco.textContent = formatarPreco(produto.preco);

  modalWhatsapp.href = linkWhatsapp(produto);
  modalIfood.href = CONFIG.ifoodUrl;
  modalAdicionarCarrinho.dataset.id = produto.id;

  modalFundo.classList.add("ativo");
  document.body.style.overflow = "hidden";
}

function fecharModal() {
  modalFundo.classList.remove("ativo");
  document.body.style.overflow = "";
}

document.getElementById("modalFechar").addEventListener("click", fecharModal);
modalFundo.addEventListener("click", (ev) => { if (ev.target === modalFundo) fecharModal(); });
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") fecharModal(); });

/* ---------- 11. BUSCA EM TEMPO REAL ---------- */
const campoBusca = document.getElementById("campoBusca");
const botaoLimparBusca = document.getElementById("limparBusca");

let temporizadorBusca = null;
campoBusca.addEventListener("input", (ev) => {
  const valor = ev.target.value;
  botaoLimparBusca.hidden = valor.length === 0;
  clearTimeout(temporizadorBusca);
  // pequeno debounce para não re-renderizar a cada tecla em listas grandes
  temporizadorBusca = setTimeout(() => renderizarProdutos(valor), 120);
});

botaoLimparBusca.addEventListener("click", () => {
  campoBusca.value = "";
  botaoLimparBusca.hidden = true;
  renderizarProdutos("");
  campoBusca.focus();
});

/* ---------- 12. INICIALIZAÇÃO ---------- */
function iniciar() {
  document.getElementById("anoAtual").textContent = new Date().getFullYear();

  const visiveis = produtos.filter(p => p.visivel !== false);

  const promos = visiveis.filter(p => p.promocao);
  const destaques = visiveis.filter(p => p.maisVendido || p.novidade);

  secaoPromocoes.style.display = promos.length ? "" : "none";
  secaoDestaques.style.display = destaques.length ? "" : "none";
  if (promos.length) renderizarCarrossel(listaPromocoes, promos);
  if (destaques.length) renderizarCarrossel(listaDestaques, destaques);

  renderizarProdutos("");
  atualizarCarrinhoUI();
}

iniciar();
