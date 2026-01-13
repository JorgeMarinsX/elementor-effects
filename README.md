# Elementor Effects

Coleção de efeitos em CSS/JS puro para uso no Elementor.

## Efeitos Disponíveis

### `scroll-slide-effect/`

**Efeito de Slideshow com Scroll Snap**

Transforma seções do Elementor em slides de tela cheia (100vh) com navegação por scroll. Cada gesto de rolagem (mouse, trackpad, teclado ou swipe no mobile) avança ou retrocede exatamente um slide, criando uma experiência de apresentação fluida.

**Funcionalidades:**
- Navegação slide-a-slide com scroll snap nativo do CSS
- Suporte a mouse, teclado (setas, Page Up/Down, Home/End) e touch/swipe
- Permite áreas com scroll interno dentro dos slides
- Respeita preferências de acessibilidade (reduced motion)
- Ativação automática via classe CSS `.fs-slide`

### `overlap-fade/`

**Efeito de Painéis Sobrepostos com Fade**

Cria uma pilha de painéis em tela cheia (100vh) que transitam com efeito de fade ao rolar. O scroll da página é capturado enquanto o usuário navega pelos painéis, proporcionando uma experiência imersiva de apresentação.

**Funcionalidades:**
- Painéis sobrepostos com transição suave de opacidade (fade in/out)
- Scroll travado durante a navegação entre painéis
- Saída automática ao passar do primeiro/último painel
- Suporte a mouse, teclado (setas, Page Up/Down, Espaço, Escape) e touch/swipe
- Respeita preferências de acessibilidade (reduced motion)
- Ativação automática via classes CSS `.fx-fade-stack` e `.fx-fade-panel`
