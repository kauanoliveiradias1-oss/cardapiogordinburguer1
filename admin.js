/* ============================================================
   GORDIN BURGUER — admin.js
   Painel administrativo simples, protegido por senha (definida em
   dados.js, em CONFIG.senhaAdmin). Tudo é salvo no localStorage,
   sem necessidade de servidor ou banco de dados.

   ATENÇÃO: esta senha é apenas uma trava simples de uso interno,
   feita em JavaScript no navegador — não é uma proteção robusta
   de segurança. Não a use para dados sensíveis.
   ============================================================ */

"use strict";

/* ---------- 1. ESTADO EM MEMÓRIA ---------- */
let produtos = carregarProdutos();       // vem de dados.js
let categorias = carregarCategorias(produtos); // vem de dados.js
let produtoEmEdicaoId = null;            // null = criando novo produto
let imagemSelecionadaBase64 = null;      // guarda foto enviada do computador, se houver

function persistirProdutos() {
  salvarProdutos(produtos); // função de dados.js
}
function persistirCategorias() {
  salvarCategorias(categorias); // função de dados.js
}

/* ---------- 2. LOGIN ---------- */
const telaLogin = document.getElementById("telaLogin");
const painelAdmin = document.getElementById("painelAdmin");
const formLogin = document.getElementById("formLogin");
const campoUsuario = document.getElementById("campoUsuario");
const campoSenha = document.getElementById("campoSenha");
const erroLogin = document.getElementById("erroLogin");

const CHAVE_SESSAO = "gordin_burguer_admin_logado";

function entrarNoPainel() {
  sessionStorage.setItem(CHAVE_SESSAO, "1");
  telaLogin.hidden = true;
  painelAdmin.hidden = false;
  renderizarTudo();
}

formLogin.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const usuarioValido = campoUsuario.value.trim() === CONFIG.usuarioAdmin;
  const senhaValida = campoSenha.value === CONFIG.senhaAdmin;

  if (usuarioValido && senhaValida) {
    erroLogin.hidden = true;
    entrarNoPainel();
  } else {
    erroLogin.hidden = false;
    campoSenha.value = "";
    campoSenha.focus();
  }
});

document.getElementById("btnSair").addEventListener("click", () => {
  sessionStorage.removeItem(CHAVE_SESSAO);
  location.reload();
});

/* ---------- 3. NAVEGAÇÃO ENTRE ABAS ---------- */
document.querySelectorAll(".admin-aba").forEach(botao => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".admin-aba").forEach(b => b.classList.remove("ativa"));
    document.querySelectorAll(".admin-secao").forEach(s => s.classList.remove("ativa"));
    botao.classList.add("ativa");
    document.getElementById("aba" + capitalizar(botao.dataset.aba)).classList.add("ativa");
  });
});
function capitalizar(texto) { return texto.charAt(0).toUpperCase() + texto.slice(1); }

/* ---------- 4. RENDERIZAÇÃO GERAL ---------- */
function renderizarTudo() {
  renderizarSeletorCategoriaFiltro();
  renderizarListaProdutos();
  renderizarCategorias();
}

/* ----- 4.1 Lista de produtos ----- */
const listaProdutosAdmin = document.getElementById("listaProdutosAdmin");
const filtroProdutos = document.getElementById("filtroProdutos");
const filtroCategoria = document.getElementById("filtroCategoria");
const contagemProdutos = document.getElementById("contagemProdutos");

function renderizarSeletorCategoriaFiltro() {
  const atual = filtroCategoria.value;
  filtroCategoria.innerHTML = `<option value="">Todas as categorias</option>` +
    categorias.map(c => `<option value="${c}">${c}</option>`).join("");
  filtroCategoria.value = atual;
}

