# ⛪ Paróquia Bom Pastor — Aplicativo Comunitário (PWA)

Aplicação web progressiva (PWA) desenvolvida para aproximar os fiéis e apoiar a gestão pastoral da **Paróquia Bom Pastor**. O aplicativo reúne palavra diária, agenda de celebrações, acompanhamento de presença e reflexões, canais oficiais, pré-cadastro na catequese, contribuição via Pix e um painel administrativo exclusivo para a coordenação.

🔗 **Aplicação no ar:** [https://app-bom-pastor.vercel.app/](https://app-bom-pastor.vercel.app/)

---

## ✨ Funcionalidades

### Para os Fiéis
* **Palavra do Dia (Rotação Automática):** Carrossel de versículos bíblicos que alterna automaticamente o versículo principal todos os dias com base na data local do dispositivo, combinando registros do banco de dados com uma lista padrão de 20 versículos.
* **Avisos Paroquiais:** Exibição de comunicados ativos na tela inicial.
* **Presença e Diário de Reflexões:** Check-in diário de participação nas celebrações com campo para registrar reflexões pessoais após a missa.
* **Caminhada Espiritual:** Calendário mensal visual com os dias de presença marcados, estatísticas semanais/mensais e histórico das últimas reflexões escritas.
* **Agenda de Celebrações:** Consulta rápida dos dias da semana, horários, observações e celebrantes/pastores responsáveis.
* **Canais Oficiais e Catequese:** Acesso direto ao Canal do WhatsApp, Instagram e Facebook da paróquia, além de formulário de pré-cadastro para turmas de catequese (Eucaristia Infantil, Perseverança, Crisma e Adultos).
* **Dízimos e Ofertas:** Exibição dos dados da paróquia com botão de cópia rápida da chave Pix.
* **Instalação via QR Code:** Tela dedicada com QR Code e instruções para instalar o app na tela inicial no Android (Chrome) e iPhone (Safari).

### Para a Coordenação 
* **Gestão Completa da Agenda:** Adicionar novas celebrações, editar dias, horários, celebrantes/pastores e observações, ou remover horários diretamente pelo aplicativo.
* **Gestão da Catequese:** Visualização dos pré-cadastros realizados, busca por nome/responsável/WhatsApp, filtro por etapa e exportação da lista completa em formato `.csv` (compatível com Excel).

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React + Vite
* **Estilização e Ícones:** Tailwind CSS + Lucide React
* **Backend e Banco de Dados:** Supabase (Auth + PostgreSQL com Row Level Security)
* **Hospedagem e Deploy Contínuo:** Vercel

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

O projeto utiliza as seguintes tabelas no schema `public`:

| Tabela | Finalidade |
| :--- | :--- |
| `versiculos` | Armazena versículos personalizados cadastrados pela paróquia. |
| `agenda_igreja` | Guarda `dia_semana`, `horario`, `celebrante`, `observacao` e `ordem`. |
| `avisos_paroquia` | Comunicados exibidos no topo da aba **Hoje** (`ativo = true`). |
| `presencas` | Registra `user_id`, `data_presenca` e `reflexao` de cada fiel. |
| `inscricoes_catequese` | Armazena os dados de pré-cadastro enviados na aba **Paróquia**. |

> **Segurança (RLS):** A tabela `agenda_igreja` permite leitura (`SELECT`) pública/autenticada e restringe operações de escrita (`INSERT`, `UPDATE`, `DELETE`) ao e-mail institucional da coordenação (`coordenacaobp@gmail.com`).

---

## 🚀 Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone <url-do-seu-repositorio>
   cd "APP B P"
