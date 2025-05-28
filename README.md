# 📅 Gerador de Grade Horária

A proposta desse projeto é criar um Algoritmo Genético que gera automaticamente grades horárias para cursos, usando algoritmos genéticos com cruzamento e mutação para otimizar a distribuição de disciplinas e evitar conflitos.

🔗 [Clique aqui para acessar o projeto!](https://stclaire1.github.io/Gerador-Grade-Horaria/)

## 📝 Condições

A lógica do AG foi pensada seguindo as seguintes condições:

 * 5 períodos no total;
 * O curso conta com 25 disciplinas;
 * São 10 professores no total, ministrando matérias fixas e distribuídas automaticamente;
 * 4 horários por dia, distribuídos em 5 dias da semana;
 * As disciplinas são determinadas por período, ou seja, uma matéria ministrada no 1º período não pode existir no 4º período;
 * Entende-se por conflito quando o professor é designado no mesmo dia em períodos diferentes, independente da matéria vinculada - quando isso ocorre os horários conflitantes aparecem em vermelho.

Além disso, a interface permite que o usuário informe os parâmetros que deseja para montar a grade, são eles:

 * Tamanho da população: número de grades horárias geradas em cada geração do algoritmo;
 * Máximo de gerações: quantidade de ciclos evolutivos que o algoritmo executa em busca da melhor grade;
 * Probabilidade de cruzamento: chance de dois indivíduos (grades) trocarem partes entre si para formar novos filhos;
 * Probabilidade de mutação: chance de uma grade sofrer alterações aleatórias, embaralhando horários de um mesmo período;
 * Número de cortes: quantidade de divisões no ponto de cruzamento, determinando onde as grades dos pais se alternam na formação dos filhos.

  ## 🛠️ Tecnologias utilizadas

  - HTML;
  - CSS;
  - JavaScript.
