# Budzet

## Composer and Autoload

`spl_autoload_register` do PHP, nós podemos informar como ele pode carregar arquivos sempre que um símbolo (classe, função, etc) for utilizado, sem que o seu arquivo tenha sido incluído. Desta forma, não precisamos dar require (ou include) de cada um dos arquivos das nossas classes individualmente.

## Float

Em computação, existe o famoso problema dos Pontos Flutuantes. Operações aritméticas com números decimais podem ser problemáticas e cada linguagem resolve este problema de uma forma.

Para entender mais sobre o problema, você pode acessar este link: https://floating-point-gui.de/

Nele, você também consegue encontrar as principais soluções existentes em diversas linguagens (incluindo PHP).

## Desvantagens do Padrão State

O padrão State é muito útil quando algum objeto pode ter diferentes comportamentos, dependendo do seu estado, mas assim como todos os padrões de projeto, existem prós e contras em implementar o State.

- Dependendo do número de estados, um if pode ser mais simples, embora menos elegante
  - Se nós possuímos apenas dois estados (e isso não pode crescer), pode acabar valendo mais a pena adicionar um if do que criar duas classes extras.

---

Também é muito interessante o estudo mais aprofundado sobre DDD, Clean Architecture, Arquitetura Hexagonal, etc. No estudo sobre esses conceitos, você vai esbarrar no padrão de **Command Handlers**

---

## Patterns

- [Strategy](https://refactoring.guru/design-patterns/strategy)
- [Chain of Responsibility](https://refactoring.guru/design-patterns/chain-of-responsibility)
- [Template Method](https://refactoring.guru/design-patterns/template-method)
- [State](https://refactoring.guru/design-patterns/state)
- [Command](https://refactoring.guru/design-patterns/command)
- [Observer](https://refactoring.guru/design-patterns/observer)
- [Iterator](https://refactoring.guru/design-patterns/iterator)
