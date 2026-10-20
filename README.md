# 🧠 NeuroBlog

Blog completo com **Next.js 16 (App Router) + Tailwind v4 + shadcn/ui + Supabase**, renderizado no servidor, com SEO técnico para buscadores tradicionais e leitores de IA.

## Stack

| Camada    | Tecnologia                                                                               |
| --------- | ---------------------------------------------------------------------------------------- |
| Framework | Next.js 16 · React 19 · Server Components · ISR/SSG                                      |
| UI        | Tailwind CSS v4 · shadcn/ui (Radix + CVA) · @tailwindcss/typography · lucide-react       |
| Editor    | TipTap 3 (WYSIWYG → Markdown GFM, colar conteúdo formatado, upload de imagens)           |
| Render MD | react-markdown 10 + remark-gfm + rehype-slug                                             |
| Backend   | Supabase: Auth (email/senha), Postgres (RLS + full-text search pt-BR), Storage (imagens) |

## Rodando em modo demo (sem Supabase)

```bash
npm install
npm run dev
```

Sem `.env.local`, todo o site funciona com 12 artigos fictícios de neurociência — ótimo para validar o layout. O painel `/admin` também abre (somente visualização; nada persiste).

## Versões

Cada commit incrementa automaticamente o patch. Para uma nova funcionalidade compatível, use `VERSION_BUMP=minor git commit`; para uma mudança incompatível, use `VERSION_BUMP=major git commit`. O incremento atualiza `package.json` e `package-lock.json` e é incluído no próprio commit.

## Configurando o Supabase (produção)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e execute todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Isso cria tabelas, RLS, a função de busca `search_articles`, o bucket `article-images` e seed de categorias/tags.
3. Em **Authentication → Users**, adicione seu usuário (confirmação de e-mail pode ser desligada em dev). **O primeiro usuário criado vira `admin` automaticamente** (trigger). Para tornar outro usuário admin:
   ```sql
   update public.profiles set role = 'admin' where id = '<uuid-do-usuario>';
   ```
4. Copie `.env.example` → `.env.local` e preencha (Project Settings → API):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` _(secreta — só server-side)_
   - `NEXT_PUBLIC_SITE_URL` (ex.: `https://blog.seudominio.com`)
5. `npm run dev` → acesse `/admin/login`.

### Deploy (Vercel)

Configure as mesmas 4 variáveis no painel da Vercel. O middleware renova a sessão Supabase automaticamente. Recomende-se habilitar "Confirm email" em produção.

## Estrutura

```
src/app/
  page.tsx                  # Home: hero + sidebar (categorias/tags) + filtros/busca + grid paginado
  artigo/[slug]/            # Artigo (markdown → HTML server-side, JSON-LD, OG, relacionados)
  categoria|tag|autor/      # Listagens filtradas
  busca/                    # Resultados de busca
  sitemap.ts robots.ts      # Descoberta para buscadores
  feed.xml/ llms.txt/       # RSS 2.0 + arquivo llms.txt para IAs
  admin/
    login/                  # Login email+senha (server action)
    page.tsx                # Dashboard: lista de artigos, status, ações
    novo/                   # Criar artigo
    artigo/[id]/editar/     # Editar artigo
    categorias/             # CRUD de categorias e tags
src/app/api/
  articles/                 # POST/PATCH/DELETE de artigos (auth + RLS)
  admin/upload/             # Upload de imagem → Supabase Storage (5 MB máx.)
  admin/taxonomies/         # CRUD categorias/tags via fetch
```

## SEO implementado

- Conteúdo 100% presente no HTML inicial (SSR/ISR) — sem depender de JS.
- Metadata API: title/description únicos por página, canonical, OpenGraph + Twitter Cards com imagem de capa.
- JSON-LD: `WebSite`, `BlogPosting` (artigo), `BreadcrumbList`, `Organization`.
- `sitemap.xml`, `robots.txt` (inclui bots de IA), RSS com `content:encoded`, `llms.txt` com sumário do site.
- HTML semântico (`article`, `nav`, `main`, `time`), headings hierárquicos com âncoras (`rehype-slug`).
- Páginas administrativas com `noindex`.

## Segurança

- **RLS**: público lê apenas artigos `published`; escrita exige `auth.uid()` dono do artigo.
- Middleware protege `/admin/*`; actions e route handlers revalidam a sessão no servidor.
- Upload validado (tipo MIME, tamanho) e gravado no bucket público somente para autenticados.
- Service role nunca exposto ao client (só usado em código `server-only` quando necessário).
