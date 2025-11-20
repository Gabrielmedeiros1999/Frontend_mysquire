import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useUsuarioStore } from "./context/UsuarioContext"


export default function CadastroPersonagem() {
  const navigate = useNavigate()
  const { usuario } = useUsuarioStore()
  const [form, setForm] = useState({
    nome: "",
    idade: "",
    raca: "",
    background: "",
    caracteristicas: "",
    afinidade:"",
    ranque: "",
    experiencia: "",
    altura: "",
    foto: "",
    profissao: "", 
    bonusProfissao: "", 
    movimento: "",
    usuarioId: usuario?.id,
  })
  
  if (!usuario?.id) {
    toast.error("Usuário não autenticado. Faça login novamente.")
    return
  }

  const usuarioId = usuario.id;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [fotoSelecionada, setFotoSelecionada] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const fotoParaSalvar = fotoSelecionada || form.foto

    // 1. Dados para criação do Personagem (sem profissão/bônus)
    const personagemData = {
        nome: form.nome,
        idade: Number(form.idade),
        raca: form.raca || null,
        background: form.background || "",
        caracteristicas: form.caracteristicas || "",
        afinidade: form.afinidade,
        ranque: Number(form.ranque),
        experiencia: Number(form.experiencia),
        altura: Number(form.altura),
        movimento: Number(form.movimento),
        foto: fotoParaSalvar,
        usuarioId: usuarioId,
    };

    // PRIMEIRA CHAMADA: CRIA O PERSONAGEM
    const personagemResponse = await fetch("http://localhost:3000/personagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personagemData),
    })

    if (!personagemResponse.ok) {
      toast.error("Erro ao cadastrar Personagem. Verifique os dados básicos.")
      return
    }

    // 2. Extrai o ID do Personagem recém-criado
    const newPersonagem = await personagemResponse.json()
    const personagemId = newPersonagem.id
    
    // 3. Divide a profissão em várias (caso o usuário digite "Ladino, Mago")
const profissoesSeparadas = form.profissao
  .split(",")
  .map((p) => p.trim())
  .filter((p) => p !== "");

// 4. Cria cada profissão separadamente
let erroAoSalvarProfissao = false;

for (const nome of profissoesSeparadas) {
  const profissaoData = {
    nome,
    bonus: form.bonusProfissao,
    personagemId,
  };

  const profissaoResponse = await fetch("http://localhost:3000/profissoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profissaoData),
  });

  if (!profissaoResponse.ok) {
    erroAoSalvarProfissao = true;
  }
}

// 5. Mensagem de sucesso ou erro
if (erroAoSalvarProfissao) {
  toast.error("Personagem criado, mas houve erro ao salvar uma das profissões.");
} else {
  toast.success("Personagem e profissões cadastrados com sucesso!");
  navigate("/carouselPersonagem");
}

  }

  const nomesImagens = [
    "paladino.png",
    "arqueiro.png",
    "mago.png",
    "ladina.png",
    "guerreiro.png",
    "sacerdotisa.png",
  ]
  
  const imagens = nomesImagens.map((nome) => `/personagens/${nome}`)

  return (
    // Componente principal: Fundo preto e centralização
    <div className="min-h-screen bg-black flex items-center justify-center py-12">
      
      {/* Container do Formulário */}
      <div className="max-w-lg w-full p-8 bg-zinc-700 rounded-xl shadow-2xl">
        
        {/* Título e Botão de Fechar */}
        <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
          <h1 className="text-2xl font-bold text-white">Criação de Personagem</h1>
          <button className="text-gray-400 hover:text-white text-3xl font-light" onClick={() => navigate('/carouselPersonagem')}>
             &times;
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Linha Nome e Idade: Grid de 2 Colunas */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Campo Nome */}
            <div>
              <p className="text-white text-sm mb-1">Nome</p>
              <input type="text" placeholder="Digite nome do personagem" value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
              />
            </div>

            <div>
              <p className="text-white text-sm mb-1">Raça</p>
              <input type="text" placeholder="Digite raça do personagem" value={form.raca}
                onChange={e => setForm({ ...form, raca: e.target.value })}
                className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
              />
            </div>


            {/* Campo Idade */}
            <div>
              <p className="text-white text-sm mb-1">Idade</p>
              <input type="number" placeholder="Ex: 25" value={form.idade}
                onChange={e => setForm({ ...form, idade: e.target.value })}
                min="0"
                className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
              />
            </div>
        {/* Campo Altura */}
<div>
              <p className="text-white text-sm mb-1">Altura</p>
              <input type="text" placeholder="Ex: 1.80" value={form.altura}
                onChange={e => setForm({ ...form, altura: e.target.value })}
                className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
              />
            </div>
          </div>

          {/* Linha Experiência e Nível: Grid de 2 Colunas */}
          <div className="grid grid-cols-2 gap-4">
            
            <div>
              <p className="text-white text-sm mb-1">Experiência</p>
              <input type="number" placeholder="Ex: 300" value={form.experiencia}
                onChange={e => setForm({ ...form, experiencia: e.target.value })}
                min="0"
                className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
              />
            </div>

            {/* Campo Nível */}
            <div>
              <p className="text-white text-sm mb-1">Ranque</p>
              <input type="number" placeholder="Ex: 16" value={form.ranque}
                onChange={e => setForm({ ...form, ranque: e.target.value })}
                min="0"
                className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
  {/* Campo Profissão */}
  <div>
    <p className="text-white text-sm mb-1">Profissão</p>
    <input type="text" placeholder="Ex: Guerreiro, Mago, Bardo" value={form.profissao}
      onChange={e => setForm({ ...form, profissao: e.target.value })}
      className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
      required 
    />
  </div>
   {/* Campo movimento */}
  <div>
    <p className="text-white text-sm mb-1">Movimento</p>
    <input type="text" placeholder="Ex: 6" value={form.movimento}
      onChange={e => setForm({ ...form, movimento: e.target.value })}
      className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
      required 
    />
  </div>
