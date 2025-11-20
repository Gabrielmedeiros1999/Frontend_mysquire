import { useEffect, useState } from "react"
import {  useParams  } from "react-router-dom"
import { FaPlus, FaTimes, FaExclamationCircle, FaEdit } from 'react-icons/fa'
import MenuLateral from './components/menu_lateral' 
import { useUsuarioStore } from "./context/UsuarioContext"

type Atributos = {
    id?: number
    forca: number
    destreza: number
    constituicao: number
    mistico: number
    vontade: number
    presenca: number
    curiosidade: number
    razao: number
    percepcao: number
    sorte: number 
}

type Status = {
    id?: number 
    vida: number
    mana: number
    sanidade: number
    armadura: number
    estoicismo: number
    afinco: number
}

type Pericias = {
    id?: number
    adestramento: number
    ranged: number
    melee: number
    desarmado: number
    atuacao: number
    furtividade: number
    historia: number
    iniciativa: number
    leitura: number
    medicina: number
    mitologia: number
    negociacao: number
    persuasao: number
    psicologia: number
    teologia: number
}

type Profissao = {
    id: number
    nome: string
    bonus: string
}

type Especial = {
    id: number
    nome: string
    descricao: string
}

export type Personagem = {
    id: number
    nome: string
    idade: number
    raca: string
    ranque: number
    experiencia: number
    altura: string 
    afinidade: string
    caracteristicas?: string
    background?: string
    foto: string
    movimento: string
    atributos?: Atributos
    status?: Status
    pericias?: Pericias
    profissoes?: Profissao[]
    especiais?: Especial[] 
}

const listaMapeadaPericias: { label: string, key: keyof Omit<Pericias, 'id'> }[] = [
    { label: "ADESTRAMENTO", key: "adestramento" },
    { label: "ARMAS À DISTÂNCIA", key: "ranged" },
    { label: "ARMAS BRANCAS", key: "melee" },
    { label: "ARTES MARCIAIS", key: "desarmado" },
    { label: "ATUAÇÃO", key: "atuacao" },
    { label: "FURTIVIDADE", key: "furtividade" },
    { label: "HISTÓRIA", key: "historia" },
    { label: "INICIATIVA", key: "iniciativa" },
    { label: "LEITURA", key: "leitura" },
    { label: "MEDICINA", key: "medicina" },
    { label: "MITOLOGIA", key: "mitologia" },
    { label: "NEGOCIAÇÃO", key: "negociacao" },
    { label: "PERSUASÃO", key: "persuasao" },
    { label: "PSICOLOGIA", key: "psicologia" },
    { label: "TEOLOGIA", key: "teologia" },
];

// VALORES DE FALLBACK 

const fallbackPericias: Pericias = {
    adestramento: 0, ranged: 0, melee: 0, desarmado: 0, atuacao: 0, furtividade: 0, 
    historia: 0, iniciativa: 0, leitura: 0, medicina: 0, mitologia: 0, negociacao: 0, 
    persuasao: 0, psicologia: 0, teologia: 0,
}

const fallbackAtributos: Atributos = {
    forca: 0, destreza: 0, constituicao: 0, mistico: 0, vontade: 0, 
    presenca: 0, curiosidade: 0, razao: 0, percepcao: 0, sorte: 0,
}

const fallbackStatus: Status = {
    vida: 0, mana: 0, sanidade: 0, armadura: 0, estoicismo: 0, afinco: 0,
}

// Função de busca 
const fetchPersonagem = async (id: string | undefined, setPersonagem: React.Dispatch<React.SetStateAction<Personagem | null>>) => {
    if (!id) return;
    try {
        const res = await fetch(`http://localhost:3000/personagens/${id}`);
        if (!res.ok) throw new Error("Erro na requisição da ficha.");
        const data = await res.json();
        
        const normalizar = (array: any[] | undefined) => array && array.length > 0 ? array[0] : null;

        setPersonagem({
            ...data,
            atributos: normalizar(data.atributos) || fallbackAtributos,
            status: normalizar(data.status) || fallbackStatus,
            pericias: normalizar(data.pericias) || fallbackPericias,
            profissoes: data.profissoes || [],
            especiais: data.especiais || [],
        });
    } catch (err) {
        console.error("Erro ao buscar personagem:", err);
    }
}


