const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const HORARIOS = [1, 2, 3, 4];
const DISCIPLINAS = [];
const TOTAL_DISCIPLINAS = 25;
const TOTAL_PROFESSORES = 10;

// criação das 25 disciplinas
for (let i = 0; i < TOTAL_DISCIPLINAS; i++) {
  const periodo = Math.floor(i / 5);
  const professor = i % TOTAL_PROFESSORES;
  DISCIPLINAS.push({
    nome: `D${i.toString().padStart(2, '0')}`,
    professor: `P${professor.toString().padStart(2, '0')}`,
    periodo: periodo,
  });
}

function embaralhar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function gerarPopulacaoInicial(tamanhoPop) {
  const populacao = [];

  for (let i = 0; i < tamanhoPop; i++) {
    const individuo = Array(100).fill(null);

    for (let p = 0; p < 5; p++) {
      const disciplinasPeriodo = DISCIPLINAS.filter(d => d.periodo === p);
      const embaralhadas = embaralhar(disciplinasPeriodo);

      embaralhadas.forEach(disc => {
        const horariosLivres = [];

        for (let j = 0; j < 20; j++) {
          const idx = p * 20 + j;
          if (!individuo[idx]) horariosLivres.push(idx);
        }

        const slots = embaralhar(horariosLivres).slice(0, 4);
        slots.forEach(slot => {
          individuo[slot] = `${disc.nome} ${disc.professor}`;
        });
      });
    }

    populacao.push({ grade: individuo, nota: null, indicesConflitantes: new Set() });
  }

  return populacao;
}

function contarConflitos(grade) {
  let conflitos = 0;
  const indicesConflitantes = new Set();

  for (let dia = 0; dia < 5; dia++) {
    for (let h = 0; h < 4; h++) {
      const professores = new Map();

      for (let periodo = 0; periodo < 5; periodo++) {
        const idx = periodo * 20 + dia * 4 + h;
        const celula = grade[idx];

        if (celula) {
          const professor = celula.split(" ")[1];
          if (professores.has(professor)) {
            conflitos++;
            indicesConflitantes.add(idx);
            indicesConflitantes.add(professores.get(professor));
          } else {
            professores.set(professor, idx);
          }
        }
      }
    }
  }

  return { conflitos, indicesConflitantes };
}

function avaliarPopulacao(populacao) {
  populacao.forEach(individuo => {
    const { conflitos, indicesConflitantes } = contarConflitos(individuo.grade);
    individuo.nota = -conflitos; // menos conflitos = nota maior
    individuo.indicesConflitantes = indicesConflitantes;
  });
}

function ordenarPopulacao(populacao) {
  populacao.sort((a, b) => b.nota - a.nota);
}

function selecionarPais(populacao) {
  const melhorMetade = populacao.slice(0, Math.floor(populacao.length / 2));
  const pai1 = melhorMetade[Math.floor(Math.random() * melhorMetade.length)];
  const pai2 = populacao[Math.floor(Math.random() * populacao.length)];
  return [pai1, pai2];
}

function cruzamento(pai1, pai2, cortes = 2, pc = 1.0) {
  const tamanho = 100;
  const filho1 = Array(tamanho).fill(null);
  const filho2 = Array(tamanho).fill(null);

  if (Math.random() < pc) {
    const pontosCorte = new Set();
    while (pontosCorte.size < cortes) {
      pontosCorte.add(Math.floor(Math.random() * 4) + 1);
    }

    const cortesOrdenados = Array.from(pontosCorte).sort((a, b) => a - b);
    cortesOrdenados.push(5);

    let cruza = false;
    let inicio = 0;

    for (let corte of cortesOrdenados) {
      const fim = corte * 20;

      for (let i = inicio; i < fim; i++) {
        if (cruza) {
          filho1[i] = pai2.grade[i];
          filho2[i] = pai1.grade[i];
        } else {
          filho1[i] = pai1.grade[i];
          filho2[i] = pai2.grade[i];
        }
      }

      cruza = !cruza;
      inicio = fim;
    }
  } else {
    for (let i = 0; i < tamanho; i++) {
      filho1[i] = pai1.grade[i];
      filho2[i] = pai2.grade[i];
    }
  }

  return [
    { grade: filho1, nota: null, indicesConflitantes: new Set() },
    { grade: filho2, nota: null, indicesConflitantes: new Set() }
  ];
}

function mutacao(filhos, pm = 0.1) {
  filhos.forEach(filho => {
    if (Math.random() < pm) {
      for (let periodo = 0; periodo < 5; periodo++) {
        const base = periodo * 20;

        const embaralharInicio = Math.random() < 0.5;
        const offset = embaralharInicio ? 0 : 10;

        const inicio = base + offset;
        const fim = inicio + 10;

        const trecho = filho.grade.slice(inicio, fim);
        const embaralhado = embaralhar(trecho);

        for (let i = 0; i < 10; i++) {
          filho.grade[inicio + i] = embaralhado[i];
        }
      }
    }
  });
}

