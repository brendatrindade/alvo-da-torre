# Torre de Peças

Aplicação web para aumentar o desafio do jogo de tirar peças da torre. Sorteia ações para o jogo de torre de peças para definir em qual nível da torre e qual a posição alvo da peça a ser retirada na próxima jogada

**Acesse online:**  [AlvoDaTorre](https://brendatrindade.github.io/AlvoDaTorre/)

## Como funciona

A cada rodada, o app sorteia um par composto por:

- Nível da torre: inferior, central ou superior
- Alvo da retirada: fundo, frente, centro (frente-fundo), centro (esquerda-direita), esquerda ou direita

O jogador deve retirar a peça sorteada. Se a torre cair, perdeu.

## Modos de sorteio

- Conjunto: sorteia nível e peça alvo em uma única ação
- Individual: sorteia nível e peça alvo separadamente para formar o par de ação

## Tecnologias

- React
- Vite
- TypeScript
- CSS

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