function renderizarListaProdutos() {
  const termo = filtroProdutos.value.trim().toLowerCase();
  const categoriaEscolhida = filtroCategoria.value;

  const filtrados = produtos.filter(p => {
    const bateTermo = !termo || p.nome.toLowerCase().includes(termo);
    const bateCategoria = !categoriaEscolhida || p.categoria === categoriaEscolhida;
    return bateTermo && bateCategoria;
  });

  contagemProdutos.textContent = `${filtrados.length} de ${produtos.length} produtos`;

  if (!filtrados.length) {
    listaProdutosAdmin.innerHTML = `<p class="admin-legenda">Nenhum produto encontrado.</p>`;
    return;
  }

  listaProdutosAdmin.innerHTML = "";
  filtrados.forEach(produto => {
    const item = document.createElement("div");
    item.className = "admin-item" + (produto.visivel === false ? " oculto" : "");

    const tags = [
      produto.promocao ? `<span class="admin-tag admin-tag--promo">Promoção</span>` : "",
      produto.maisVendido ? `<span class="admin-tag admin-tag--vendido">Mais Pedido</span>` : "",
      produto.novidade ? `<span class="admin-tag admin-tag--novidade">Novidade</span>` : "",
      produto.visivel === false ? `<span class="admin-tag admin-tag--oculto">Oculto</span>` : "",
    ].join("");

    item.innerHTML = `
      <img class="admin-item__img" src="${produto.imagem}" alt=""
           onerror="this.onerror=null; this.src='${imagemReserva(produto.categoria)}';">
      <div class="admin-item__info">
        <div class="admin-item__nome">${produto.nome} ${tags}</div>
        <div class="admin-item__meta">${produto.categoria}</div>
      </div>
      <div class="admin-item__preco">${formatarPreco(produto.preco)}</div>
      <div class="admin-item__acoes">
        <button class="admin-icon-btn" title="${produto.visivel === false ? 'Mostrar' : 'Ocultar'}" data-acao="visibilidade">${produto.visivel === false ? "🙈" : "👁"}</button>
        <button class="admin-icon-btn" title="Editar" data-acao="editar">✏️</button>
        <button class="admin-icon-btn" title="Excluir" data-acao="excluir">🗑️</button>
      </div>
    `;

    item.querySelector('[data-acao="visibilidade"]').addEventListener("click", () => alternarVisibilidade(produto.id));
    item.querySelector('[data-acao="editar"]').addEventListener("click", () => abrirFormProduto(produto.id));
    item.querySelector('[data-acao="excluir"]').addEventListener("click", () => excluirProduto(produto.id));

    listaProdutosAdmin.appendChild(item);
  });
}

filtroProdutos.addEventListener("input", renderizarListaProdutos);
filtroCategoria.addEventListener("change", renderizarListaProdutos);

function alternarVisibilidade(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  produto.visivel = produto.visivel === false ? true : false;
  persistirProdutos();
  renderizarListaProdutos();
}

function excluirProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  if (!confirm(`Excluir "${produto.nome}" definitivamente?`)) return;
  produtos = produtos.filter(p => p.id !== id);
  persistirProdutos();
  renderizarListaProdutos();
}

/* ----- 4.2 Lista de categorias ----- */
const listaCategoriasAdmin = document.getElementById("listaCategoriasAdmin");

