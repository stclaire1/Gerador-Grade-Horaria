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

function renderizarTabela(populacao) {
    const app = document.getElementById("app");
    const tabela = document.createElement("table");

    // períodos
    const trPeriodo = document.createElement("tr");
    const thVazio1 = document.createElement("th");
    thVazio1.rowSpan = 2;
    thVazio1.textContent = "#";
    trPeriodo.appendChild(thVazio1);

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
    populacao.forEach((individuo, index) => {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.textContent = index + 1;
        tr.appendChild(th);

        individuo.forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell || "";
            tr.appendChild(td);
        });

        tabela.appendChild(tr);
    });

    app.appendChild(tabela);
}

const populacao = gerarPopulacao();
renderizarTabela(populacao);