import type { Locale } from "@/lib/locales";

type ArticleCopy = {
  allArticles: string;
  reading: string;
  language: string;
  by: string;
  aboutAuthor: string;
  authorDescription: string;
  authorArticles: string;
  donationTitle: string;
  donationDescription: string;
  donationAction: string;
  donationMessage: string;
  healthNoticeTitle: string;
  healthNotice: string;
};

const articleCopy = {
  en: {
    allArticles: "All articles",
    reading: "min read",
    language: "Available languages",
    by: "By",
    aboutAuthor: "About the author",
    authorDescription: "Explore more articles by {name}.",
    authorArticles: "View articles by this author",
    donationTitle: "Support this work",
    donationDescription:
      "This blog is maintained entirely independently, without industry sponsorships or media narratives. If you found this content useful and would like to support the search for objective information, consider making a donation. Producing in-depth articles tested in practice takes dozens of hours of research and investigation. Your contribution helps keep this site online and lets me spend more time bringing the truth to light.",
    donationAction: "Ask about donating",
    donationMessage:
      "Hi Élisson, I would like to support your site with a donation.",
    healthNoticeTitle: "Health information:",
    healthNotice:
      "This article is for informational and educational purposes. It does not replace an individual assessment, diagnosis, or advice from a qualified health professional. Consult a qualified professional for decisions about your health.",
  },
  es: {
    allArticles: "Todos los artículos",
    reading: "min de lectura",
    language: "Idiomas disponibles",
    by: "Por",
    aboutAuthor: "Sobre el autor",
    authorDescription: "Lee otros artículos publicados por {name}.",
    authorArticles: "Ver artículos de este autor",
    donationTitle: "Apoya este trabajo",
    donationDescription:
      "Este blog se mantiene de forma totalmente independiente, sin patrocinios de la industria ni narrativas de los medios. Si este contenido te resultó útil y quieres apoyar la búsqueda de información objetiva, considera hacer una donación. Elaborar artículos detallados y probados en la práctica requiere decenas de horas de investigación y análisis. Tu contribución ayuda a mantener este sitio en línea y me permite dedicar más tiempo a sacar la verdad a la luz.",
    donationAction: "Consultar sobre una donación",
    donationMessage:
      "Hola Élisson, me gustaría apoyar tu sitio con una donación.",
    healthNoticeTitle: "Aviso de salud:",
    healthNotice:
      "Este artículo tiene fines informativos y educativos. No sustituye la evaluación, el diagnóstico ni la orientación individual de un profesional de la salud. Para tomar decisiones sobre su salud, consulte a un profesional cualificado.",
  },
} satisfies Record<Locale, ArticleCopy>;

export function getArticleCopy(locale: Locale) {
  return articleCopy[locale];
}