export default function Ficha() {
    const { id } = useParams<{ id: string }>()
    const [personagem, setPersonagem] = useState<Personagem | null>(null)
    const [personagensList, setPersonagensList] = useState<Personagem[]>([]) 
    const { usuario } = useUsuarioStore()
   //Controla se o menu lateral está aberto (true) ou fechado (false/recolhido)
    const [isMenuOpen, setIsMenuOpen] = useState(true) 
    
    //Alterna o estado do menu
    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    }

    // ESTADOS PARA ESPECIAIS 
    const [isEspecialModalOpen, setIsEspecialModalOpen] = useState(false) 
    const [newEspecial, setNewEspecial] = useState({ nome: '', descricao: '' }) 
    const [especialFormError, setEspecialFormError] = useState<string | null>(null);

    // ESTADOS PARA STATUS 
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [editingStatus, setEditingStatus] = useState<Status | null>(null);
    const [statusFormError, setStatusFormError] = useState<string | null>(null);
    
    // ESTADO DO MODAL DE DADO
    const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
    const [rolling, setRolling] = useState(false);
    const [finalResult, setFinalResult] = useState<number | null>(null);
    const [rollLabel, setRollLabel] = useState<string>("");
    const [currentDice, setCurrentDice] = useState(20);

    // Rola um dado d20 com bônus
   function rollDice(diceSize: number, bonus: number, label: string) {
    setIsDiceModalOpen(true);
    setRolling(true);
    setFinalResult(null);
    setRollLabel(`${label} (d${diceSize})`);

    const roll = Math.floor(Math.random() * diceSize) + 1;
    const total = roll + bonus;

    setTimeout(() => {
        setRolling(false);
        setFinalResult(total);
    }, 1500);
    }
  
    //Busca a lista completa de personagens
    const fetchPersonagensList = async () => {

        if (!usuario?.id) {
            console.error("ID do usuário não disponível para buscar lista de personagens.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/personagens?usuarioId=${usuario.id}`);
            if (!res.ok) throw new Error("Erro na requisição da lista de personagens.");
            const data: Personagem[] = await res.json();
            setPersonagensList(data);
        } catch (err) {
            console.error("Erro ao buscar lista de personagens:", err);
        }
    }

    useEffect(() => {
        fetchPersonagem(id, setPersonagem);
        if(usuario?.id){
        fetchPersonagensList();
        }
    }, [id, usuario?.id])

    // Preenche o estado de edição do Status ao abrir o modal
    useEffect(() => {
        if (isStatusModalOpen && personagem) {
            // Garante que os valores iniciais do formulário são os valores atuais da ficha
            const currentStatus = (personagem.status as unknown as Status) || fallbackStatus;
            setEditingStatus(currentStatus);
        }
    }, [isStatusModalOpen, personagem]);


    // FUNÇÃO DE SUBMISSÃO para Status (PUT/POST)
    const handleUpdateStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusFormError(null);

        if (!id || !editingStatus) {
            setStatusFormError("Dados do personagem ou status ausentes.");
            return;
        }

        const personagemId = Number(id);
        const statusId = editingStatus.id;
        const method = statusId ? "PUT" : "POST";
        const url = statusId 
            ? `http://localhost:3000/status/${statusId}`
            : `http://localhost:3000/status`;

        // Dados a enviar (garantindo que personagemId esteja presente no POST e PUT)
        const statusData = {
    vida: editingStatus.vida ?? 0,
    mana: editingStatus.mana ?? 0,
    sanidade: editingStatus.sanidade ?? 0,
    armadura: editingStatus.armadura ?? 0,
    estoicismo: editingStatus.estoicismo ?? 0,
    afinco: editingStatus.afinco ?? 0,
    personagemId: personagemId,
  };
        
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(statusData)
            });

            const data = await res.json();

            if (!res.ok) {
      console.error("Erro ao atualizar/criar Status:", data);
      const msg =
        data.message ||
        data.error ||
        "Erro desconhecido ao atualizar Status.";
      setStatusFormError(msg);
      return;
    }

            // Atualiza o estado do personagem e fecha o modal
            await fetchPersonagem(id, setPersonagem);
            setIsStatusModalOpen(false);

        } catch (error) {
            setStatusFormError("Erro de comunicação com a API.");
            console.error("Erro de comunicação com a API:", error);
        }
    };


    // FUNÇÃO DE SUBMISSÃO para Especiais 
    const handleAddEspecial = async (e: React.FormEvent) => {
        e.preventDefault();
        setEspecialFormError(null);

        if (!id) {
            setEspecialFormError("ID do personagem não encontrado.");
            return;
        }

        const especialData = {
            ...newEspecial,
            personagemId: parseInt(id)
        };

        try {
            const res = await fetch("http://localhost:3000/especiais", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(especialData)
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.erro?.issues?.[0]?.message || data.erro || "Erro desconhecido ao adicionar Especial.";
                setEspecialFormError(errorMessage);
                return;
            }

            await fetchPersonagem(id, setPersonagem);
            setNewEspecial({ nome: '', descricao: '' });
            setIsEspecialModalOpen(false);

        } catch (error) {
            setEspecialFormError("Erro de comunicação com a API.");
            console.error("Erro ao submeter novo Especial:", error);
        }
    };

    if (!personagem) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Carregando ficha...
            </div>
        )
    }

    // Mapeamento para o formulário (Key é a chave no objeto Status, Label é o que aparece no Front)
    const statusFields = [
        { key: 'vida', label: 'PV (Vida)', max: 100 },
        { key: 'mana', label: 'PM (Mana)', max: 100 },
        { key: 'sanidade', label: 'SAN (Sanidade)', max: 100 },
        { key: 'armadura', label: 'CA (Armadura)', max: 999 }, // Max Alto
        { key: 'estoicismo', label: 'EST (Estoicismo)', max: 999 }, // Max Alto
        { key: 'afinco', label: 'PA (Afinco)', max: 12 },
    ]
    
   // Retorna um objeto com os bônus ativos da profissão
