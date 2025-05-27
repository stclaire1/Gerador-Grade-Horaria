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

function gerarPopulacao() {
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

    populacao.push(individuo);
  }

  return populacao;
}

function renderizarTabela(populacaoAvaliada) {
  const app = document.getElementById("app");
  const tabela = document.createElement("table");

  // períodos
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

  // horários e dias
  const trDiasHorarios = document.createElement("tr");
  for (let i = 0; i < 100; i++) {
    const dia = DIAS[Math.floor((i % 20) / 4)];
    const horario = HORARIOS[i % 4];
    const th = document.createElement("th");
    th.textContent = `${dia} H${horario}`;
    trDiasHorarios.appendChild(th);
  }
  tabela.appendChild(trDiasHorarios);

  // dados da população (50 possíveis grades atualmente)
  populacaoAvaliada.forEach(({ grade, conflitos, indicesConflitantes }) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = conflitos;
    tr.appendChild(th);

    grade.forEach((celula, i) => {
      const td = document.createElement("td");
      td.textContent = celula || "";
      if (indicesConflitantes.has(i)) {
        td.style.color = "red"; // destaca o conflito
      }
      tr.appendChild(td);
    });

    tabela.appendChild(tr);
  });

  app.appendChild(tabela);
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
            // Marca todos os índices conflitantes
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

function selecao(populacaoAvaliada) {
  const pai1 = populacaoAvaliada[Math.floor(Math.random() * (populacaoAvaliada.length / 2))];
  const pai2 = populacaoAvaliada[Math.floor(Math.random() * populacaoAvaliada.length)];

  const app = document.getElementById("app");

  const containerPais = document.createElement("div");
  containerPais.innerHTML = "<h2>Pais Selecionados</h2>";
  containerPais.style.marginTop = "30px";

  [pai1, pai2].forEach((pai, index) => {
    const titulo = document.createElement("h3");
    titulo.textContent = `Pai ${index + 1} - Conflitos: ${pai.conflitos}`;
    containerPais.appendChild(titulo);

    const tabela = document.createElement("table");
    const tr = document.createElement("tr");

    pai.grade.forEach((celula, i) => {
      const td = document.createElement("td");
      td.textContent = celula || "";
      if (pai.indicesConflitantes.has(i)) {
        td.style.color = "red";
      }
      tr.appendChild(td);
    });

    tabela.appendChild(tr);
    containerPais.appendChild(tabela);
  });

  app.appendChild(containerPais);
}

function cruzamento(pai1, pai2, cortes = 2, pc = 1.0) {
  const tamanho = 100;
  const filho1 = Array(tamanho).fill(null);
  const filho2 = Array(tamanho).fill(null);

  if (Math.random() < pc) {
    // Gerar pontos de corte únicos entre 1 e 4
    const pontosCorte = new Set();
    while (pontosCorte.size < cortes) {
      pontosCorte.add(Math.floor(Math.random() * 4) + 1); // 1 a 4
    }

    const cortesOrdenados = Array.from(pontosCorte).sort((a, b) => a - b);
    cortesOrdenados.push(5); // Adiciona o final da grade como último limite

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
    // Sem cruzamento, os filhos são cópias dos pais
    for (let i = 0; i < tamanho; i++) {
      filho1[i] = pai1.grade[i];
      filho2[i] = pai2.grade[i];
    }
  }

  return [filho1, filho2];
}

function mostrarFilhos(filhos) {
  const app = document.getElementById("app");
  const containerFilhos = document.createElement("div");
  containerFilhos.innerHTML = "<h2>Filhos Gerados</h2>";
  containerFilhos.style.marginTop = "30px";

  filhos.forEach(({ grade, conflitos, indicesConflitantes }, index) => {
    const titulo = document.createElement("h3");
    titulo.textContent = `Filho ${index + 1} - Conflitos: ${conflitos}`;
    containerFilhos.appendChild(titulo);

    const tabela = document.createElement("table");
    const tr = document.createElement("tr");

    grade.forEach((celula, i) => {
      const td = document.createElement("td");
      td.textContent = celula || "";
      if (indicesConflitantes.has(i)) {
        td.style.color = "red";
      }
      tr.appendChild(td);
    });

    tabela.appendChild(tr);
    containerFilhos.appendChild(tabela);
  });

  app.appendChild(containerFilhos);
}

const populacao = gerarPopulacao();

// avalia cada grade, anexa a quantidade de conflitos e os índices conflitantes
const populacaoAvaliada = populacao.map(grade => {
  const { conflitos, indicesConflitantes } = contarConflitos(grade);
  return { grade, conflitos, indicesConflitantes };
});

populacaoAvaliada.sort((a, b) => a.conflitos - b.conflitos);

renderizarTabela(populacaoAvaliada);
selecao(populacaoAvaliada);

const [pai1, pai2] = [
  populacaoAvaliada[0], // melhor indivíduo
  populacaoAvaliada[1], // segundo melhor (ou aleatório)
];

const [filho1, filho2] = cruzamento(pai1, pai2);

// Avalia os filhos
const avaliados = [filho1, filho2].map(grade => {
  const { conflitos, indicesConflitantes } = contarConflitos(grade);
  return { grade, conflitos, indicesConflitantes };
});

const filhosAvaliados = [filho1, filho2].map(grade => {
  const { conflitos, indicesConflitantes } = contarConflitos(grade);
  return { grade, conflitos, indicesConflitantes };
});
mostrarFilhos(filhosAvaliados);