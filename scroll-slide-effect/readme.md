# Efeito “Slideshow” (100vh por scroll) no Elementor

Documentação de uso do efeito de navegação por “telas” (slides) em altura total, onde cada gesto de rolagem avança/retrocede **um** slide.

### por raio.dev

## O que este efeito faz

- Cada bloco marcado como slide ocupa a tela (`100vh`) e “encaixa” ao rolar (snap).
- A rolagem do mouse/trackpad/teclado/suporte a swipe no mobile é convertida em **transição direta** para o próximo/anterior slide.
- Não depende de adicionar classe no `body` (compatível com a limitação atual do Elementor).

## Pré-requisitos

- Elementor (containers ou seções).
- Um local para inserir:
  - **CSS global** (ex.: CSS adicional do tema / Custom CSS global).
  - **JS** (ex.: Elementor Pro → Custom Code em `Body End`, ou widget HTML na página).

> Observação: o CSS usa `:has(.fs-slide)` para ativar automaticamente o modo slideshow quando houver slides na página.

## Como ativar (passo a passo)

### 1) Marcar os slides no Elementor

Em **cada Seção/Container** que deve ser uma “tela”:

- **Avançado → Classes CSS**: `fs-slide`

Pronto: qualquer elemento com `fs-slide` passa a participar do slideshow.

### 2) Inserir o CSS

Cole o **CSS do efeito** no seu ponto de CSS global (tema/Elementor).

### 3) Inserir o JavaScript

Cole o **JS do efeito** no seu ponto de injeção de JS (recomendado: **Body End**).

## Classes CSS (contrato)

### `.fs-slide` (obrigatória)
Use em cada seção/container que deve ser um slide de tela cheia.

**Efeito:** entra na sequência 100vh → 100vh e vira um ponto de “encaixe”.

### `.fs-inner-scroll` (opcional)
Use em um elemento **dentro** de um `.fs-slide` quando você precisa que aquele bloco possa rolar normalmente (por exemplo: texto grande, lista, termos, etc.).

**Efeito:** quando o usuário rolar dentro desse bloco e ainda houver conteúdo para rolar, o slideshow **não** intercepta o scroll.

> Alternativa equivalente: usar o atributo `data-fs-inner-scroll="true"` no elemento rolável.

## Seções que NÃO usam o efeito

Sim: basta **não** adicionar `fs-slide` e aquela seção não vira “slide”.

### Importante (layout híbrido)
Para evitar transições estranhas:

- **Recomendado:** mantenha os slides `fs-slide` em um bloco contínuo (um após o outro).
- Seções “normais” (sem efeito) funcionam melhor:
  - **antes** do primeiro slide, ou
  - **depois** do último slide (ex.: rodapé).
- Se você colocar uma seção normal **entre** dois slides, o scroll tenderá a “pular” para o próximo ponto de snap (o próximo `.fs-slide`), o que pode dar a sensação de que o conteúdo foi ignorado.

## Header fixo / sticky (ajuste necessário)

Se existe um header fixo/sticky, você deve ajustar o “offset” do encaixe para o topo do slide não ficar escondido atrás do header.

No CSS, ajuste o `scroll-padding-top` (valor aproximado da altura do header em `px`).

## Ajustes comuns (onde mexer)

No JS (configurações no topo do script):

- `WHEEL_LOCK_MS`
  - controla o “cooldown” para garantir **1 slide por gesto**.
  - diminuir = mais rápido; aumentar = mais travado.
- `TOUCH_THRESHOLD_PX`
  - sensibilidade do swipe no mobile.

## Acessibilidade

- Respeita `prefers-reduced-motion`:
  - se o usuário preferir reduzir movimento, o comportamento evita suavização (sem animações de scroll).

## Licença / uso
Defina aqui a licença ou condições de uso do projeto conforme sua necessidade.