function getBonusFromProfissao(profissoes: Profissao[] | undefined) {
  if (!profissoes || profissoes.length === 0) return {};

  const bonusMap: Record<string, number> = {};

  profissoes.forEach((prof) => {
    // Cada profissão dá +3 no atributo/perícia correspondente
    bonusMap[prof.bonus.toLowerCase()] = 3;
  });

  return bonusMap;
}

    const profissaoPrincipal = personagem.profissoes?.length ? personagem.profissoes[0].nome : "—";
    
    const bonusProfissao = getBonusFromProfissao(personagem.profissoes);

  
return (
        <div className="w-full min-h-screen bg-[#0F0C0F] text-white flex flex-row">
           <MenuLateral 
                personagem={personagem} 
                isMenuOpen={isMenuOpen} 
                toggleMenu={toggleMenu}
                personagemId={personagem.id} 
                personagensList={personagensList} 
            /> 
            {/* Modal de Adição de Especial */}
            {isEspecialModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-800 p-6 rounded-lg shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center border-b border-zinc-700 pb-3 mb-4">
                            <h3 className="text-xl font-bold">Adicionar Característica Especial</h3>
                            <button 
                                onClick={() => { setIsEspecialModalOpen(false); setEspecialFormError(null); setNewEspecial({ nome: '', descricao: '' }); }}
                                className="text-gray-400 hover:text-white transition"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        {especialFormError && (
                            <div className="bg-red-900 p-3 mb-4 rounded flex items-center text-sm">
                                <FaExclamationCircle className="mr-2 text-red-400" />
                                {especialFormError}
                            </div>
                        )}

                        <form onSubmit={handleAddEspecial} className="space-y-4">
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome (Mínimo 3 caracteres)</label>
                                <input
                                    id="nome"
                                    type="text"
                                    value={newEspecial.nome}
                                    onChange={(e) => setNewEspecial({ ...newEspecial, nome: e.target.value })}
                                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div>
                                <label htmlFor="descricao" className="block text-sm font-medium text-gray-300 mb-1">Descrição (Máximo 500 caracteres)</label>
                                <textarea
                                    id="descricao"
                                    rows={4}
                                    value={newEspecial.descricao}
                                    onChange={(e) => setNewEspecial({ ...newEspecial, descricao: e.target.value })}
                                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                                    required
                                    maxLength={500}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                            >
                                Adicionar Especial
                            </button>
                        </form>
                    </div>
                </div>
            )} 
            
                        {/* Modal de Edição de Status  */}
                        {isStatusModalOpen && editingStatus && (
                            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                                <div className="bg-zinc-800 p-6 rounded-lg shadow-2xl w-full max-w-md">
                                    <div className="flex justify-between items-center border-b border-zinc-700 pb-3 mb-4">
                                        <h3 className="text-xl font-bold">Editar Status do Personagem</h3>
                                        <button 
                                            onClick={() => { setIsStatusModalOpen(false); setStatusFormError(null); }}
                                            className="text-gray-400 hover:text-white transition"
                                        >
                                            <FaTimes size={20} />
                                        </button>
                                    </div>
            
                                    {statusFormError && (
                                        <div className="bg-red-900 p-3 mb-4 rounded flex items-center text-sm">
                                            <FaExclamationCircle className="mr-2 text-red-400" />
                                            {statusFormError}
                                        </div>
                                    )}
            
                                    <form onSubmit={handleUpdateStatus} className="grid grid-cols-2 gap-4">
                                        {statusFields.map((field) => (
                                            <div key={field.key}>
                                                <label htmlFor={field.key} className="block text-sm font-medium text-gray-300 mb-1">{field.label}</label>
                                                <input
                                                    id={field.key}
                                                    type="number"
                                                    value={editingStatus[field.key as keyof Status] as number}
                                                    onChange={(e) => 
                                                        setEditingStatus({ 
                                                            ...editingStatus, 
                                                            [field.key]: parseInt(e.target.value) 
                                                        })
                                                    }
                                                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                                                    required
                                                    min={0}
                                                    max={field.max} 
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="submit"
                                            className="col-span-2 mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                                        >
                                            {editingStatus.id ? "Atualizar Status" : "Criar Status"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                          {/* MODAL DO DADO */}
{isDiceModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-80 z-[999] flex items-center justify-center">
    <div className="bg-zinc-800 p-8 rounded-xl shadow-xl flex flex-col items-center gap-6 w-[90%] max-w-sm">

      <h1 className="text-xl font-bold">{rollLabel}</h1>
       {/* Seleção de tipo de dado */}
<div className="flex gap-2">
  {[4, 6, 8, 10, 12, 20].map((s) => (
    <button
      key={s}
      onClick={() => {
       setCurrentDice(s);  
       rollDice(s, 0, `Rolagem livre`);}}
      className="bg-zinc-700 px-3 py-1 rounded hover:bg-zinc-600 font-bold"
    >
      d{s}
    </button>
  ))}
</div>

      {rolling ? (
        <img
          src={`/d${currentDice}.png`}
          className="w-24 h-24 animate-spin"
        />
      ) : (
        <div className="text-center">
          <h2 className="text-4xl font-extrabold">{finalResult}</h2>
        </div>
      )}

      <button
        onClick={() => setIsDiceModalOpen(false)}
        className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg font-bold"
      >
        FECHAR
      </button>
    </div>
  </div>
)}
        <div  className="w-full max-w-[1600px] p-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                <img src= {personagem.foto} className="w-[220px] md:w-[260px] lg:w-[300px] h-auto rounded-lg object-cover"/>
                <div className="bg-[#161616] rounded-lg p-4 lg:p-6 flex flex-col gap-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-lg">Nome</h1>
                            <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-lg">{personagem.nome}</h1>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-lg">Raça</h1>
                            <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-lg">{personagem.raca}</h1>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-lg">Ranque</h1>
                            <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-lg">{personagem.ranque}</h1>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="lg:col-span-1">
                            <div className="lg:flex lg:items-start">
                            <h1 className="text-xl md:text-2xl lg:whitespace-nowrap  lg:mr-1 lg:text-lg">Afinidade</h1>
                            <h1 className="text-xl md:text-2xl lg:text-lg"> Mística</h1>
                            </div>
                            <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-lg">{personagem.afinidade}</h1>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-lg">Ofício Principal</h1>
                            <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-lg">{profissaoPrincipal}</h1>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-lg">Idade</h1>
                            <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-lg">{personagem.idade}</h1>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="lg:col-span-1" >
                            <div className="lg:flex lg:items-start">
                            <h1 className="text-xl md:text-2xl lg:whitespace-nowrap  lg:mr-1 lg:text-lg">Características</h1>
                            <h1 className="text-xl md:text-2xl lg:text-lg">Notáveis</h1>
                            </div>
                            <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">
                                {personagem.caracteristicas ? personagem.caracteristicas : "Não tem caractéristicas."}
                            </h1>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-8 lg:gap-33 text-center ">
                            <div className="lg:flex lg:flex-col lg:h-full">
                                <h1 className="text-xl md:text-[23px] lg:text-lg">Tamanho</h1>
                                <h1 className="bg-black py-2 px-3 lg:px-13 lg:py-3 rounded-md text-base lg:break-normal  break-words whitespace-normal">
                                <span className="whitespace-nowrap">{personagem.altura} m</span>
                                </h1>
                            </div>
                            <div className="lg:flex lg:flex-col lg:h-full">
                                <h1 className="text-xl md:text-[23px] lg:text-lg">Movimento</h1>
                                <h1 className="bg-black py-2 px-3 lg:px-12 lg:py-3 rounded-md text-base lg:break-normal break-words whitespace-normal">
                                <span className="whitespace-nowrap">{personagem.movimento} m</span>  
                                </h1>
                            </div>
                            <div className="lg:flex lg:flex-col lg:h-full">
                                <h1 className="text-xl md:text-[23px] lg:text-lg">EXP</h1>
                                <h1 className="bg-black py-2 px-3 lg:px-12 lg:py-3 rounded-md text-base lg:break-normal break-words whitespace-normal">{personagem.experiencia}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <div className="bg-[#161616] rounded-lg p-4">
                        <h1 className="text-2xl font-semibold text-center mb-4  lg:text-lg">ATRIBUTOS</h1>
                        <div className="grid grid-cols-1 gap-y-2 ">
                             {[
            "FORÇA", "DESTREZA", "CONSTITUIÇÃO", "MÍSTICO",
            "VONTADE", "PRESENÇA", "CURIOSIDADE", "RAZÃO",
            "PERCEPÇÃO", "SORTE"
          ].map((attr) => {
            const key = attr
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // remove acentos
              .toLowerCase() as keyof Omit<Atributos, 'id'>;
            
            const valorAtual = personagem?.atributos?.[key] ?? 0;

            const bonus = bonusProfissao[key] || 0;

            return (
            <div key={attr} className="flex justify-between items-center">
              <span className="text-lg font-semibold lg:text-sm">{attr}</span>
              <div className="flex items-center gap-4">
                <img src="/cubo.png" alt={`Rolar dado para ${attr}`} className="size-5 md:size-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => rollDice(20, valorAtual + bonus, attr)} />
                <span className="text-2xl bg-black py-1 px-4 rounded-md min-w-[59px] text-center">{valorAtual}</span>
                <span className="text-lg bg-black py-1 px-3 rounded-md">+{bonus}</span>
              </div>
            </div>
          );
         })}
        </div>
      </div>
                    <div className="flex flex-col gap-6">
                        <div 
                            className="bg-[#161616] rounded-lg p-4 shadow-inner cursor-pointer hover:bg-zinc-700 transition duration-150"
                            onClick={() => setIsStatusModalOpen(true)} 
                        >
                        <h1 className="text-2xl font-semibold flex justify-between mb-4 lg:text-lg">STATUS <FaEdit className="text-green-400 text-sm"/> </h1>
                        <div className="grid grid-cols-3 gap-4 ">
            {[
              { label: 'PV', value: personagem.status?.vida || 0 },
              { label: 'PM', value: personagem.status?.mana || 0},
              { label: 'SAN', value: personagem.status?.sanidade || 0 },
              { label: 'CA', value: personagem.status?.armadura || 0 },
              { label: 'EST', value: personagem.status?.estoicismo || 0 },
              { label: 'PA', value: personagem.status?.afinco || 0},
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <h3 className="font-bold lg:text-lg">{item.label}</h3>
                <div className="bg-black w-16 h-16 flex items-center justify-center rounded-lg shadow-md">
                  <span className="text-2xl font-extrabold ">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
           <div className="bg-[#161616] rounded-lg p-4">
  <h1 className="text-2xl font-semibold mb-2 lg:text-lg">PROFISSÕES</h1>
  <ul className="bg-black rounded-md px-6 py-3 list-disc space-y-1 lg:text-lg">
    {(() => {
      const profissoes: unknown = personagem.profissoes;

      if (Array.isArray(profissoes)) {
        // Caso seja um array de objetos
        return profissoes.length > 0 ? (
          profissoes.map((p: any, index: number) => (
            <li key={p.id || index} className="capitalize">
              {p.nome}
            </li>
          ))
        ) : (
          <li>—</li>
        );
      }

      if (typeof profissoes === "string") {
        // Caso venha como string separada por vírgulas
        return profissoes.split(",").map((nome: string, index: number) => (
          <li key={index} className="capitalize">
            {nome.trim()}
          </li>
        ));
      }

      // Caso não haja profissões
      return <li>—</li>;
    })()}
  </ul>
</div>

    <div
          className="bg-black rounded-lg p-4 shadow-inner cursor-pointer hover:bg-zinc-700 transition duration-150 flex flex-col"
          onClick={() => setIsEspecialModalOpen(true)}
        >
          <h1 className="text-2xl font-semibold mb-3 flex justify-between lg:text-lg">
            Habilidades Únicas <FaPlus className="text-cyan-400 text-sm" />
          </h1>
          {personagem.especiais?.length ? (
            <ul className="space-y-1 text-lg">
              {personagem.especiais.map(e => (
                <li key={e.id} className="text-gray-300">
                  <span className="font-bold lg:text-lg">{e.nome}</span>: {e.descricao}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm lg:text-lg">Clique para adicionar.</p>
          )}
        </div>
      </div>
     <div className="bg-[#161616] rounded-lg p-4">
        <h1 className="text-2xl font-semibold text-center mb-4 lg:text-lg">PERÍCIAS</h1>
        <div className="grid grid-cols-1 gap-y-2">
          {listaMapeadaPericias.map((p) => {
            const key = p.key; 
            const bonus = bonusProfissao[key] || 0;
            const valorAtual = personagem?.pericias?.[key] ?? 0;

return (
    <div key={p.label} className="flex justify-between items-center">
        <span className="text-lg font-semibold lg:text-xs">{p.label}</span>
         <div className="flex items-center gap-3">
          <img src="/cubo.png" alt={`Rolar dado para ${p.label}`} className="size-5 md:size-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => rollDice(20, valorAtual + bonus, p.label)} />
          <span className="text-xl bg-black py-1 px-3 rounded-md min-w-[57px] text-center">{valorAtual}</span>
          <span className="text-lg bg-black py-1 px-3 rounded-md">+{bonus}</span>
               </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
        <div className="mt-8">
         <h1 className="text-2xl mb-2 lg:text-lg">BACKGROUND</h1>
          <div className="bg-[#161616] rounded-lg p-4">
           <p className="bg-black rounded-md px-6 py-4 text-sm md:text-base overflow-y-auto max-h-40 scrollbar-thumb-[#8A8A8A] scrollbar-track-black scrollbar-thin lg:text-lg">
            {personagem.background ? personagem.background : "Este personagem não tem um background."}
            </p>
        </div>
       </div>
      </div>
     </div>
    </div>
    )
}