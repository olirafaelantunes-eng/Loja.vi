/* =========================================================
   ✏️  ÁREA DE EDIÇÃO DA LOJA  (para a dona da loja)
   =========================================================
   Você NÃO precisa saber programar.
   Basta seguir os exemplos abaixo e salvar o arquivo.

   1) CHAVE PIX E WHATSAPP
      - pixKey ......... sua chave Pix (e-mail, CPF, telefone ou chave aleatória)
      - whatsappNumber . número com DDI+DDD, só números. Ex: 5531999887766

   2) ADICIONAR / ALTERAR ROUPAS
      - Cada peça é um bloco entre { e },
      - id ........ número único (1, 2, 3, 4...)
      - name ...... nome da peça
      - cat ....... categoria (Vestidos, Conjuntos, Macacões...)
      - price ..... preço com ponto (ex: 389.90)
      - color ..... cor de fundo se ainda NÃO tiver foto (opcional)
      - image ..... link da foto (recomendado). Exemplo:
                    "https://i.imgur.com/xxxxx.jpg"
                    ou link público do Google Drive / Instagram / etc.

   COMO COLOCAR FOTO:
   a) Tire a foto da peça
   b) Envie para o Imgur (imgur.com), Google Drive (deixe público)
      ou qualquer site que gere link direto da imagem
   c) Copie o link que termina em .jpg / .png / .webp
   d) Cole dentro de image: "COLE_O_LINK_AQUI"

   PARA ADICIONAR NOVA PEÇA:
   - Copie o último bloco { ... },
   - Cole no final (antes do ] )
   - Mude o id para o próximo número
   - Altere nome, preço, categoria e o link da foto

   A BUSCA E OS FILTROS DE CATEGORIA SÃO AUTOMÁTICOS:
   não precisa configurar nada — eles leem direto do PRODUCTS abaixo.
   ========================================================= */

const CONFIG = {
  pixKey: "128.043.736-73",   // ex: 123e4567-e89b-12d3-a456-426614174000
  pixReceiverName: "VIVIANI CREPALDI",            // até 25 caracteres, sem acento
  pixCity: "IPATINGA",                            // até 15 caracteres, sem acento
  whatsappNumber: "5500000000000",                // DDI+DDD+numero, só dígitos. Ex: 5531999998888
  storeName: "Viviani Crepaldi"
};

// ========== CATÁLOGO DE PEÇAS ==========
// Edite aqui. Pode ter quantas peças quiser.
const PRODUCTS = [
  {
    id: 1,
    name: "Vestido Longo Alfaiataria Verde Oliva",
    cat: "Vestidos",
    price: 389.90,
    color: "#7C8B5D",
    image: "img/vestido-verde.jfif"   // cole o link da foto aqui, ex: "https://i.imgur.com/abc123.jpg"
  },
  {
    id: 2,
    name: "Conjunto Cropped + Saia Rendada Off-White",
    cat: "Conjuntos",
    price: 459.90,
    color: "#E8E1D3",
    image: "img/vestido-branco.jfif"
  },
  {
    id: 3,
    name: "Macacão Alfaiataria Vinho",
    cat: "Macacões",
    price: 349.90,
    color: "#6E2A2A",
    image: "img/macacao-vinho.jfif"
  },
  {
    id: 4,
    name: "Vestido Longo Bordado Vermelho",
    cat: "Vestidos",
    price: 429.90,
    color: "#B4472E",
    image: "img/vestido-vermelho.jfif"
  },
  {
    id: 5,
    name: "Conjunto Linho Terracota",
    cat: "Conjuntos",
    price: 379.90,
    color: "#B5734A",
    image: "img/vestido-terracota.jfif"
  },
  {
    id: 6,
    name: "Vestido Tricoline Floral Marfim",
    cat: "Vestidos",
    price: 399.90,
    color: "#D8CBAE",
    image: "img/vestido-marfim.jfif"
  }
  // Para adicionar mais: copie um bloco acima, cole aqui e mude o id, nome, preço e image
];

/* ========================= app ========================= */
let cart = {}; // { productId: qty }
let searchTerm = '';
let activeCategory = 'Todas';

function money(v){
  return v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
}

/* ---------- busca ---------- */
// Remove acentos para a busca funcionar mesmo se o cliente digitar sem acento
// (ex: "vestido" encontra "Vestido" e "vermelho" encontra "Vermelho")
function normalize(s){
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}