</div>

{/* Campo Bônus Profissão (Select/Enum) */}
  <div>
    <p className="text-white text-sm mb-1">Bônus Profissão</p>
    <select
      id="bonusProfissao"
      className="w-full p-2.5 bg-white border border-gray-600 rounded-lg text-black"
      required
      value={form.bonusProfissao}
      onChange={(e) => setForm({ ...form, bonusProfissao: e.target.value })}
    >
      <option value="">Selecione um Bônus</option>
      {/* Opções baseadas no seu Enum Bonus do schema.prisma */}
      <option value="Constituicao">Constituição</option>
      <option value="Curiosidade">Curiosidade</option>
      <option value="Destreza">Destreza</option>
      <option value="Forca">Força</option>
      <option value="Mistico">Místico</option>
      <option value="Percepcao">Percepção</option>
      <option value="Presenca">Presença</option>
      <option value="Razao">Razão</option>
      <option value="Sorte">Sorte</option>
      <option value="Vontade">Vontade</option>
      <option value="Adestramento">Adestramento</option>
      <option value="Armas_a_distancia">Armas à Distância</option>
      <option value="Armas_brancas">Armas Brancas</option>
      <option value="Artes_marciais">Artes Marciais</option>
      <option value="Atuacao">Atuação</option>
      <option value="Furtividade">Furtividade</option>
      <option value="Historia">História</option>
      <option value="Iniciativa">Iniciativa</option>
      <option value="Leitura">Leitura</option>
      <option value="Medicina">Medicina</option>
      <option value="Mitologia">Mitologia</option>
      <option value="Negociacao">Negociação</option>
      <option value="Persuasao">Persuasão</option>
      <option value="Psicologia">Psicologia</option>
      <option value="Teologia">Teologia</option>
    </select>
  </div>
          {/* Linha afinidade */}
          <div>
          <div>
  <p className="text-white text-sm mb-1">Afinidade Mística</p>
  <select
    id="afinidade"
    className="w-full p-2.5 bg-white border border-gray-600 rounded-lg text-black"
    required
    value={form.afinidade}
    onChange={(e) => setForm({ ...form, afinidade: e.target.value })}
  >
    <option value="">Selecione</option>
    <option value="Restricao">Restrição</option>
    <option value="Parcialidade">Parcialidade</option>
    <option value="Totalidade">Totalidade</option>
  </select>
</div>
          </div>

          {/* Linha Descrição e Características: Grid de 2 Colunas (Textarea) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Campo Descrição */}
            <div>
              <p className="text-white text-sm mb-1">Background (Opcional)</p>
              <textarea placeholder="Campo opcional para digitar uma descrição sobre seu personagem" value={form.background}
                onChange={e => setForm({ ...form, background: e.target.value })}
                className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500 h-24 resize-none" // Adicionado h-24 para altura
              />
            </div>

            {/* Campo Características */}
            <div>
              <p className="text-white text-sm mb-1">Características (Opcional)</p>
              <textarea placeholder="Fobias, medos e manias do personagem, se houver" value={form.caracteristicas} // Corrigido para form.caracteristicas
                onChange={e => setForm({ ...form, caracteristicas: e.target.value })}
                className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500 h-24 resize-none" // Adicionado h-24 para altura
              />
            </div>
          </div>

          {/* Linha Foto URL: Largura Total */}
          <div>
            <p className="text-white text-sm mb-1">Foto URL (Opcional)</p>
            <input type="text" placeholder="Campo se usuário quiser colocar foto personalizada" value={fotoSelecionada}
              onChange={e => setFotoSelecionada(e.target.value)}
              className="w-full p-2.5 bg-white rounded-lg text-black placeholder-gray-500"
            />
          </div>

          {/* Botões */}
          <button type="button" onClick={() => setIsDrawerOpen(true)} className="w-full bg-blue-900 text-amber-200 py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
            Escolha de Fotos para personagem 
          </button>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Concluir Criação
          </button>
        </form>
      </div>

      {/* Drawer (Seletor de Imagens) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-700 w-120 mx-auto max-h-[90vh] p-4 shadow-xl overflow-y-auto">
            <div className="flex justify-center items-center mb-4">
             <h2 className="text-white font-semibold text-lg ps-30">
                Selecione uma foto
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex text-gray-400 hover:text-white text-xl right-80 ps-32"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {imagens.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Personagem ${i}`}
                  className={`w-full rounded-lg cursor-pointer border-2 transition h-full ${
                    form.foto === url
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-500"
                  }`}
                  onClick={() => {
                    setForm({ ...form, foto: url })
                    setFotoSelecionada("")
                    setIsDrawerOpen(false)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}