function renderizarTabela(populacaoAvaliada) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  populacaoAvaliada.forEach(({ grade, indicesConflitantes }) => {
    const container = document.createElement("div");
    container.style.marginBottom = "30px";

    for (let p = 0; p < 5; p++) {
      const tabela = document.createElement("table");
      tabela.style.borderCollapse = "collapse";
      tabela.style.marginBottom = "30px";
      tabela.style.width = "100%";

      // período
      const trTitulo = document.createElement("tr");
      const thTitulo = document.createElement("th");
      thTitulo.colSpan = 6;
      thTitulo.textContent = `Período ${p + 1}`;
      thTitulo.style.textAlign = "center";
      thTitulo.style.backgroundColor = "#BBD8F1";
      thTitulo.style.padding = "8px";
      trTitulo.appendChild(thTitulo);
      tabela.appendChild(trTitulo);

      // dias da semana
      const trCabecalho = document.createElement("tr");
      const thHorario = document.createElement("th");
      thHorario.textContent = "";
      thHorario.style.border = "1px solid #ccc";
      thHorario.style.padding = "6px";
      trCabecalho.appendChild(thHorario);

      const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
      dias.forEach(dia => {
        const th = document.createElement("th");
        th.textContent = dia;
        th.style.border = "1px solid #ccc";
        th.style.padding = "6px";
        trCabecalho.appendChild(th);
      });
      tabela.appendChild(trCabecalho);

      // horários
      for (let h = 0; h < 4; h++) {
        const trHorario = document.createElement("tr");

        const th = document.createElement("th");
        th.textContent = `Horário ${h + 1}`;
        th.style.border = "1px solid #ccc";
        th.style.padding = "6px";
        trHorario.appendChild(th);

        for (let d = 0; d < 5; d++) {
          const td = document.createElement("td");
          td.style.border = "1px solid #ccc";
          td.style.padding = "6px";
          td.style.verticalAlign = "top";
          td.style.textAlign = "left";
          td.style.fontSize = "0.9em";

          const pos = p * 20 + d * 4 + h;
          const celulas = Array.isArray(grade[pos]) ? grade[pos] : [grade[pos]].filter(Boolean);

          celulas.forEach((celula, i) => {
            const div = document.createElement("div");
            div.textContent = celula;

            if (indicesConflitantes.has(pos)) {
              div.style.color = "red";
              div.style.fontWeight = "bold";
            }

            td.appendChild(div);
          });

          trHorario.appendChild(td);
        }

        tabela.appendChild(trHorario);
      }

      container.appendChild(tabela);
    }

    app.appendChild(container);
  });
}

function validarCampos() {
  const campos = document.querySelectorAll("aside input");
  const errorMsg = document.getElementById("errorMsg");

  let todosPreenchidos = true;

  campos.forEach(input => {
    if (input.value.trim() === "") {
      todosPreenchidos = false;
    }
  });

  if (!todosPreenchidos) {
    errorMsg.textContent = "Por favor, preencha todos os campos para gerar uma grade horária.";
    return false;
  } else {
    errorMsg.textContent = ""; // limpa a mensagem de erro
    return true;
  }
}

function algoritmoGenetico({
  gerarPopulacaoInicial,
  avaliarPopulacao,
  ordenarPopulacao,
  selecionarPais,
  cruzamento,
  mutacao,
  maxGeracoes = 100,
  tamanhoPop = 50,
}) {
  let populacao = gerarPopulacaoInicial(tamanhoPop);
  let melhorIndividuo = null;
  let melhorNota = Number.NEGATIVE_INFINITY;

  for (let geracao = 0; geracao < maxGeracoes; geracao++) {
    avaliarPopulacao(populacao);
    ordenarPopulacao(populacao);

    if (populacao[0].nota > melhorNota) {
      melhorNota = populacao[0].nota;
      melhorIndividuo = populacao[0];
    }

    const novaPopulacao = populacao.slice(0, Math.floor(tamanhoPop / 2));

    while (novaPopulacao.length < tamanhoPop) {
      const [pai1, pai2] = selecionarPais(populacao);

      const filhos = cruzamento(pai1, pai2);
      mutacao(filhos);
      novaPopulacao.push(...filhos.slice(0, tamanhoPop - novaPopulacao.length));
    }

    populacao = novaPopulacao;
  }

  return melhorIndividuo;
}

function executarAlgoritmoGenetico(tamanhoPop, maxGeracoes, probCruzamento, probMutacao, numCortes) {
  const melhor = algoritmoGenetico({
    gerarPopulacaoInicial,
    avaliarPopulacao,
    ordenarPopulacao,
    selecionarPais,
    cruzamento: (pai1, pai2) => cruzamento(pai1, pai2, numCortes, probCruzamento),
    mutacao: (filhos) => mutacao(filhos, probMutacao),
    maxGeracoes,
    tamanhoPop,
  });

  renderizarTabela([melhor]);
}

function limparTudo() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const aside = document.querySelector("aside");
  const inputs = aside.querySelectorAll("input");
  inputs.forEach(input => {
    input.value = "";
  });
}

document.getElementById('gerarHorario').addEventListener('click', () => {
  if (!validarCampos()) return;

  const tamanhoPop = parseInt(document.getElementById('tamanhoPop').value);
  const maxGeracoes = parseInt(document.getElementById('maxGeracoes').value);
  const probCruzamento = parseFloat(document.getElementById('probCruzamento').value);
  const probMutacao = parseFloat(document.getElementById('probMutacao').value);
  let numCortes = parseInt(document.getElementById('numCortes').value);

  if (numCortes < 1) numCortes = 1;
  if (numCortes > 4) numCortes = 4;

  executarAlgoritmoGenetico(tamanhoPop, maxGeracoes, probCruzamento, probMutacao, numCortes);
});

document.getElementById('limparTudo').addEventListener('click', () => {
  limparTudo();
});
