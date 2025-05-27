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

function gerarPopulacaoInicial() {
  const populacao = [];

  for (let i = 0; i < 50; i++) {
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

  return [{ grade: filho1, nota: null, indicesConflitantes: new Set() }, { grade: filho2, nota: null, indicesConflitantes: new Set() }];
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
  
  populacaoAvaliada.forEach(individuo => {
    if (!individuo.indicesConflitantes || 
        (!Array.isArray(individuo.indicesConflitantes) && !(individuo.indicesConflitantes instanceof Set))) {
      individuo.indicesConflitantes = new Set();
    } else if (!(individuo.indicesConflitantes instanceof Set)) {
      individuo.indicesConflitantes = new Set(individuo.indicesConflitantes);
    }
  });

  const app = document.getElementById("app");
  app.innerHTML = "";

  const tabela = document.createElement("table");
  tabela.style.borderCollapse = "collapse";
  tabela.style.marginBottom = "20px";

  const trPeriodo = document.createElement("tr");
  const thConflitos = document.createElement("th");
  thConflitos.rowSpan = 2;
  thConflitos.textContent = "Conflitos";
  trPeriodo.appendChild(thConflitos);

  for (let p = 0; p < 5; p++) {
    const th = document.createElement("th");
    th.colSpan = 20;
    th.textContent = `Período ${p + 1}`;
    trPeriodo.appendChild(th);
  }
  tabela.appendChild(trPeriodo);

  const trDiasHorarios = document.createElement("tr");
  for (let i = 0; i < 100; i++) {
    const dia = DIAS[Math.floor((i % 20) / 4)];
    const horario = HORARIOS[i % 4];
    const th = document.createElement("th");
    th.textContent = `${dia} H${horario}`;
    trDiasHorarios.appendChild(th);
  }
  tabela.appendChild(trDiasHorarios);

  populacaoAvaliada.forEach(({ grade, nota, indicesConflitantes }) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = -nota;
    tr.appendChild(th);

    grade.forEach((celula, i) => {
      const td = document.createElement("td");
      td.textContent = celula || "";
      if (indicesConflitantes.has(i)) {
        td.style.color = "red";
      }
      tr.appendChild(td);
    });

    tabela.appendChild(tr);
  });

  app.appendChild(tabela);
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
  let populacao = gerarPopulacaoInicial();
  let melhorIndividuo = null;
  let melhorNota = Number.NEGATIVE_INFINITY;

  for (let geracao = 0; geracao < maxGeracoes; geracao++) {
    avaliarPopulacao(populacao);
    ordenarPopulacao(populacao);

    if (populacao[0].nota > melhorNota) {
      melhorNota = populacao[0].nota;
      melhorIndividuo = JSON.parse(JSON.stringify(populacao[0]));
    }

    const novaPopulacao = [];

    // mantem o melhor indivíduo da geração atual
    novaPopulacao.push(populacao[0]);

    while (novaPopulacao.length < tamanhoPop) {
      const [pai1, pai2] = selecionarPais(populacao);
      const filhos = cruzamento(pai1, pai2);
      mutacao(filhos);
      novaPopulacao.push(...filhos);
    }

    populacao = novaPopulacao.slice(0, tamanhoPop);
  }

  return melhorIndividuo;
}

// executa o algoritmo e mostra resultado final
const melhor = algoritmoGenetico({
  gerarPopulacaoInicial: gerarPopulacaoInicial,
  avaliarPopulacao: avaliarPopulacao,
  ordenarPopulacao: ordenarPopulacao,
  selecionarPais: selecionarPais,
  cruzamento: cruzamento,
  mutacao: mutacao,
  maxGeracoes: 100,
  tamanhoPop: 50,
});

renderizarTabela([melhor]);