function renderizarCategorias() {
  listaCategoriasAdmin.innerHTML = "";
  categorias.forEach(categoria => {
    const qtd = produtos.filter(p => p.categoria === categoria).length;
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${EMOJI_CATEGORIA[categoria] || "🍽️"} ${categoria} <span class="qtd">(${qtd} produto${qtd === 1 ? "" : "s"})</span></span>
      <button class="admin-icon-btn" title="Remover categoria" data-cat="${categoria}">🗑️</button>
    `;
    li.querySelector("button").addEventListener("click", () => removerCategoria(categoria, qtd));
    listaCategoriasAdmin.appendChild(li);
  });
}

document.getElementById("formNovaCategoria").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const campo = document.getElementById("campoNovaCategoria");
  const nome = campo.value.trim();
  if (!nome) return;
  if (categorias.some(c => c.toLowerCase() === nome.toLowerCase())) {
    alert("Essa categoria já existe.");
    return;
  }
  categorias.push(nome);
  persistirCategorias();
  campo.value = "";
  renderizarCategorias();
  renderizarSeletorCategoriaFiltro();
  popularSelectCategoriasForm();
});

function removerCategoria(categoria, qtd) {
  if (qtd > 0) {
    alert("Essa categoria tem produtos vinculados. Oculte, mova ou exclua os produtos antes de remover a categoria.");
    return;
  }
  if (!confirm(`Remover a categoria "${categoria}"?`)) return;
  categorias = categorias.filter(c => c !== categoria);
  persistirCategorias();
  renderizarCategorias();
  renderizarSeletorCategoriaFiltro();
  popularSelectCategoriasForm();
}

/* ---------- 5. FORMULÁRIO DE PRODUTO (criar / editar) ---------- */
const modalFormFundo = document.getElementById("modalFormFundo");
const formProduto = document.getElementById("formProduto");
const tituloFormProduto = document.getElementById("tituloFormProduto");

const fCategoria = document.getElementById("fCategoria");
const fNome = document.getElementById("fNome");
const fDescricao = document.getElementById("fDescricao");
const fIngredientes = document.getElementById("fIngredientes");
const fPreco = document.getElementById("fPreco");
const fPrecoAntigo = document.getElementById("fPrecoAntigo");
const fImagem = document.getElementById("fImagem");
const fImagemArquivo = document.getElementById("fImagemArquivo");
const fPreviaImagem = document.getElementById("fPreviaImagem");
const fMaisVendido = document.getElementById("fMaisVendido");
const fNovidade = document.getElementById("fNovidade");
const fPromocao = document.getElementById("fPromocao");
const fVisivel = document.getElementById("fVisivel");

function popularSelectCategoriasForm() {
  fCategoria.innerHTML = categorias.map(c => `<option value="${c}">${c}</option>`).join("");
}

document.getElementById("btnNovoProduto").addEventListener("click", () => abrirFormProduto(null));
document.getElementById("fecharFormProduto").addEventListener("click", fecharFormProduto);
document.getElementById("btnCancelarForm").addEventListener("click", fecharFormProduto);
modalFormFundo.addEventListener("click", (ev) => { if (ev.target === modalFormFundo) fecharFormProduto(); });

function abrirFormProduto(id) {
  produtoEmEdicaoId = id;
  imagemSelecionadaBase64 = null;
  popularSelectCategoriasForm();
  formProduto.reset();
  fPreviaImagem.hidden = true;
  fVisivel.checked = true;

  if (id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;
    tituloFormProduto.textContent = "Editar produto";
    fCategoria.value = produto.categoria;
    fNome.value = produto.nome;
    fDescricao.value = produto.descricao;
    fIngredientes.value = (produto.ingredientes || []).join(", ");
    fPreco.value = produto.preco;
    fPrecoAntigo.value = produto.precoAntigo || "";
    fImagem.value = produto.imagem || "";
    fMaisVendido.checked = !!produto.maisVendido;
    fNovidade.checked = !!produto.novidade;
    fPromocao.checked = !!produto.promocao;
    fVisivel.checked = produto.visivel !== false;
    if (produto.imagem) { fPreviaImagem.src = produto.imagem; fPreviaImagem.hidden = false; }
  } else {
    tituloFormProduto.textContent = "Novo produto";
  }

  modalFormFundo.classList.add("ativo");
  document.body.style.overflow = "hidden";
}

function fecharFormProduto() {
  modalFormFundo.classList.remove("ativo");
  document.body.style.overflow = "";
}

// prévia + conversão da foto enviada do computador (base64, salvo no localStorage)
fImagemArquivo.addEventListener("change", () => {
  const arquivo = fImagemArquivo.files[0];
  if (!arquivo) return;
  const leitor = new FileReader();
  leitor.onload = () => {
    imagemSelecionadaBase64 = leitor.result;
    fPreviaImagem.src = imagemSelecionadaBase64;
    fPreviaImagem.hidden = false;
    fImagem.value = ""; // a foto enviada tem prioridade sobre a URL digitada
  };
  leitor.readAsDataURL(arquivo);
});
fImagem.addEventListener("input", () => {
  if (fImagem.value) { fPreviaImagem.src = fImagem.value; fPreviaImagem.hidden = false; }
});

formProduto.addEventListener("submit", (ev) => {
  ev.preventDefault();

  const dadosProduto = {
    categoria: fCategoria.value,
    nome: fNome.value.trim(),
    descricao: fDescricao.value.trim(),
    ingredientes: fIngredientes.value.split(",").map(s => s.trim()).filter(Boolean),
    preco: parseFloat(fPreco.value),
    precoAntigo: fPrecoAntigo.value ? parseFloat(fPrecoAntigo.value) : undefined,
    imagem: imagemSelecionadaBase64 || fImagem.value.trim() || "",
    maisVendido: fMaisVendido.checked,
    novidade: fNovidade.checked,
    promocao: fPromocao.checked,
    visivel: fVisivel.checked,
  };

  if (produtoEmEdicaoId) {
    const indice = produtos.findIndex(p => p.id === produtoEmEdicaoId);
    if (indice > -1) produtos[indice] = { ...produtos[indice], ...dadosProduto };
  } else {
    dadosProduto.id = "prod-" + Date.now();
    produtos.push(dadosProduto);
  }

  persistirProdutos();
  fecharFormProduto();
  renderizarListaProdutos();
  renderizarCategorias();
});

/* ---------- 6. BACKUP: EXPORTAR / IMPORTAR / RESTAURAR ---------- */
document.getElementById("btnExportar").addEventListener("click", () => {
  const backup = {
    exportadoEm: new Date().toISOString(),
    categorias,
    produtos,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gordin-burguer-cardapio-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

const campoImportar = document.getElementById("campoImportar");
const avisoImportar = document.getElementById("avisoImportar");

campoImportar.addEventListener("change", () => {
  const arquivo = campoImportar.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = () => {
    try {
      const dados = JSON.parse(leitor.result);
      if (!Array.isArray(dados.produtos)) throw new Error("Arquivo inválido: campo 'produtos' ausente.");

      if (!confirm(`Este arquivo tem ${dados.produtos.length} produtos. Isso vai SUBSTITUIR o cardápio atual salvo neste navegador. Continuar?`)) {
        campoImportar.value = "";
        return;
      }

      produtos = dados.produtos;
      categorias = Array.isArray(dados.categorias) && dados.categorias.length ? dados.categorias : categorias;
      persistirProdutos();
      persistirCategorias();

      avisoImportar.hidden = false;
      avisoImportar.className = "admin-aviso admin-aviso--ok";
      avisoImportar.textContent = `✔ Cardápio importado com sucesso (${produtos.length} produtos).`;

      renderizarTudo();
      popularSelectCategoriasForm();
    } catch (erro) {
      avisoImportar.hidden = false;
      avisoImportar.className = "admin-aviso admin-aviso--erro";
      avisoImportar.textContent = "✕ Não foi possível importar: " + erro.message;
    } finally {
      campoImportar.value = "";
    }
  };
  leitor.readAsText(arquivo);
});

document.getElementById("btnResetar").addEventListener("click", () => {
  if (!confirm("Isso vai apagar todas as alterações salvas neste navegador e restaurar o cardápio de exemplo original. Tem certeza?")) return;
  localStorage.removeItem(CONFIG.chaveStorageProdutos);
  localStorage.removeItem(CONFIG.chaveStorageCategorias);
  produtos = carregarProdutos();
  categorias = carregarCategorias(produtos);
  renderizarTudo();
  popularSelectCategoriasForm();
});

/* ---------- 7. AUXILIARES (mesmo padrão usado no script.js) ---------- */
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function imagemReserva(categoria) {
  const emoji = (typeof EMOJI_CATEGORIA !== "undefined" && EMOJI_CATEGORIA[categoria]) || "🍽️";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#1b1b1b"/>
    <text x="50%" y="54%" font-size="60" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

/* popula o select de categorias do formulário assim que o script carrega,
   para já estar pronto quando o usuário fizer login */
popularSelectCategoriasForm();
