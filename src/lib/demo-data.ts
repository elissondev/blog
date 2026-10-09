import type { ArticleCard, Category, Tag } from "./types";

const cover = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

export const demoArticles: ArticleCard[] = [
  {
    id: "d1", title: "Como o sono profundo consolida a memória", slug: "sono-profundo-consolida-memoria",
    excerpt: "Durante o sono de ondas lentas, o hipocampo 'repassa' as experiências do dia e as transfere para o córtex, transformando memórias frágeis em conhecimento estável. Entenda o mecanismo e como protegê-lo.",
    cover_image_url: cover("photo-1541786598840-1d35cb9b9b40"), published_at: "2026-09-28T12:00:00Z",
    reading_minutes: 7, author_name: "Dra. Helena Ruiz", category_name: "Sono", category_slug: "sono",
    tags: [{ name: "Memória", slug: "memoria" }, { name: "Cérebro", slug: "cerebro" }], total_count: 12,
  },
  {
    id: "d2", title: "Ansiedade: o que acontece no seu cérebro em modo de alerta",
    slug: "ansiedade-cerebro-modo-alerta",
    excerpt: "A amígdala dispara, o córtex pré-frontal perde espaço e o corpo se prepara para uma ameaça que muitas vezes não existe. Veja por que isso ocorre — e o que a neurociência sugere para reequilibrar o sistema.",
    cover_image_url: cover("photo-1508672019048-805c876b67e2"), published_at: "2026-09-24T12:00:00Z",
    reading_minutes: 9, author_name: "Dr. Paulo Mendes", category_name: "Saúde Mental", category_slug: "saude-mental",
    tags: [{ name: "Ansiedade", slug: "ansiedade" }, { name: "Cérebro", slug: "cerebro" }], total_count: 12,
  },
  {
    id: "d3", title: "Foco profundo: 5 protocolos validados para trabalho cognitivo",
    slug: "foco-profundo-protocolos",
    excerpt: "Bloco de 90 minutos, pausas com exposição à luz natural, regras de notificação e treino de atenção sustentada. Um guia prático baseado em estudos de atenção executiva.",
    cover_image_url: cover("photo-1499209974431-9dddcece7f88"), published_at: "2026-09-20T12:00:00Z",
    reading_minutes: 6, author_name: "Dra. Helena Ruiz", category_name: "Produtividade", category_slug: "produtividade",
    tags: [{ name: "Foco", slug: "foco" }, { name: "Hábitos", slug: "habitos" }], total_count: 12,
  },
  {
    id: "d4", title: "Neuroplasticidade depois dos 40: mitos e evidências",
    slug: "neuroplasticidade-depois-dos-40",
    excerpt: "O cérebro adulto continua formando conexões — mas exige condições específicas. O que a literatura recente diz sobre aprendizado, exercício e recuperação funcional.",
    cover_image_url: cover("photo-1559757148-5c35020d8179"), published_at: "2026-09-15T12:00:00Z",
    reading_minutes: 11, author_name: "Dr. Rafael Costa", category_name: "Neurociência", category_slug: "neurociencia",
    tags: [{ name: "Cérebro", slug: "cerebro" }, { name: "Memória", slug: "memoria" }], total_count: 12,
  },
  {
    id: "d5", title: "Meditação mindfulness: o que muda após 8 semanas",
    slug: "meditacao-mindfulness-8-semanas",
    excerpt: "Redução de volume da amígdala, espessamento do córtex pré-frontal e melhora mensurável em regulação emocional. Os achados do protocolo MBSR explicados sem misticismo.",
    cover_image_url: cover("photo-1506126613408-eca07ce68773"), published_at: "2026-09-10T12:00:00Z",
    reading_minutes: 8, author_name: "Dra. Helena Ruiz", category_name: "Saúde Mental", category_slug: "saude-mental",
    tags: [{ name: "Meditação", slug: "meditacao" }, { name: "Ansiedade", slug: "ansiedade" }], total_count: 12,
  },
  {
    id: "d6", title: "Cafeína e atenção: a curva de dose certa",
    slug: "cafeina-atencao-curva-de-dose",
    excerpt: "Pequenas doses fracionadas superam o grande café da manhã para manutenção de vigilância. Metabolismo da adenosina, tolerância e o limite do 'não ajuda mais'.",
    cover_image_url: cover("photo-1509042239860-f550ce710b93"), published_at: "2026-09-05T12:00:00Z",
    reading_minutes: 5, author_name: "Dr. Rafael Costa", category_name: "Neurociência", category_slug: "neurociencia",
    tags: [{ name: "Foco", slug: "foco" }, { name: "Hábitos", slug: "habitos" }], total_count: 12,
  },
  {
    id: "d7", title: "Exercício físico é o melhor nootrópico que existe",
    slug: "exercicio-fisico-nootropico",
    excerpt: "EFs aumentam BDNF, flux sanguíneo hipocampal e volume de matéria cinzenta. Comparando efeito de caminhada, corrida e força sobre funções cognitivas.",
    cover_image_url: cover("photo-1552674605-db6ffd4facb5"), published_at: "2026-08-30T12:00:00Z",
    reading_minutes: 7, author_name: "Dr. Paulo Mendes", category_name: "Neurociência", category_slug: "neurociencia",
    tags: [{ name: "Cérebro", slug: "cerebro" }, { name: "Hábitos", slug: "habitos" }], total_count: 12,
  },
  {
    id: "d8", title: "Rituais de desaceleração: preparando o cérebro para dormir",
    slug: "rituais-desaceleracao-dormir",
    excerpt: "Luz, temperatura e previsibilidade. Como criar um protocolo noturno que reduz a latência do sono e melhora a arquitetura das fases REM e NREM.",
    cover_image_url: cover("photo-1515894203474-5cd1334d0d02"), published_at: "2026-08-25T12:00:00Z",
    reading_minutes: 6, author_name: "Dra. Helena Ruiz", category_name: "Sono", category_slug: "sono",
    tags: [{ name: "Hábitos", slug: "habitos" }, { name: "Meditação", slug: "meditacao" }], total_count: 12,
  },
  {
    id: "d9", title: "Burnout visto pela neurociência: sinais que antecedem o colapso",
    slug: "burnout-neurociencia-sinais",
    excerpt: "Alterações em saliência de recompensa, fadiga decisional e hiperativação do eixo HPA antes do diagnóstico clínico. Marcadores comportamentais para agir cedo.",
    cover_image_url: cover("photo-1497032628192-86f99bcd76bc"), published_at: "2026-08-18T12:00:00Z",
    reading_minutes: 10, author_name: "Dr. Paulo Mendes", category_name: "Saúde Mental", category_slug: "saude-mental",
    tags: [{ name: "Ansiedade", slug: "ansiedade" }, { name: "Foco", slug: "foco" }], total_count: 12,
  },
  {
    id: "d10", title: "Estudo espaçado: por que revisar é melhor que reler",
    slug: "estudo-espacado-revisar",
    excerpt: "A curva do esquecimento de Ebbinghaus segue valendo. Repetição espaçada e prática de recuperação são as duas intervenções com maior efeito comprovado na aprendizagem.",
    cover_image_url: cover("photo-1456513080510-7bf3a84b8f2b"), published_at: "2026-08-12T12:00:00Z",
    reading_minutes: 6, author_name: "Dr. Rafael Costa", category_name: "Produtividade", category_slug: "produtividade",
    tags: [{ name: "Memória", slug: "memoria" }, { name: "Hábitos", slug: "habitos" }], total_count: 12,
  },
  {
    id: "d11", title: "O custo cognitivo de multitarefas",
    slug: "custo-cognitivo-multitarefas",
    excerpt: "Trocar de tarefa não divide a atenção: sequencia. Cada alternância deixa um resíduo e cobra tempo de recobramento. Evidências e estratégias de monotarefa.",
    cover_image_url: cover("photo-1517694712202-14dd9538aa97"), published_at: "2026-08-05T12:00:00Z",
    reading_minutes: 5, author_name: "Dra. Helena Ruiz", category_name: "Produtividade", category_slug: "produtividade",
    tags: [{ name: "Foco", slug: "foco" }, { name: "Cérebro", slug: "cerebro" }], total_count: 12,
  },
  {
    id: "d12", title: "Gut-brain axis: como o intestino conversa com o humor",
    slug: "gut-brain-axis-intestino-humor",
    excerpt: "Eixo intestino-cérebro, serotonina periférica e papel da microbiota. O que já está provado em humanos e o que ainda é promessa de pesquisa.",
    cover_image_url: cover("photo-1576308028515-35176ced0c2b"), published_at: "2026-07-28T12:00:00Z",
    reading_minutes: 9, author_name: "Dr. Rafael Costa", category_name: "Neurociência", category_slug: "neurociencia",
    tags: [{ name: "Cérebro", slug: "cerebro" }, { name: "Ansiedade", slug: "ansiedade" }], total_count: 12,
  },
];