function getFilteredProducts(){
  const term = normalize(searchTerm);
  return PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'Todas' || p.cat === activeCategory;
    const matchesSearch = term === '' ||
      normalize(p.name).includes(term) ||
      normalize(p.cat).includes(term);
    return matchesCategory && matchesSearch;
  });
}

function renderCategoryChips(){
  const wrap = document.getElementById('categoryChips');
  const cats = ['Todas', ...new Set(PRODUCTS.map(p => p.cat))];
  wrap.innerHTML = cats.map(cat => `
    <button class="chip ${cat === activeCategory ? 'active' : ''}" onclick="setCategory('${cat.replace(/'/g,"\\'")}')">${cat}</button>
  `).join('');
}

function setCategory(cat){
  activeCategory = cat;
  // só troca a classe "active" (sem recriar os botões) para o preenchimento animar
  document.querySelectorAll('#categoryChips .chip').forEach(btn=>{
    btn.classList.toggle('active', btn.textContent.trim() === cat);
  });
  renderProducts();
}

function handleSearchInput(value){
  searchTerm = value;
  document.getElementById('searchClear').classList.toggle('show', searchTerm.length > 0);
  renderProducts();
}

function clearSearch(){
  searchTerm = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').classList.remove('show');
  renderProducts();
}

/* ---------- catálogo ---------- */
function renderProducts(){
  const grid = document.getElementById('productGrid');
  const list = getFilteredProducts();

  if(list.length === 0){
    grid.innerHTML = `<div class="no-results">Nenhuma peça encontrada para essa busca.<br>Tente outro termo ou limpe o filtro.</div>`;
    document.getElementById('itemCountLabel').textContent = '0 peças';
    return;
  }

  grid.innerHTML = list.map(p => {
    const hasImg = p.image && String(p.image).trim().length > 5;
    const textColor = isLight(p.color || '#CCCCCC') ? '#211D18' : '#F6F1E7';
    const bg = p.color || '#E8E1D3';
    const imgHtml = hasImg
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'; this.parentNode.querySelector('.placeholder-text').style.display='block';">`
      : '';
    const placeholderStyle = hasImg ? 'display:none;' : '';
    return `
    <div class="card">
      <div class="card-img" style="background:${bg}; color:${textColor}">
        ${imgHtml}
        <span class="placeholder-text" style="${placeholderStyle}">${p.name}</span>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.cat}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-price">${money(p.price)}</div>
        <div class="card-actions">
          <div class="qty-box">
            <button onclick="stepQty(${p.id},-1)">–</button>
            <span id="qty-${p.id}">1</span>
            <button onclick="stepQty(${p.id},1)">+</button>
          </div>
          <button class="add-btn" id="add-${p.id}" onclick="addToCart(${p.id})">Adicionar</button>
        </div>
      </div>
    </div>`;
  }).join('');
  document.getElementById('itemCountLabel').textContent = list.length + ' peça' + (list.length === 1 ? '' : 's');
}

function isLight(hex){
  const c = hex.replace('#','');
  const r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
  return (0.299*r + 0.587*g + 0.114*b) > 170;
}

const tempQty = {};
function stepQty(id, delta){
  tempQty[id] = Math.max(1, (tempQty[id]||1) + delta);
  document.getElementById('qty-'+id).textContent = tempQty[id];
}

function addToCart(id){
  const qty = tempQty[id] || 1;
  cart[id] = (cart[id]||0) + qty;
  const btn = document.getElementById('add-'+id);
  btn.textContent = 'Adicionado ✓';
  btn.classList.add('added');
  setTimeout(()=>{ btn.textContent='Adicionar'; btn.classList.remove('added'); }, 1200);
  tempQty[id] = 1;
  document.getElementById('qty-'+id).textContent = 1;
  updateCartUI();
  const p = PRODUCTS.find(x=>x.id==id);
  showToast(`${qty > 1 ? qty + '× ' : ''}${p.name} foi para a sacola ✦`);
}

function removeFromCart(id){
  delete cart[id];
  updateCartUI();
  showToast('Peça removida da sacola');
}

/* ---------- aviso rápido (toast) ---------- */
let toastEl, toastTimer;
function showToast(message){
  if(!toastEl){
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  // força o navegador a reiniciar a animação quando chegam avisos seguidos
  toastEl.classList.remove('show');
  void toastEl.offsetWidth;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toastEl.classList.remove('show'), 2400);
}

