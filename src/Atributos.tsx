import { useEffect, useState } from "react"
import {  useParams  } from "react-router-dom"
import MenuLateral from './components/menu_lateral' 
import { useUsuarioStore } from "./context/UsuarioContext"
import { useRolarDado } from "./utils/useRolarDado"

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
        });
    } catch (err) {
        console.error("Erro ao buscar personagem:", err);
    }
}

export default function Atributo() {
    const { id } = useParams<{ id: string }>()
    const [personagem, setPersonagem] = useState<Personagem | null>(null)
    const [personagensList, setPersonagensList] = useState<Personagem[]>([]) 
    const [atributosOriginais, setAtributosOriginais] = useState<Atributos | null>(null)
    const [periciasOriginais, setPericiasOriginais] = useState<Pericias | null>(null)
    const { usuario } = useUsuarioStore()
    const { rolarD20 } = useRolarDado();

    //Controla se o menu lateral está aberto (true) ou fechado (false/recolhido)
    const [isMenuOpen, setIsMenuOpen] = useState(true) 
    
    //Alterna o estado do menu
    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    }

     //Busca a lista completa de personagens
        const fetchPersonagensList = async () => {
           // VERIFICA SE O ID DO USUÁRIO ESTÁ DISPONÍVEL   
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
            if (usuario?.id){
            fetchPersonagensList();
            }
        }, [id, usuario?.id])
        
       useEffect(() => {
           if (personagem?.atributos && !atributosOriginais && !periciasOriginais) {
          setAtributosOriginais({ ...personagem.atributos });
          setPericiasOriginais({...personagem.pericias as Pericias});
        }
        }, [personagem, atributosOriginais, periciasOriginais]);
 
    if (!personagem) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Carregando Atributos...
            </div>
        )
    }
     

    /** Rola e atualiza um Atributo na UI e na API. */
    const rolarAtributo = async (nomeAtributo: keyof Omit<Atributos, 'id'>,   ajusteOuValor: number, isDado: boolean = false) => {
        if (!personagem?.atributos || !id) {
            console.error("Dados de Atributo ou Personagem ausentes.");
            return;
        }

        const atributoId = personagem.atributos.id;
        const personagemId = parseInt(id);
        
        const valorAtual = personagem.atributos[nomeAtributo];
        let novoValor;
       
         if (isDado) {
    // DADO — aplica valor direto
    novoValor = ajusteOuValor;
  } else {
    // AJUSTE — soma ou subtrai
    novoValor = valorAtual + ajusteOuValor;
  }

  // limites
  novoValor = Math.min(20, Math.max(0, novoValor));

        const novosAtributos: Atributos = { 
            ...personagem.atributos, 
            [nomeAtributo]: novoValor 
        };
        
        // Cria uma cópia do personagem para atualizar o estado.
        setPersonagem(prev => prev ? ({ ...prev, atributos: novosAtributos }) : null);
        
         // Se o atributo for um dos que afetam STATUS, faz o cálculo
  let campoStatus: keyof Status | null = null;
  if (nomeAtributo === "constituicao") campoStatus = "vida";
  if (nomeAtributo === "mistico") campoStatus = "mana";
  if (nomeAtributo === "vontade") campoStatus = "sanidade";

  if (campoStatus) {
    const novoValorStatus = novoValor * 5;
    const statusId = personagem.status?.id;

    const novosStatus: Status = {
      ...(personagem.status || fallbackStatus),
      [campoStatus]: novoValorStatus,
    };

    // Atualiza status localmente
    setPersonagem((prev) =>
      prev ? { ...prev, status: novosStatus } : null
    );

    // Atualiza na API
    const statusUrl = statusId
      ? `http://localhost:3000/status/${statusId}`
      : `http://localhost:3000/status`;
    const statusMethod = statusId ? "PUT" : "POST";

    const statusData = {
      ...novosStatus,
      personagemId,
      ...(statusId && { id: statusId }),
    };

    try {
      const res = await fetch(statusUrl, {
        method: statusMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statusData),
      });

      if (!res.ok) {
        console.error(`Erro ao atualizar ${campoStatus} via atributo ${nomeAtributo}`);
      } 
    } catch (error) {
      console.error("Erro de rede ao salvar status:", error);
    }
  }

        //Persiste o valor na API (PUT)
      const method = atributoId ? 'PUT' : 'POST';
    const url = atributoId 
        ? `http://localhost:3000/atributos/${atributoId}`
        : `http://localhost:3000/atributos`;
        
    const dadosAEnviar = {
        ...novosAtributos,
        personagemId: personagemId,
        ...(atributoId && { id: atributoId })
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAEnviar),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`Falha ao ${method === 'POST' ? 'criar' : 'atualizar'} atributo.`, data);
            return;
        }

        // Se for um POST, a API retorna o objeto criado, incluindo o novo ID.
        if (method === 'POST') {
             setPersonagem(prev => prev ? ({ ...prev, atributos: data }) : null);
        }

        console.log(`${nomeAtributo} ${method === 'POST' ? 'criado' : 'atualizado'} com sucesso para ${novoValor}`);

    } catch (error) {
        console.error("Erro de rede ao salvar atributo:", error);
    }
};
    
    
    /** Rola e atualiza uma Perícia na UI e na API. */
    const rolarPericia = async (nomePericia: keyof Omit<Pericias, 'id'>, ajusteOuValor: number, isDado: boolean = false) => {
        if (!personagem?.pericias || !id) {
            console.error("Dados de Perícia ou Personagem ausentes.");
            return;
        }

        const periciaId = personagem.pericias.id;
        const personagemId = parseInt(id);
       
        const valorAtual = personagem.pericias[nomePericia];
        let novoValor;
        
         if (isDado) {
    //  DADO — aplica valor direto
    novoValor = ajusteOuValor;
  } else {
    //  soma ou subtrai
    novoValor = valorAtual + ajusteOuValor;
  }

  novoValor = Math.min(20, Math.max(0, novoValor));

        const novasPericias: Pericias = { 
            ...personagem.pericias, 
            [nomePericia]: novoValor 
        };
        
        setPersonagem(prev => prev ? ({ ...prev, pericias: novasPericias }) : null);

        // 2. Persiste o valor na API (PUT)
        const method = periciaId ? 'PUT' : 'POST';
    const url = periciaId 
        ? `http://localhost:3000/pericias/${periciaId}`
        : `http://localhost:3000/pericias`;
        
    const dadosAEnviar = {
        ...novasPericias,
        personagemId: personagemId,
        ...(periciaId && { id: periciaId })
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAEnviar),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`Falha ao ${method === 'POST' ? 'criar' : 'atualizar'} perícia.`, data);
            return;
        }
        
        // Se for um POST, atualiza o estado com o novo ID
        if (method === 'POST') {
             setPersonagem(prev => prev ? ({ ...prev, pericias: data }) : null);
        }

        console.log(`${nomePericia} ${method === 'POST' ? 'criado' : 'atualizado'} com sucesso para ${novoValor}`);

    } catch (error) {
        console.error("Erro de rede ao salvar perícia:", error);
    }
};