export const demoCategories: Category[] = [
  { id: "c1", name: "Neurociência", slug: "neurociencia", description: "Estudos sobre o cérebro e o sistema nervoso" },
  { id: "c2", name: "Saúde Mental", slug: "saude-mental", description: "Bem-estar, terapia e equilíbrio emocional" },
  { id: "c3", name: "Produtividade", slug: "produtividade", description: "Métodos e hábitos para render mais" },
  { id: "c4", name: "Sono", slug: "sono", description: "Ciência e higiene do sono" },
];

export const demoTags: Tag[] = [
  { id: "t1", name: "Cérebro", slug: "cerebro" },
  { id: "t2", name: "Ansiedade", slug: "ansiedade" },
  { id: "t3", name: "Foco", slug: "foco" },
  { id: "t4", name: "Hábitos", slug: "habitos" },
  { id: "t5", name: "Meditação", slug: "meditacao" },
  { id: "t6", name: "Memória", slug: "memoria" },
];

export const demoArticleMd = `## Por que o sono profundo é tão importante?

Enquanto dormimos, o cérebro não desliga — ele **muda de atividade**. O sono de ondas lentas (NREM fase 3) é quando ocorre a chamada *consolidação sináptica*: o hipocampo reproduz, em alta velocidade, os padrões neurais vividos durante o dia e os transfere para o córtex.

![Neurônios em atividade](https://images.unsplash.com/photo-1559757148-5c35020d8179?auto=format&fit=crop&w=1200&q=70)

### As três fases que importam para a memória

1. **Vigília** — codificação: o hipocampo grava experiências como memórias de curto prazo.
2. **Sono profundo (NREM)** — transferência: replay hipocampal envia essas memórias ao córtex.
3. **REM** — integração: conexões emocionais e associativas são reorganizadas.

> Privação de uma única noite reduz em ~40% a capacidade de formar novas memórias, segundo estudo clássico de Walker (2007).

### O que prejudica o sono profundo

| Fator | Efeito |
|---|---|
| Álcool à noite | Suprime REM, fragmenta NREM |
| Luz azul tardia | Atrasa melatonina, encurta janela de ondas lentas |
| Cafeína após 14h | Meia-vida de 5-6h bloqueia adenosina |
| Quarto quente (>21°C) | Dificulta a queda de temperatura central |

### Protocolo prático

\`\`\`text
- Horário fixo para deitar e levantar (±30 min)
- Última cafeína: 8-10h antes de dormir
- Tela fora do quarto; alarme de luz ao acordar
- Exercício regular (não nas 3h pré-sono)
\`\`\`

---

**Conclusão:** dormir não é pausa no desempenho — é parte dele. Quem protege o sono profundo protege a memória, o humor e a capacidade de aprender amanhã.`;