function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = PRODUCTS.find(x=>x.id==id);
    return sum + p.price*qty;
  },0);
}

function updateCartUI(){
  const items = Object.entries(cart);
  const count = items.reduce((s,[,q])=>s+q,0);
  const countEl = document.getElementById('cartCount');
  const previousCount = Number(countEl.textContent) || 0;
  countEl.textContent = count;
  if(count > previousCount){
    // o contador "pula" quando entra uma peça nova
    countEl.classList.remove('bump');
    void countEl.offsetWidth;
    countEl.classList.add('bump');
  }

  const wrap = document.getElementById('cartItems');
  if(items.length===0){
    wrap.innerHTML = `<div class="empty-cart">Sua sacola está vazia.<br>Adicione peças do catálogo para continuar.</div>`;
  } else {
    wrap.innerHTML = items.map(([id,qty])=>{
      const p = PRODUCTS.find(x=>x.id==id);
      const hasImg = p.image && String(p.image).trim().length > 5;
      const swatchInner = hasImg
        ? `<img src="${p.image}" alt="" style="width:100%;height:100%;object-fit:cover;">`
        : p.name.split(' ').slice(0,2).join(' ');
      return `
      <div class="cart-item">
        <div class="ci-swatch" style="background:${p.color || '#E8E1D3'}; color:${isLight(p.color || '#CCCCCC')?'#211D18':'#F6F1E7'}; overflow:hidden;">${swatchInner}</div>
        <div class="ci-info">
          <div class="ci-name">${p.name}</div>
          <div class="ci-meta">${qty} × ${money(p.price)}</div>
          <div class="ci-row">
            <strong>${money(p.price*qty)}</strong>
            <span class="ci-remove" onclick="removeFromCart(${id})">remover</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }
  document.getElementById('cartTotal').textContent = money(cartTotal());
  document.getElementById('checkoutBtn').disabled = items.length===0;
}

function openCart(){
  if(toastEl) toastEl.classList.remove('show'); // o aviso some quando a sacola abre
  document.getElementById('overlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
}
function closeCart(){
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
}

function openCheckout(){
  if(Object.keys(cart).length===0) return;
  document.getElementById('stepForm').style.display='block';
  document.getElementById('stepPix').style.display='none';
  document.getElementById('checkoutModal').classList.add('open');
}
function closeCheckout(){
  document.getElementById('checkoutModal').classList.remove('open');
}

/* ---------- geração do Pix (BR Code / EMV) ---------- */
function emvField(id, value){
  const len = String(value.length).padStart(2,'0');
  return id + len + value;
}
function crc16(payload){
  let crc = 0xFFFF;
  for(let i=0;i<payload.length;i++){
    crc ^= (payload.charCodeAt(i) << 8);
    for(let j=0;j<8;j++){
      crc = (crc & 0x8000) ? ((crc<<1) ^ 0x1021) : (crc<<1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4,'0');
}
function stripAccents(s){
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
// Deixa a chave no formato que o Pix exige: CPF/CNPJ/telefone só com números.
// E-mail e chave aleatória (UUID) ficam como estão.
function normalizePixKey(key){
  const k = String(key).trim();
  if(k.includes('@')) return k;
  if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)) return k;
  const digits = k.replace(/[^\d]/g,'');
  return k.startsWith('+') ? '+' + digits : digits;
}
// Mesmo gerador do antigo produtos.js (valor dinâmico + identificador genérico ***),
// usando os dados da Viviani Crepaldi definidos em CONFIG.
function gerarPayloadPix(valorTotal){
  const chave  = normalizePixKey(CONFIG.pixKey);
  const nome   = stripAccents(CONFIG.pixReceiverName).toUpperCase().slice(0,25);
  const cidade = stripAccents(CONFIG.pixCity).toUpperCase().slice(0,15);
  const valor  = valorTotal.toFixed(2); // ex: "23.98"

  const merchantAccount = `0014br.gov.bcb.pix01${String(chave.length).padStart(2,'0')}${chave}`;

  const payload =
    '000201' +                                                   // Payload Format Indicator
    `26${String(merchantAccount.length).padStart(2,'0')}${merchantAccount}` +
    '52040000' +                                                 // Categoria
    '5303986' +                                                  // Moeda BRL
    `54${String(valor.length).padStart(2,'0')}${valor}` +        // Valor dinâmico
    '5802BR' +                                                   // País
    `59${String(nome.length).padStart(2,'0')}${nome}` +
    `60${String(cidade.length).padStart(2,'0')}${cidade}` +
    '62070503***' +                                              // Identificador genérico
    '6304';                                                      // Abre o campo do CRC

  return payload + crc16(payload);
}

let currentPixCode = '';
function generatePix(){
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  if(!name){ alert('Informe seu nome para continuar.'); return; }
  window.__custName = name;
  window.__custPhone = phone;

  const total = cartTotal();
  currentPixCode = gerarPayloadPix(total);

  document.getElementById('pixAmountDisplay').textContent = money(total);
  document.getElementById('pixCodeText').textContent = currentPixCode;

  document.getElementById('qrcode').innerHTML = '';
  new QRCode(document.getElementById('qrcode'), {
    text: currentPixCode, width:200, height:200,
    colorDark:'#211D18', colorLight:'#F6F1E7'
  });

  document.getElementById('stepForm').style.display='none';
  document.getElementById('stepPix').style.display='block';
}

let copiadoTimer;
async function copyPix(){
  const btn = document.getElementById('copyBtn');
  let ok = false;

  try {
    if(navigator.clipboard && window.isSecureContext){
      // jeito moderno (só funciona em HTTPS ou localhost)
      await navigator.clipboard.writeText(currentPixCode);
      ok = true;
    } else {
      // plano B para HTTP comum (ex: testar no celular pelo IP do computador)
      const ta = document.createElement('textarea');
      ta.value = currentPixCode;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, currentPixCode.length);
      ok = document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch(e){
    ok = false;
  }

  btn.textContent = ok ? 'Código copiado ✓' : 'Segure no código para copiar';
  clearTimeout(copiadoTimer);
  copiadoTimer = setTimeout(()=>{ btn.textContent = 'Copiar código Pix'; }, 2500);
}

// Esc fecha a sacola e o modal de pagamento
document.addEventListener('keydown', e=>{
  if(e.key === 'Escape'){
    closeCart();
    closeCheckout();
  }
});

function buildOrderItems(){
  return Object.entries(cart).map(([id,qty])=>{
    const p = PRODUCTS.find(x=>x.id==id);
    return `- ${qty}x ${p.name} (${money(p.price)} cada)`;
  }).join('%0A');
}

function sendWhatsApp(){
  const items = buildOrderItems();
  const total = money(cartTotal());
  const name = window.__custName || '';
  const phone = window.__custPhone || '';

  const msg =
    `Olá! Sou ${name}, acabei de pagar meu pedido na *${CONFIG.storeName}* via Pix.%0A%0A` +
    `*Itens:*%0A${items}%0A%0A` +
    `*Total: ${total}*%0A` +
    (phone ? `Meu contato: ${phone}%0A` : '') +
    `Segue o comprovante:`;

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
  window.open(url, '_blank');
}

function requestInstallments(){
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  if(!name){ alert('Informe seu nome para continuar.'); return; }
  window.__custName = name;
  window.__custPhone = phone;

  const items = buildOrderItems();
  const total = money(cartTotal());

  const msg =
    `Olá! Sou ${name}, quero *parcelar* meu pedido na *${CONFIG.storeName}*.%0A%0A` +
    `*Itens:*%0A${items}%0A%0A` +
    `*Total: ${total}*%0A` +
    (phone ? `Meu contato: ${phone}%0A` : '') +
    `%0APode me passar as opções de parcelamento?`;

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
  window.open(url, '_blank');
}

function setupSocialLinks(){
  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('Olá! Vim pelo site e queria saber mais sobre as peças da '+CONFIG.storeName+' 💛')}`;
  document.getElementById('waFloat').href = waUrl;
  document.getElementById('waSocialLink').href = waUrl;
}

/* ---------- vida e movimento ---------- */
// Blocos aparecem suavemente quando entram na tela
function setupReveal(){
  const targets = document.querySelectorAll('.catalog-head, .search-bar, .category-chips, .social-band, footer');
  if(!('IntersectionObserver' in window)){ return; }
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.12});
  targets.forEach(el=>{
    el.classList.add('reveal');
    observer.observe(el);
  });
}

renderCategoryChips();
renderProducts();
updateCartUI();
setupSocialLinks();
setupReveal();