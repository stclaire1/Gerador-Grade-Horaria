package anacl.iftm.edu.br;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class GeradorGrade {

    static final int NUM_PERIODOS = 5;
    static final int DIAS_SEMANA = 5;
    static final int HORARIOS_POR_DIA = 4;
    static final int TAM_POPULACAO = 50;
    static final int TOTAL_PROFESSORES = 10;
    static final int TOTAL_DISCIPLINAS = 25;

    // cada disciplina tem um código: "PPDD" (PP = professor e DD = disciplina)
    static List<String> gerarCodigosDisciplinas() {
        List<String> codigos = new ArrayList<>();
        for (int i = 0; i < TOTAL_DISCIPLINAS; i++) { 
            int professor = i % TOTAL_PROFESSORES; // distribui as disciplinas entre os professores
            String codigo = String.format("%02d%02d", professor, i);
            codigos.add(codigo);
        }
        return codigos;
    }

    static List<List<String[][]>> gerarPopulacaoInicial(List<String> disciplinas) {
        List<List<String[][]>> populacao = new ArrayList<>();

        // divide as 25 disciplinas em 5 grupos (5 por periodo)
        List<List<String>> disciplinasPorPeriodo = new ArrayList<>();
        for (int i = 0; i < NUM_PERIODOS; i++) {
            disciplinasPorPeriodo.add(disciplinas.subList(i * 5, (i + 1) * 5));
        }

        for (int i = 0; i < TAM_POPULACAO; i++) {
            List<String[][]> gradeCompleta = new ArrayList<>();
            for (int periodo = 0; periodo < NUM_PERIODOS; periodo++) {
                String[][] horario = new String[DIAS_SEMANA][HORARIOS_POR_DIA];
                preencherGradeAleatoria(horario, disciplinasPorPeriodo.get(periodo));
                gradeCompleta.add(horario);
            }
            populacao.add(gradeCompleta);
        }

        return populacao;
    }

    static void preencherGradeAleatoria(String[][] horario, List<String> disciplinas) {
        Random rand = new Random();
        Map<String, Integer> cargaHoraria = new HashMap<>();
        for (String disc : disciplinas) {
            cargaHoraria.put(disc, 4); // cada disciplina ocupa 4 horários
        }

        List<int[]> slotsDisponiveis = new ArrayList<>();
        for (int dia = 0; dia < DIAS_SEMANA; dia++) {
            for (int hora = 0; hora < HORARIOS_POR_DIA; hora++) {
                slotsDisponiveis.add(new int[]{dia, hora});
            }
        }

        Collections.shuffle(slotsDisponiveis);

        while (!cargaHoraria.isEmpty()) {
            Iterator<Map.Entry<String, Integer>> it = cargaHoraria.entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry<String, Integer> entry = it.next();
                String codigo = entry.getKey();
                int restante = entry.getValue();
                for (int i = 0; i < restante; i++) {
                    if (slotsDisponiveis.isEmpty()) break;
                    int[] slot = slotsDisponiveis.remove(0);
                    horario[slot[0]][slot[1]] = codigo;
                }
                it.remove();
            }
        }
    }

    public static void main(String[] args) {
        List<String> disciplinas = gerarCodigosDisciplinas();
        List<List<String[][]>> populacao = gerarPopulacaoInicial(disciplinas);
    
        String[] diasSemana = {"Seg", "Ter", "Qua", "Qui", "Sex"};
        String[] horarios = {"1º Hor", "2º Hor", "3º Hor", "4º Hor"};
    
        for (int i = 0; i < populacao.size(); i++) {
            System.out.println("===== GRADE " + (i + 1) + " =====");
    
            List<String[][]> grade = populacao.get(i);
            for (int periodo = 0; periodo < grade.size(); periodo++) {
                System.out.println(">>> Período " + (periodo + 1) + ":");
    
                // dias da semana
                System.out.print("Horário  ");
                for (String dia : diasSemana) {
                    System.out.printf("%7s ", dia);
                }
                System.out.println();
    
                // horários e códigos
                for (int h = 0; h < HORARIOS_POR_DIA; h++) {
                    System.out.printf("%-8s", horarios[h]);
                    for (int d = 0; d < DIAS_SEMANA; d++) {
                        String codigo = grade.get(periodo)[d][h];
                        System.out.printf("%7s ", (codigo == null ? "--" : codigo));
                    }
                    System.out.println();
                }
    
                System.out.println();
            }
    
            System.out.println();
        }
    }
    
}
