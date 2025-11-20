import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner" // Importe o toast para notificações
import { useUsuarioStore } from "./context/UsuarioContext"

type Personagem = {
 id: number
 nome: string
 idade: number
 nivel: number
 experiencia: number
 descricao?: string
 caracteristicas?: string
 foto: string
}

// Tipo usado no carrossel — aceita tanto Personagem quanto o card especial (que não possui idade/nivel/experiencia)
type CarouselItem = Personagem | { id: number; nome: string; foto: string }

export default function CarouselPersonagem() {
  const [personagens, setPersonagens] = useState<Personagem[]>([])
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const { usuario } = useUsuarioStore()

  // Função para buscar os personagens
  const fetchPersonagens = () => {
    if (!usuario?.id) return

    fetch(`${import.meta.env.VITE_API_URL}/personagens?usuarioId=${usuario.id}`)
      .then((res) => res.json())
      .then((data) => setPersonagens(data))
      .catch((err) => console.error("Erro ao buscar personagens:", err))
  }

  useEffect(() => {
    fetchPersonagens()
  }, [])

  const items: CarouselItem[] = [
    ...personagens,
    { id: 0, nome: "Criar Novo Personagem", foto: "" },
  ]

  // módulo-safe para índice circular
  const mod = (n: number, m: number) => ((n % m) + m) % m

  const prev = () => {
    setIndex((prev) => mod(prev - 1, items.length))
  }

  const next = () => {
    setIndex((prev) => mod(prev + 1, items.length))
  }

  const current: CarouselItem = items[index]
  const left: CarouselItem | null = items.length > 1 ? items[mod(index - 1, items.length)] : null
  const right: CarouselItem | null = items.length > 1 ? items[mod(index + 1, items.length)] : null

  const handleClick = (personagem: CarouselItem | null) => {
    if (!personagem) return
    if (personagem.id === 0) {
      navigate("/cadPersonagem")
    } else {
      navigate(`/personagens/${personagem.id}`)
    }
  }
 
  // NOVA FUNÇÃO: Deleta o personagem
  const handleDelete = async (personagem: CarouselItem) => {
    if (personagem.id === 0) return // Não deleta o card de "Criar Novo"

 // 1. Confirmação
    const confirmacao = window.confirm(
       `Você deseja deletar o personagem "${personagem.nome}"? Esta ação não pode ser desfeita.`
    )

      if (confirmacao) {
       try {
         const response = await fetch(
         import.meta.env.VITE_API_URL + `/personagens/${personagem.id}`,
          {
         method: "DELETE",
          }
       )

       if (!response.ok) {
          throw new Error("Erro ao deletar personagem")
        }

       // 2. Sucesso: Atualiza a lista e o índice
        toast.success(`Personagem "${personagem.nome}" deletado com sucesso.`)
        setPersonagens((prev) => prev.filter((p) => p.id !== personagem.id))
        fetchPersonagens()
        setIndex(0) // Volta para o primeiro item após a exclusão

    } catch (error) {
        console.error("Erro ao deletar personagem:", error)
        toast.error("Falha ao deletar o personagem. Tente novamente.")
      }
    }
 }

  // renderiza o card: aceita CarouselItem | null
  const renderCard = (personagem: CarouselItem | null, tamanho: "small" | "large") => {
  const sizeClass = tamanho === "large" ? "w-40 h-60" : "w-32 h-48"

   if (!personagem) {
    return <div className={`flex items-center justify-center bg-black border-2 border-yellow-300 rounded-md ${sizeClass}`} />
 }

   const isPlus = personagem.id === 0

    return (
      <div
        onClick={() => handleClick(personagem)}
        className={`flex items-center justify-center bg-black border-2 border-yellow-300 rounded-md cursor-pointer hover:scale-105 transition ${sizeClass}`}
      >
        {isPlus ? (
          <img src="../mais.png" alt="Novo" className="max-w-[60%] max-h-[60%]" />
        ) : (
         <img
            src={(personagem as Personagem).foto}
            alt={personagem.nome}
            className="w-full h-full object-cover"
         />
       )}
      </div>
    )
  }

  return (
 <div className="flex flex-col items-center justify-center text-center min-h-screen bg-black">
    <h2 className="text-white text-lg font-bold mb-4">SELECIONE O PERSONAGEM</h2>

<div className="relative flex items-center">
<button onClick={prev} className="absolute left-[-3rem] p-2 rounded-full bg-white/20 hover:bg-white/40">
       <ChevronLeft className="w-6 h-6 text-white" />
 </button>

 <div className="flex items-end justify-center gap-6">
 {renderCard(left, "small")}
 {renderCard(current, "large")}
 {renderCard(right, "small")}
</div>

 <button onClick={next} className="absolute right-[-3rem] p-2 rounded-full bg-white/20 hover:bg-white/40">
<ChevronRight className="w-6 h-6 text-white" />
 </button>
</div>

<div className="text-white mt-4 bg-neutral-900 w-full py-6 rounded">{(current && current.nome) || ""}</div>

      {/*  Botão de Deletar para o personagem */}
      {current.id !== 0 && (
          <button
              onClick={() => handleDelete(current)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
              DELETAR
          </button>
      )}
 </div>
 )
}