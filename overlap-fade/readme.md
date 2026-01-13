# Efeito "Overlap Fade" (Painéis Sobrepostos com Fade) no Elementor

Documentação de uso do efeito de painéis sobrepostos em tela cheia, onde cada gesto de rolagem transiciona suavemente (fade) entre os painéis.

### por raio.dev

## O que este efeito faz

- Cria uma "pilha" de painéis sobrepostos que ocupam a tela inteira (`100vh`).
- Ao rolar, o painel atual desaparece (fade out) e o próximo aparece (fade in).
- O scroll da página é travado enquanto o usuário está dentro da pilha, criando uma experiência imersiva.
- Ao sair do último painel (rolando para baixo) ou do primeiro (rolando para cima), o scroll normal é restaurado.

## Pré-requisitos

- Elementor (containers ou seções).
- Um local para inserir:
  - **CSS global** (ex.: CSS adicional do tema / Custom CSS global).
  - **JS** (ex.: Elementor Pro → Custom Code em `Body End`, ou widget HTML na página).

## Como ativar (passo a passo)

### 1) Criar o container "Stack" (pilha)

Crie um **Container** que será a área do efeito:

- **Avançado → Classes CSS**: `fx-fade-stack`

Este container funcionará como o "palco" onde os painéis serão exibidos.

### 2) Marcar os painéis no Elementor

Dentro do container `fx-fade-stack`, crie os **Containers/Seções** que serão os painéis:

- **Avançado → Classes CSS**: `fx-fade-panel`

Cada elemento com `fx-fade-panel` será um painel na sequência de fade.

### 3) Inserir o CSS

Cole o **CSS do efeito** (`overlap-fade.css`) no seu ponto de CSS global (tema/Elementor).

### 4) Inserir o JavaScript

Cole o **JS do efeito** (`overlap-fade.js`) no seu ponto de injeção de JS (recomendado: **Body End**).

## Classes CSS (contrato)

### `.fx-fade-stack` (obrigatória)
Use no container pai que engloba todos os painéis.

**Efeito:** define a área de tela cheia onde os painéis serão sobrepostos e o scroll será capturado.

### `.fx-fade-panel` (obrigatória)
Use em cada container/seção dentro do stack que deve ser um painel.

**Efeito:** o painel é posicionado absolutamente, ocupando 100% do stack, e participa da sequência de fade.

### `.is-active` (automática)
Adicionada automaticamente pelo JS ao painel atualmente visível.

### `.is-prev` (automática)
Adicionada automaticamente ao painel anterior durante a transição.

## Comportamento de ativação

O efeito é ativado automaticamente quando:

1. O usuário rola a página até que o `.fx-fade-stack` atinja o topo da viewport.
2. Enquanto ativo, o scroll da página é travado e gestos de rolagem navegam entre painéis.
3. Ao passar do último painel (para baixo) ou antes do primeiro (para cima), o scroll é destravado e a página continua normalmente.

## Navegação suportada

- **Mouse/Trackpad:** scroll wheel
- **Teclado:**
  - `↓`, `PageDown`, `Espaço` → próximo painel
  - `↑`, `PageUp` → painel anterior
  - `Escape` → sair do efeito (destrava scroll)
- **Touch/Mobile:** swipe vertical

## Ajustes comuns (onde mexer)

No JS (configurações no topo do script):

- `WHEEL_LOCK_MS`
  - controla o "cooldown" entre transições.
  - diminuir = transições mais rápidas; aumentar = mais travado.
- `TOUCH_THRESHOLD_PX`
  - sensibilidade do swipe no mobile.

No CSS:

- `.fx-fade-panel { transition: opacity 650ms ease; }`
  - ajuste a duração (650ms) e a curva (ease) conforme desejado.

## Edição no Elementor

Por padrão, os painéis ficam sobrepostos, dificultando a edição. Para facilitar a edição no editor do Elementor, descomente o bloco CSS no final do arquivo `overlap-fade.css`:

```css
.elementor-editor-active .fx-fade-stack {
  display: flex;
  flex-direction: column;
  height: auto !important;
}
.elementor-editor-active .fx-fade-panel {
  position: relative !important;
  opacity: 1 !important;
}
```

**Lembre-se de comentar novamente antes de publicar!**

## Acessibilidade

- Respeita `prefers-reduced-motion`:
  - se o usuário preferir reduzir movimento, as transições são instantâneas (sem animação de fade).
- Atributos `aria-hidden` são gerenciados automaticamente para indicar qual painel está visível.

## Licença / uso
Defina aqui a licença ou condições de uso do projeto conforme sua necessidade.