return (
    <div className="w-full min-h-screen bg-[#0F0C0F] text-white flex flex-row">
    <MenuLateral 
                    personagem={personagem} 
                    isMenuOpen={isMenuOpen} 
                    toggleMenu={toggleMenu}
                    personagemId={personagem.id} 
                    personagensList={personagensList} 
                /> 
      <div className="w-full max-w-[1600px] p-4">
         <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          <img src= {personagem.foto} className="w-[220px] md:w-[260px] lg:w-[300px] h-auto rounded-lg object-cover"/>
          <div className="bg-[#161616] rounded-lg p-4 lg:p-6 flex flex-col gap-4 w-full">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
               <h1 className="text-xl md:text-2xl lg:whitespace-nowrap  lg:mr-1 lg:text-sm">Pontos</h1>
               <h1 className="text-xl md:text-2xl lg:text-sm">de Vida</h1>
              </div>
             <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">{personagem.status?.vida}</h1>
             </div>
             <div className="flex items-center justify-between">
               <h1 className="text-xl md:text-2xl lg:text-sm">Armadura</h1>
               <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">{personagem.status?.armadura}</h1>
             </div>
             <div>
               <h1 className="text-xl md:text-2xl lg:text-sm">Ranque</h1>
               <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">{personagem.ranque}</h1>
             </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
               <h1 className="text-xl md:text-2xl lg:whitespace-nowrap  lg:mr-1 lg:text-sm">Pontos</h1>
               <h1 className="text-xl md:text-2xl lg:text-sm">de Magia</h1>
              </div>
             <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">{personagem.status?.mana}</h1>
             </div>
             <div className="flex items-center justify-between">
             <h1 className="text-xl md:text-2xl lg:text-sm">Estoicismo</h1>
             <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">{personagem.status?.estoicismo}</h1>
             </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
             <div className="flex items-center justify-between">
             <h1 className="text-xl md:text-2xl lg:text-sm ">Sanidade</h1>
             <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">{personagem.status?.sanidade}</h1>
             </div>
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
               <h1 className="text-xl md:text-2xl lg:whitespace-nowrap  lg:mr-1 lg:text-sm">Pontos</h1>
               <h1 className="text-xl md:text-2xl lg:text-sm">de Afinco</h1>
              </div>
             <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">{personagem.status?.afinco}</h1>
             </div>
             <div>
             <h1 className="text-xl md:text-2xl lg:text-sm">Experiência</h1>
             <h1 className="bg-black py-2 px-3 rounded-md text-lg md:text-xl lg:text-sm">{personagem.experiencia}</h1>
             </div>
           </div>
          </div>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
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
            const valorOriginal = atributosOriginais?.[key] ?? 0;

            // Compara valor atual e original para definir cor de fundo
           let bgColor = "bg-black"; // igual
           if (valorAtual > valorOriginal) bgColor = "bg-blue-700";
           else if (valorAtual < valorOriginal) bgColor = "bg-red-700";

            return (
                <div key={attr} className="flex justify-between items-center">
                <span className="text-lg font-semibold lg:text-sm">{attr}</span>
                <div className="flex items-center gap-4">
                <img src="/cubo.png" alt={`Rolar dado para ${attr}`}
                 className="size-5 md:size-6 cursor-pointer hover:opacity-80 transition-opacity"
                 onClick={() => rolarAtributo(key, rolarD20(), true)} />
                <span className={`text-2xl py-1 px-4 rounded-md min-w-[59px] text-center transition-colors duration-300 ${bgColor}`}>{valorAtual}</span>
                <img src="/positivo.png" alt={`Aumentar para ${attr}`} className="size-5 md:size-6 cursor-pointer hover:opacity-80 transition-opacity bg-[#191CA8] rounded-[5px]" onClick={() => rolarAtributo(key, 1, false)} />
                <img src="/negativo.png" alt={`Diminuir para ${attr}`} className="size-5 md:size-6 cursor-pointer hover:opacity-80 transition-opacity bg-[#E10707] rounded-[5px]" onClick={() => rolarAtributo(key, -1, false)} />
                </div>
                </div>
            );
                })}
              </div>
            </div>
            <div className="bg-[#161616] rounded-lg p-4">
            <h1 className="text-2xl font-semibold text-center mb-4 lg:text-lg">PERÍCIAS</h1>
             <div className="grid grid-cols-1 gap-y-2">
              {listaMapeadaPericias.map((p) => {
                const key = p.key; 
                
                const valorAtual = personagem?.pericias?.[key] ?? 0;
                const valorOriginal = periciasOriginais?.[key] ?? 0;

            // Compara valor atual e original para definir cor de fundo
           let bgColor = "bg-black"; 
           if (valorAtual > valorOriginal) bgColor = "bg-blue-700";
           else if (valorAtual < valorOriginal) bgColor = "bg-red-700";
                return (
                    <div key={p.label} className="flex justify-between items-center">
        <span className="text-lg font-semibold lg:text-sm">{p.label}</span>
         <div className="flex items-center gap-5">
            <img src="/cubo.png" 
                 className="size-5 md:size-6 cursor-pointer hover:opacity-80 transition-opacity"
                 onClick={() => rolarPericia(key, rolarD20(), true)} />
          <span className={`text-2xl py-1 px-4 rounded-md min-w-[59px] text-center transition-colors duration-300 ${bgColor}`}>{valorAtual}</span>
          <img src="/positivo.png" alt={`Rolar dado para ${p.label}`} className="size-5 md:size-6 cursor-pointer hover:opacity-80 transition-opacity bg-[#191CA8] rounded-[5px]" onClick={() => rolarPericia(key, 1)} />
                <img src="/negativo.png" alt={`Rolar dado para ${p.label}`} className="size-5 md:size-6 cursor-pointer hover:opacity-80 transition-opacity bg-[#E10707] rounded-[5px]" onClick={() => rolarPericia(key, -1)} />
               </div>
            </div>
                );
              })}
             </div>
            </div>
           </div>
      </div>           
    </div>

)

}
