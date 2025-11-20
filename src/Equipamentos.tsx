import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import MenuLateral from './components/menu_lateral' 
import { useUsuarioStore } from "./context/UsuarioContext" 
import { toast } from "sonner"

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

type Item = {
  id: number;
  tipo: string;
  nome: string;
  descricao: string;
  quantidade: number;
  tamanho: string;
  personagemId: number;
};

type Armadura = {
  id: number;
  tipo: string;
  nome: string;
  descricao: string;
  protecao: number;
  tamanho: string;
  peca: "Cabeca" | "Ombro" | "Peito" | "Capa" | "Luva" | "Cinto" | "Colar" | "Anel" | "Perna" | "Bota";
  equipado: boolean;
  personagemId: number;
  caracteristicas?: {
    id?: number;
    nome: string;
    descricao: string;
  }[];
};


type Alcance = "Pessoal" | "Curto" | "Medio" | "Longo" | "Superior";
type Recarga = "Instantaneo" | "Turno_inteiro" | "Acao_extra";

type Armamento = {
  id: number;
  tipo: string;
  nome: string;
  descricao: string;
  danoMin: number;
  danoMax: number;
  habilidade: string;
  alcance: Alcance;
  recarga: Recarga;
  cadencia: number;
  carregador: number; 
  tamanho: "Muito_pequeno" | "Pequeno" | "Medio" | "Grande" | "Muito_grande";
  equipado: boolean;
  personagemId: number;
};

export type EquipamentoCosmetico = {
    id: number; 
    personagemId: number;
    capacete: string | null;
    armadura: string | null;
    capa: string | null;
    ombreira: string | null;
    luva: string | null;
    cinto: string | null;
    colar: string | null;
    anel1: string | null;
    calcas: string | null;
    anel2: string | null;
    armaMaoEsquerda: string | null; 
    botas: string | null;
    armaMaoDireita: string | null;
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
    equipamentoCosmetico?: EquipamentoCosmetico;
}

const fallbackStatus: Status = {
    vida: 0, mana: 0, sanidade: 0, armadura: 0, estoicismo: 0, afinco: 0,
}

const fallbackAtributos: Atributos = {
    forca: 0, destreza: 0, constituicao: 0, mistico: 0, vontade: 0, 
    presenca: 0, curiosidade: 0, razao: 0, percepcao: 0, sorte: 0,
}

// Mapeamento dos slots com seus nomes no DB e caminho base da pasta
const EQUIP_SLOTS_MAP = {
  capacete: { dbName: 'capacete', path: '/equipamentos/capacetes' },
  ombreira: { dbName: 'ombreira', path: '/equipamentos/ombreiras' }, 
  armadura: { dbName: 'armadura', path: '/equipamentos/armaduras' },
  capa: { dbName: 'capa', path: '/equipamentos/capas' },
  luva: { dbName: 'luva', path: '/equipamentos/luvas' },
  cinto: { dbName: 'cinto', path: '/equipamentos/cintos' },
  colar: { dbName: 'colar', path: '/equipamentos/colares' },
  anel1: { dbName: 'anel1', path: '/equipamentos/aneis' },
  calcas: { dbName: 'calcas', path: '/equipamentos/calcas' },
  anel2: { dbName: 'anel2', path: '/equipamentos/aneis' },
  armaMaoEsquerda: { dbName: 'armaMaoEsquerda', path: '/equipamentos/armas' },
  botas: { dbName: 'botas', path: '/equipamentos/botas' },
  armaMaoDireita: { dbName: 'armaMaoDireita', path: '/equipamentos/armas' },
};

const fetchEquipamentoCosmetico = async (id: string | undefined): Promise<EquipamentoCosmetico | null> => {
    if (!id) return null;
    try {
        const res = await fetch(`http://localhost:3000/equipamentocosmeticos/${id}`); 
        if (!res.ok) throw new Error("Erro na requisição dos cosméticos.");
        const data = await res.json();
        return data || null; 
    } catch (err) {
        console.error("Erro ao buscar cosméticos:", err);
        return null;
    }
}

// Função de busca 
const fetchPersonagem = async (id: string | undefined, setPersonagem: React.Dispatch<React.SetStateAction<Personagem | null>>) => {
    if (!id) return;
    try {
        const res = await fetch(`http://localhost:3000/personagens/${id}`);
        if (!res.ok) throw new Error("Erro na requisição da ficha.");
        const data = await res.json();
        const equipamentoCosmetico = await fetchEquipamentoCosmetico(id);
        const normalizar = (array: any[] | undefined) => array && array.length > 0 ? array[0] : null;

        setPersonagem({
            ...data,
            atributos: normalizar(data.atributos) || fallbackAtributos,
            status: normalizar(data.status) || fallbackStatus,
            profissoes: data.profissoes || [],
            especiais: data.especiais || [],
            equipamentoCosmetico: equipamentoCosmetico || undefined,
        });
    } catch (err) {
        console.error("Erro ao buscar personagem:", err);
    }
}

// Helper para parsear Requerimentos (Formato esperado: "Atributo Valor, Atributo Valor")
const parseRequerimentos = (text: string) => {
    if (!text) return [];
    return text.split(/[,\n]/)
        .map(req => req.trim())
        .filter(req => req.length > 0)
        .map(req => {
            const parts = req.split(/\s+/); // Divide por espaço
            if (parts.length >= 2) {
                const atributo = parts[0];
                const valor = parseInt(parts[parts.length - 1], 10);
                // Validação mínima: nome com 3+ caracteres, valor numérico e >= 1
                if (atributo.length >= 3 && !isNaN(valor) && valor >= 1) { 
                    return { atributo, valor };
                }
            }
            return null;
        })
        .filter((req): req is { atributo: string; valor: number } => req !== null);
};

// Helper para parsear Penalidades (Formato esperado: "Nome -Valor, Nome -Valor" Ex: "Destreza -2, Percepção -1")
const parsePenalidades = (text: string) => {
    if (!text) return [];
    // Regex: Captura Nome (palavras/espaços) seguido por Valor (sinal opcional e número)
    const regex = /([a-zA-Z\s]+)\s*([+-]?\d+)/g;
    let match;
    const penalidades = [];

    while ((match = regex.exec(text)) !== null) {
        const nome = match[1].trim(); 
        const valor = parseInt(match[2], 10); 
        
        // Validação: nome min 3, valor é número
        if (nome.length >= 3 && !isNaN(valor)) {
            penalidades.push({ nome, valor });
        }
    }
    return penalidades;
};


// Helper para parsear Características (Formato esperado: "Nome - Descrição" (separado por quebra de linha))
const parseCaracteristicas = (text: string) => {
    if (!text) return [];
    
    // Divide por quebra de linha. Remove itens vazios.
    return text.split(/\n/) 
        .map(carac => carac.trim())
        .filter(carac => carac.length > 0)
        .map(carac => {
            // Tenta dividir a string UMA ÚNICA VEZ pelo separador ' - '
            const parts = carac.split(' - ');
            
            if (parts.length >= 2) {
                const nome = parts[0].trim();
                // O resto da string após o primeiro ' - ' é a descrição.
                // Usamos slice(1).join(' - ') para garantir que descrições que contenham ' - ' sejam preservadas.
                const descricao = parts.slice(1).join(' - ').trim(); 
                
                // Validação: nome min 3, descrição min 2
                if (nome.length >= 3 && descricao.length >= 2) { 
                    return { nome, descricao };
                }
            }
            
            // Se falhar, retorne null
            return null; 
        })
        .filter((carac): carac is { nome: string; descricao: string } => carac !== null);
};

export default function Equipamento() {
    const { id } = useParams<{ id: string }>()
    const [personagem, setPersonagem] = useState<Personagem | null>(null)
    const [personagensList, setPersonagensList] = useState<Personagem[]>([]) 
    const { usuario } = useUsuarioStore()
    const [armaduras, setArmaduras] = useState<Armadura[]>([]);
    const [armamentos, setArmamentos] = useState<Armamento[]>([]); 
    const [itens, setItens] = useState<Item[]>([]);
    const [selectedItem, setSelectedItem] = useState<{ id: number; tipo: string } | null>(null);
    const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
    const [novoItem, setNovoItem] = useState({
    nome: "",
    tamanho: "Medio",
    tipo: "Item",
    quantidade: 1,
    descricao: "",
    peca: "",
    protecao: 0,
    caracteristicas: "",
    danoMin: 1,
    danoMax: 1,
    habilidade: "",
    alcance: "Pessoal",
    recarga: "Instantaneo",
    cadencia: 0,
    carregador: 0,
    categoria: "",
    requerimentosTexto: "", 
    penalidadesTexto: "", 
    caracteristicasArmaTexto: "",
    });

   const [categoriaArma, setCategoriaArma] = useState<"CorpoACorpo" | "ADistancia" | "">("");

    // Buscar itens do personagem
const fetchItens = async () => {
  if (!personagem?.id) return;
  try {
    const res = await fetch(`http://localhost:3000/itens?personagemId=${personagem.id}`);
    if (!res.ok) throw new Error("Erro ao buscar itens");
    const data: Item[] = await res.json();
    setItens(data);
  } catch (err) {
    console.error(err);
  }
};

// Buscar armaduras do personagem
const fetchArmaduras = async () => {
  if (!personagem?.id) return;
  try {
    const res = await fetch(`http://localhost:3000/armaduras?personagemId=${personagem.id}`);
    if (!res.ok) throw new Error("Erro ao buscar armaduras");
    const data: Armadura[] = await res.json();
    setArmaduras(data);
  } catch (err) {
    console.error("Erro ao buscar armaduras:", err);
  }
};

// Buscar armamentos do personagem 
const fetchArmamentos = async () => {
  if (!personagem?.id) return;
  try {
    const res = await fetch(`http://localhost:3000/armamentos?personagemId=${personagem.id}`);
    if (!res.ok) throw new Error("Erro ao buscar armamentos");
    const data: Armamento[] = await res.json();
    setArmamentos(data);
  } catch (err) {
    console.error("Erro ao buscar armamentos:", err);
  }
};

// Adicionar novo item
const handleAddItem = async () => {
  if (!personagem?.id) return;

  try {
    const isArmadura = novoItem.tipo === "Armadura";
    const isArmamento = novoItem.tipo === "Armamento";
    
    const endpoint = isArmadura
      ? "http://localhost:3000/armaduras"
      : isArmamento
      ? "http://localhost:3000/armamentos"
      : "http://localhost:3000/itens";

    let payload: any;
    
    if (isArmadura) {
        payload = {
          tipo: "Armadura",
          nome: novoItem.nome,
          peca: (novoItem.peca as Armadura["peca"]) || "Peito",
          protecao: novoItem.protecao || 0,
          equipado: false,
          tamanho: novoItem.tamanho,
          descricao: novoItem.descricao || "",
          personagemId: personagem.id,
          caracteristicas:
            novoItem.caracteristicas && novoItem.caracteristicas.trim() !== ""
              ? [
                  {
                    nome: "Personalizada",
                    descricao: novoItem.caracteristicas,
                  },
                ]
              : [],
        }
    } else if (isArmamento) {
        // PARTE 1: Payload para criação do Armamento principal
        const basePayload = {
            tipo: "Armamento",
            nome: novoItem.nome,
            descricao: novoItem.descricao || "",
            danoMin: novoItem.danoMin,
            danoMax: novoItem.danoMax,
            habilidade: novoItem.habilidade,
            alcance: novoItem.alcance,
            tamanho: novoItem.tamanho,
            equipado: false,
            personagemId: personagem.id,
        };

        if (categoriaArma === "ADistancia") {
        // Envia Recarga e Cadencia APENAS para À Distância
        payload = {
            ...basePayload,
            recarga: novoItem.recarga,
            cadencia: novoItem.cadencia,
            carregador: novoItem.carregador > 0 ? novoItem.carregador : undefined, // Só envia se > 0
        };
    } else { 
        payload = {
            ...basePayload,
            carregador: novoItem.carregador > 0 ? novoItem.carregador : undefined,
        };
      }

    } else {
        payload = {
          tipo: "Item",
          nome: novoItem.nome,
          descricao: novoItem.descricao,
          quantidade: novoItem.quantidade,
          tamanho: novoItem.tamanho,
          personagemId: personagem.id,
        };
    }

    // 1. POST para criar Armamento/Armadura/Item
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Erro ao adicionar ${novoItem.tipo}`);

    const createdItem = await res.json();
    
    // 2. POSTS SEQUENCIAIS para entidades relacionadas (APENAS SE FOR ARMAMENTO)
    if (isArmamento) {
        const armamentoId = createdItem.id;

        // 2.1. Criar Requerimentos
        const requerimentos = parseRequerimentos(novoItem.requerimentosTexto);
        for (const req of requerimentos) {
            await fetch("http://localhost:3000/requerimentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    atributo: req.atributo,
                    valor: req.valor,
                    armamentoId: armamentoId,
                }),
            });
        }
        
        // 2.2. Criar Penalidades
        const penalidades = parsePenalidades(novoItem.penalidadesTexto);
        for (const pen of penalidades) {
            await fetch("http://localhost:3000/penalidades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: pen.nome,
                    valor: pen.valor,
                    armamentoId: armamentoId,
                }),
            });
        }
        
        // 2.3. Criar Características
        const caracteristicas = parseCaracteristicas(novoItem.caracteristicasArmaTexto);
        for (const carac of caracteristicas) {
            await fetch("http://localhost:3000/caracteristicas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: carac.nome,
                    descricao: carac.descricao,
                    armamentoId: armamentoId,
                }),
            });
        }

        // fetch completo para atualizar a lista
        await fetchArmamentos();

    }

    // Atualiza a lista local (Se não for Armamento)
    if (isArmadura) {
      setArmaduras((prev) => [...prev, createdItem]);
    } else if (!isArmamento) { // Se for Item comum
      setItens((prev) => [...prev, createdItem]);
    }

    // Fecha modal 
    setIsNewItemModalOpen(false);
    setNovoItem({
      nome: "",
      tipo: "Item",
      tamanho: "Medio",
      quantidade: 1,
      descricao: "",
      peca: "",
      protecao: 0,
      caracteristicas: "",
      danoMin: 1,
      danoMax: 1,
      habilidade: "",
      alcance: "Pessoal",
      recarga: "Instantaneo",
      cadencia: 0,
      carregador: 0,
      categoria: "",
      requerimentosTexto: "",
      penalidadesTexto: "",
      caracteristicasArmaTexto: "",
    });
  } catch (err) {
    console.error("Erro ao adicionar item/armadura/armamento:", err);
  }
};

const handleDeleteItem = async () => {
  if (!selectedItem) {
    alert("Selecione um item para excluir!");
    return;
  }

  let itemSelecionado = null;

  if (selectedItem.tipo === "Armadura") {
      itemSelecionado = armaduras.find(a => a.id === selectedItem.id);
  }
  else if (selectedItem.tipo === "Armamento") {
      itemSelecionado = armamentos.find(w => w.id === selectedItem.id);
  }
  else { 
      itemSelecionado = itens.find(i => i.id === selectedItem.id);
  }
  

  if (!itemSelecionado) {
    alert("Item não encontrado!");
    return;
  }

  const isArmadura = itemSelecionado.tipo === "Armadura";
  const isArmamento = itemSelecionado.tipo === "Armamento"; 

  const endpoint = isArmadura
    ? `http://localhost:3000/armaduras/${selectedItem.id}`
    : isArmamento
    ? `http://localhost:3000/armamentos/${selectedItem.id}` 
    : `http://localhost:3000/itens/${selectedItem.id}`;

  if (!window.confirm(`Tem certeza que deseja excluir este ${isArmadura ? "armadura" : isArmamento ? "armamento" : "item"}?`)) {
    return;
  }

  try {
    const res = await fetch(endpoint, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao excluir item");

    if (isArmadura) {
      setArmaduras((prev) => prev.filter((a) => a.id !== selectedItem.id));
    } else if (isArmamento) { 
      setArmamentos((prev) => prev.filter((w) => w.id !== selectedItem.id));
    } else {
      setItens((prev) => prev.filter((i) => i.id !== selectedItem.id));
    }

    setSelectedItem(null);
  } catch (err) {
    console.error("Erro ao excluir item:", err);
  }
};

const handleToggleEquipado = async (equipar: boolean) => {
  if (!selectedItem) {
    alert("Selecione uma armadura ou armamento para equipar/desequipar!");
    return;
  }

  let itemSelecionado = null;

  if (selectedItem.tipo === "Armadura") {
    itemSelecionado = armaduras.find((a) => a.id === selectedItem.id);
  } 
  else if (selectedItem.tipo === "Armamento") {
    itemSelecionado = armamentos.find((w) => w.id === selectedItem.id);
  }
  

  if (!itemSelecionado || (itemSelecionado.tipo !== "Armadura" && itemSelecionado.tipo !== "Armamento")) {
    alert("O item selecionado não é uma Armadura ou Armamento!");
    return;
  }

  const isArmadura = itemSelecionado.tipo === "Armadura";
  const isArmamento = itemSelecionado.tipo === "Armamento";

  const endpoint = isArmadura
    ? `http://localhost:3000/armaduras/${selectedItem.id}`
    : `http://localhost:3000/armamentos/${selectedItem.id}`; 
  
  try {
    
    if (isArmadura) {
      const armaduraSelecionada = itemSelecionado as Armadura;
    
      if (equipar) {
        // permite dois aneis equipados
        if (armaduraSelecionada.peca !== "Anel") {
          const armaduraConflitante = armaduras.find(
            (a) => a.peca === armaduraSelecionada.peca && a.equipado && a.id !== armaduraSelecionada.id
          );
    
          if (armaduraConflitante) {
            await fetch(`http://localhost:3000/armaduras/${armaduraConflitante.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...armaduraConflitante, equipado: false }),
            });
          }
        } else {
          // Para anéis: limita a 2
          const aneisEquipados = armaduras.filter(
            (a) => a.peca === "Anel" && a.equipado && a.id !== armaduraSelecionada.id
          );
          
          // se já tem dois equipados e o atual ainda não está equipado -> bloqueia
          if (!armaduraSelecionada.equipado && aneisEquipados.length >= 2) {
            toast.error("Você só pode equipar no máximo 2 anéis.");
            return;
          }          
        }
      }
    }
    
      let payloadToSend: any = { ...itemSelecionado, equipado: equipar };

     if (isArmamento) {
    // 1. Remove as propriedades aninhadas que o Zod rejeita 
    const { caracteristica, requerimento, penalidade, ...armamentoData } = itemSelecionado as any;
    
    // 2. Cria o payload base limpo
    payloadToSend = { ...armamentoData, equipado: equipar };

    // 3. Limpeza  para campos opcionais NULOS ou ZERADOS 
    if (!payloadToSend.carregador) {
        delete payloadToSend.carregador;
    }
    
    // Armas Corpo a Corpo não têm recarga/cadência. Se vierem como null/undefined/0, removemos
    if (!payloadToSend.recarga) {
        delete payloadToSend.recarga;
    }
    
    if (!payloadToSend.cadencia || payloadToSend.cadencia === 0) {
        delete payloadToSend.cadencia;
    }
}
// Logo após determinar isArmamento/isArmadura e antes do PUT:
if (isArmamento && equipar) {
  // Conta armamentos atualmente equipados
  const currentlyEquipped = armamentos.filter(w => w.equipado);
  // Verifica se o item selecionado já está equipado 
  const alreadyEquipped = (itemSelecionado as Armamento).equipado;

  if (!alreadyEquipped && currentlyEquipped.length >= 2) {
    // Impede equipar se já tiver 2 armas equipadas
    toast.error("Você só pode equipar no máximo 2 armas.");
    return;
  }
}

    // Atualiza o status de equipado no backend
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSend),
    });

    if (!res.ok) throw new Error(`Erro ao atualizar ${itemSelecionado.tipo}`);
    const updated = await res.json();

    if (isArmadura) {
      const armaduraSelecionada = itemSelecionado as Armadura;
    
      if (equipar) {
        if (armaduraSelecionada.peca !== "Anel") {
          const armaduraConflitante = armaduras.find(
            (a) =>
              a.peca === armaduraSelecionada.peca &&
              a.equipado &&
              a.id !== armaduraSelecionada.id
          );
    
          if (armaduraConflitante) {
            await fetch(`http://localhost:3000/armaduras/${armaduraConflitante.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...armaduraConflitante, equipado: false }),
            });
          }
        } else {
          const aneisEquipados = armaduras.filter(
            (a) => a.peca === "Anel" && a.equipado && a.id !== armaduraSelecionada.id
          );
    
          if (!armaduraSelecionada.equipado && aneisEquipados.length >= 2) {
            toast.error("Você só pode equipar no máximo 2 anéis.");
            return;
          }
        }
      }
    
      setArmaduras((prev) =>
        prev.map((a) => {
          if (a.id === updated.id) return { ...a, equipado: equipar };
    
          if (
            equipar &&
            a.peca === (itemSelecionado as Armadura).peca &&
            (itemSelecionado as Armadura).peca !== "Anel"
          ) {
            return { ...a, equipado: false };
          }
    
          return a;
        })
      );
    }
    
    else if (isArmamento) {
      setArmamentos((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );
    }
    
    if (isArmadura) {
        // Recalcula o total de proteção das armaduras equipadas
        const armadurasAtuais = armaduras.map((a) =>
            a.id === updated.id ? { ...a, equipado: equipar } : a
        );
        
        const totalProtecao = armadurasAtuais
            .filter((a) => a.equipado)
            .reduce((sum, a) => sum + (a.protecao || 0), 0);

        // Atualiza o STATUS do personagem (CA total)
        const statusRes = await fetch(`http://localhost:3000/status?personagemId=${itemSelecionado.personagemId}`);
        const statusData = await statusRes.json();
        const statusAtual = statusData[0];

        if (statusAtual) {
            // Faz PATCH apenas no campo armadura
            await fetch(`http://localhost:3000/status/${statusAtual.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ armadura: totalProtecao }),
            });

            // Atualiza também no estado do personagem (frontend)
            setPersonagem((prev) =>
                prev
                ? {
                    ...prev,
                    status: {
                        ...(prev.status || fallbackStatus),
                        armadura: totalProtecao,
                    },
                    }
                : prev
            );
        }

        console.log(
            equipar
            ? `${itemSelecionado.nome} equipada. Proteção total agora: ${totalProtecao}`
            : `${itemSelecionado.nome} desequipada. Proteção total agora: ${totalProtecao}`
        );
    } 
  
    else if (isArmamento) {
        // Logica para Armamento (apenas loga o estado)
        console.log(
            equipar
            ? `${itemSelecionado.nome} equipado.`
            : `${itemSelecionado.nome} desequipado.`
        );
    }


  } catch (err) {
    console.error("Erro ao atualizar estado de equipado:", err);
  }
};

    // Lógica para identificar os armamentos equipados
    const armamentosEquipados = armamentos.filter(a => a.equipado);

  // Armamento 1 (Mão Direita/Principal) - O primeiro na lista de equipados
  const armamentoDireita = armamentosEquipados.length > 0 ? armamentosEquipados[0] : null;

 // Armamento 2 (Mão Esquerda/Secundária) - O segundo na lista de equipados
  const armamentoEsquerda = armamentosEquipados.length > 1 ? armamentosEquipados[1] : null;

    //Controla se o menu lateral está aberto (true) ou fechado (false/recolhido)
    const [isMenuOpen, setIsMenuOpen] = useState(true) 

    //Alterna o estado do menu
    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    }
    
    //  Lógica do Modal de Seleção 
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [currentSlotKey, setCurrentSlotKey] = useState<keyof typeof EQUIP_SLOTS_MAP | null>(null);
    const [availableImages, setAvailableImages] = useState<string[]>([]);

    // Função de SIMULAÇÃO: Lista estática de arquivos disponíveis
    const fetchAvailableImages = (slotPath: string): string[] => {
        
        if (slotPath.includes('capacetes')) {
            return [
                `${slotPath}/capacete1.png`,
                `${slotPath}/capacete2.png`,
               `${slotPath}/capuz.png`,
                `${slotPath}/coroa.png`,
            ];
        }
        if (slotPath.includes('ombreiras')) {
            return [
                `${slotPath}/ombreira1.png`,
                `${slotPath}/ombreira2.png`,
                `${slotPath}/ombreira3.png`,
            ];
        }
        if (slotPath.includes('armaduras')) {
            return [
                `${slotPath}/peitoral1.png`,
                `${slotPath}/peitoral2.png`,
                `${slotPath}/peitoral3.png`,
                `${slotPath}/peitoral4.png`,
                `${slotPath}/peitoral5.png`,
            ];
        }
        if (slotPath.includes('luvas')) {
            return [
                `${slotPath}/luva1.png`,
                `${slotPath}/luva2.png`,
                `${slotPath}/luva3.png`
            ];
        }
        if (slotPath.includes('botas')) {
            return [
                `${slotPath}/bota1.png`,
                `${slotPath}/bota2.png`,
                `${slotPath}/bota3.png`,
            ];
        }
        if (slotPath.includes('capas')) {
            return [
                `${slotPath}/capa1.png`,
                `${slotPath}/capa2.png`,
                `${slotPath}/capa3.png`,
            ];
        }
        if (slotPath.includes('cintos')) {
            return [
                `${slotPath}/cinto1.png`,
                `${slotPath}/cinto2.png`,
                `${slotPath}/cinto4.png`,
            ];
        }
        if (slotPath.includes('armas')) {
            return [
                `${slotPath}/escudo5.png`,
                `${slotPath}/arco.png`,
                `${slotPath}/escudo3.png`,
                `${slotPath}/adaga.png`,
                `${slotPath}/espada.png`,
                `${slotPath}/machado.png`,
                `${slotPath}/flecha.png`,
                `${slotPath}/martelo.png`,
                `${slotPath}/cajado.png`,
            ];
        }
        if (slotPath.includes('aneis')) {
            return [
                `${slotPath}/anel1.png`,
                `${slotPath}/anel2.png`,
                `${slotPath}/anel3.png`,
                `${slotPath}/anel4.png`,
                `${slotPath}/anel5.png`,
            ];
        }
        if (slotPath.includes('colares')) {
            return [
                `${slotPath}/colar1.png`,
                `${slotPath}/colar2.png`,
                `${slotPath}/colar3.png`,
            ];
        }
        if (slotPath.includes('calcas')) {
            return [
                `${slotPath}/calca2.png`,
                `${slotPath}/calca3.png`,
                `${slotPath}/calca4.png`,
            ];
        }
        // Retorna o item padrão do slot para poder desequipar
        return [];
    }

    // Função de clique no slot
    const handleSlotClick = (slotKey: keyof typeof EQUIP_SLOTS_MAP) => {
        const slotData = EQUIP_SLOTS_MAP[slotKey];
        setCurrentSlotKey(slotKey);
        setAvailableImages(fetchAvailableImages(slotData.path));
        setIsSelectionModalOpen(true);
    };

    // Função para atualizar o equipamento no estado e enviar para a API (PATCH)
    const handleImageSelect = async (imagePath: string) => {
        if (!currentSlotKey || !personagem || !personagem.id) return;

        const dbName = EQUIP_SLOTS_MAP[currentSlotKey].dbName;
        // Se imagePath for '', ele desequipa (salva null no DB)
        const finalImagePath = imagePath === '' ? null : imagePath; 

        // 1. Atualizar o estado local
        setPersonagem(prev => {
            if (!prev) return null;
            const currentCosmetics = prev.equipamentoCosmetico || {} as EquipamentoCosmetico;
            
            return {
                ...prev,
                equipamentoCosmetico: {
                    ...currentCosmetics,
                    // Garante que o tipo seja compatível (string | null)
                    [dbName]: finalImagePath, 
                } as EquipamentoCosmetico,
            };
        });

        // 2. Enviar para a API (PATCH)
        try {
            const res = await fetch(`http://localhost:3000/equipamentocosmeticos/${personagem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                // Envia apenas o slot e o caminho (o null/'' é tratado pelo upsert na API)
                body: JSON.stringify({ slot: dbName, caminhoImagem: finalImagePath }),
            });
            
            if (!res.ok) {
                throw new Error(`Erro ao salvar: ${res.statusText}`);
            }
            console.log(`Equipamento ${dbName} atualizado para ${finalImagePath}`);
        } catch (error) {
            console.error("Falha ao salvar equipamento cosmético:", error);
        }

        setIsSelectionModalOpen(false);
        setCurrentSlotKey(null);
    };

    //Busca a lista completa de personagens (Permanece a mesma)
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

    useEffect(() => {
       if (personagem?.id) {
       fetchItens();
       fetchArmaduras();
       fetchArmamentos(); 
       }
    }, [personagem?.id]);
    
    if (!personagem) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Carregando Equipamento...
            </div>
        )
    }

    //  Cálculo global do espaço de inventário
const forca = personagem.atributos?.forca ?? 0;
const totalEspaco = forca * 5;
const usado = itens.length + armaduras.length + armamentos.length;
const inventarioCheio = usado >= totalEspaco;


// Componente para um slot de equipamento: CLICÁVEL E EXIBE IMAGEM EQUIPADA
const EquipSlot = ({ imageSrc, altText, slotKey }: { 
    imageSrc: string, 
    altText: string, 
    slotKey: keyof typeof EQUIP_SLOTS_MAP, 
    isRed?: boolean 
}) => {
    
    const dbKey = EQUIP_SLOTS_MAP[slotKey].dbName as keyof EquipamentoCosmetico;
    
    // 1. Obtém o caminho da imagem salva 
    const savedImagePath = personagem?.equipamentoCosmetico?.[dbKey];
    const finalImageSrc: string = (savedImagePath && typeof savedImagePath === 'string' 
        ? savedImagePath 
        : imageSrc
    );
    
    // 3. Determina a opacidade.
    const isEquippedAndCustom = savedImagePath && savedImagePath !== imageSrc;
    
    return (
        <div 
            onClick={() => handleSlotClick(slotKey)} 
             className={`w-16 h-16 flex items-center justify-center rounded-md transition-all duration-300 cursor-pointer
        ${isEquippedAndCustom
          ? "border-2 border-gray-600 hover:border-blue-500"
          : "border-2 border-transparent hover:border-blue-500"
        }`}
        >
            <img 
                src={finalImageSrc} 
                alt={altText} 
                className={`w-16 h-16 ${isEquippedAndCustom ? 'opacity-100' : 'opacity-50'}`} 
            />
        </div>
    );
};

const SelectionModal = ({ isOpen, onClose, images, onSelect, currentSlotName }: { 
    isOpen: boolean, 
    onClose: () => void, 
    images: string[], 
    onSelect: (path: string) => void,
    currentSlotName: string
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-[#161616] p-6 rounded-lg shadow-2xl max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4">Selecionar Item: {currentSlotName}</h3>
                
                <div className="grid grid-cols-4 gap-4 max-h-80 overflow-y-auto border p-2 border-gray-700">
                    {images.map((path, index) => (
                        <div 
                            key={index}
                            className="w-full h-20 bg-black border-2 border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => onSelect(path)}
                        >
                            <img src={path} alt={`Item ${index}`} className="w-16 h-16 opacity-100" />
                        </div>
                    ))}
                    {/* Opção para DESEQUIPAR */}
                    <div 
                        className="w-full h-20 bg-black border-2 border-gray-600 flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors"
                        onClick={() => onSelect('')} // Envia string vazia para desequipar
                    >
                        <span className="text-red-500 text-sm text-center">DESEQUIPAR</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                        onClick={onClose}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

return (
  <div className="w-full min-h-screen bg-[#0F0C0F] text-white flex flex-row overflow-hidden">
    <MenuLateral 
      personagem={personagem} 
      isMenuOpen={isMenuOpen} 
      toggleMenu={toggleMenu}
      personagemId={personagem.id} 
      personagensList={personagensList} 
    /> 

    <div className="w-full max-w-[1600px] p-4">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">

        {/* Foto do personagem */}
        <img
          src={personagem.foto}
          className="w-[220px] md:w-[260px] lg:w-[300px] h-auto rounded-lg object-cover"
        />

        {/* Bloco principal */}
        <div className="bg-[#161616] rounded-lg p-6 flex flex-col gap-6 w-full">

          {/* Título STATUS */}
          <h2 className="text-center text-lg font-bold tracking-widest ">
            STATUS
          </h2>

          {/* Grade principal - Usamos grid de 3 colunas e forçamos as mãos a ocuparem 1/3, e o restante 2/3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">

            {/* Coluna 1: MÃO DIREITA e MÃO ESQUERDA agrupadas verticalmente (ocupa 1/3 da linha) */}
            <div className="sm:col-span-1 flex flex-col gap-4">
                
                {/* Mão Direita e Esquerda - Linha 1: Dano por ataque */}
                <div className="flex flex-col items-center">
                    <div className="flex justify-between w-full">
                        <h3 className="text-sm">{armamentoDireita ? armamentoDireita.nome : 'MÃO DIREITA'}</h3>
                        <h3 className="text-sm">{armamentoEsquerda ? armamentoEsquerda.nome : 'MÃO ESQUERDA'}</h3>
                    </div>
                    <div className="flex justify-center items-center w-full mt-1">
                        <span className="bg-black py-2 px-3 rounded-md text-lg w-1/3 text-center">
                        {armamentoDireita 
            ? `${armamentoDireita.danoMin} - ${armamentoDireita.danoMax} ` 
            : `${personagem.atributos?.forca}` /* Valor padrão se estiver desequipado */
                         }
                        </span>
                        <span className="text-xs w-1/3 text-center">Dano por ataque</span>
                        <span className="bg-black py-2 px-3 rounded-md text-lg w-1/3 text-center">
                             {armamentoEsquerda 
            ? `${armamentoEsquerda.danoMin} - ${armamentoEsquerda.danoMax} ` 
            : `${personagem.atributos?.forca}` /* Valor padrão se estiver desequipado */
                         }
                        </span>
                    </div>
                </div>

                {/* Mão Direita e Esquerda - Linha 2: Ataques por turno */}
                <div className="flex flex-col items-center">
                    <div className="flex justify-center items-center w-full">
                        <span className="bg-black py-2 px-3 rounded-md text-lg w-1/3 text-center">
                        {armamentoDireita 
            ? (armamentoDireita.carregador || 1) // Se carregador for nulo/0, usa 1
            : 2
        }
                        </span>
                        <span className="text-xs w-1/3 text-center">Ataques por turno</span>
                        <span className="bg-black py-2 px-3 rounded-md text-lg w-1/3 text-center">
                                {armamentoEsquerda
            ? (armamentoEsquerda.carregador || 1) // Se carregador for nulo/0, usa 1
            : 2
        }
                        </span>
                    </div>
                </div>
                
                {/* Mão Direita e Esquerda - Linha 3: Alcance corpo a corpo */}
                <div className="flex flex-col items-center">
                    <div className="flex justify-center items-center w-full">
                        <span className="bg-black py-2 px-2 text-sm mt-1 w-1/3 text-center">
                        {armamentoDireita 
            ? armamentoDireita.alcance 
            : 'Pessoal' /* Alcance padrão (Corpo a Corpo) */
        }
        </span>
                        <span className="text-xs w-1/3 text-center">Alcance corpo a corpo</span>
                        <span className="bg-black py-2 px-2 text-sm mt-1 w-1/3 text-center">
                               {armamentoEsquerda 
            ? armamentoEsquerda.alcance 
            : 'Pessoal' /* Alcance padrão (Corpo a Corpo) */
        }
                        </span>
                    </div>
                </div>
            </div>

            {/* Coluna 2/3: CARACTERÍSTICAS, ARMADURA e INVENTÁRIO (ocupa 2/3 da linha, em uma grid interna de 3 colunas) */}
            <div className="sm:col-span-2 grid grid-cols-3 gap-6 items-start">
            
                {/* Características da Armadura */}
                <div className="flex flex-col gap-2 items-center">
                  <h3 className="text-sm text-center">CARACTERÍSTICAS DA ARMADURA</h3>
                  <div className="flex flex-col gap-2">
                    {/* Linha 1 de ícones */}
                    <div className="flex justify-center gap-3 mt-2">
                      <img src="/kg.png" alt="característica peso" className="w-6 h-6" />
                      <img src="/sangue.png" alt="característica sangue" className="w-6 h-6" />
                    </div>
                    <div className="flex justify-center gap-3 mt-2">
                      <img src="/cavalo.png" alt="característica peso" className="w-6 h-6" />
                      <img src="/cego.png" alt="característica sangue" className="w-6 h-6" />
                    </div>
                    {/* Linha 2 de ícones (ou simplesmente todos) - Ajuste os ícones para ficarem como na imagem */}
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      <img src="/escudomira.png" alt="característica" className="w-6 h-6" />
                      <img src="/escudoveneno.png" alt="característica" className="w-6 h-6" />
                      <img src="/escudosangue.png" alt="característica" className="w-6 h-6" />
                      <img src="/escudoatordoado.png" alt="característica" className="w-6 h-6" />
                      <img src="/arco.png" alt="característica" className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Armadura */}
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-sm">ARMADURA</h3>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <img src="/escudo.png" alt="escudo" className="absolute w-full h-full" /> 
                    <span className="text-2xl font-bold z-10">
                        {personagem.status?.armadura}
                    </span>
                  </div>
                </div>

                {/* Espaço de Inventário */}
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-sm">ESPAÇO DE INVENTÁRIO</h3>
                <div
               className={`py-2 px-4 rounded-md text-lg font-bold mt-5 ${
               inventarioCheio ? "bg-red-600" : "bg-black"
                }`}
                  >
                  {`${usado}/${totalEspaco}`}
                 </div>
                  {/* Dica só aparece quando o inventário está cheio */}
  {inventarioCheio && (
    <div className="relative self-start mt-2 group">
      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md cursor-help">
        Dica
      </span>
      <div className="absolute right-full mr-2  w-64 bg-gray-800 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 shadow-lg text-center">
        Inventário cheio! Aumente sua força para carregar mais itens ou apague algum item para liberar espaço.
      </div>
    </div>
  )}
                </div>
            </div>

          </div>
        </div>
      </div>
      {/* Seção de Slots de Equipamento e Inventário */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-6 w-full">
 
        {/* Slots de Equipamento */}
        <div className="bg-[#161616] rounded-lg p-4 w-full md:w-1/2 flex flex-col items-center gap-4">
      

          <div className="w-full flex justify-start">
          <img src="/escudoearmas.png" alt="Armas" className="w-8 h-8 opacity-70" /> {/* Ícone da image_a2c67b.png */}
          </div>
          
         

          {/* Dica com tooltip */}
<div className="relative self-start mb-2 group">
  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md cursor-help">
    Dica
  </span>
  <div className="absolute left-0 mt-2 w-48 bg-gray-800 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 shadow-lg">
    Nos slots você pode clicar e escolher uma imagem para cada um deles.
  </div>
</div>

          {/* Grade de slots (5 linhas, 3 colunas) */}
          <div className="grid grid-cols-3 gap-1">
            {/* Estrutura customizada para o layout da grade */}
  
            {/* Linha 1 */}
            <div className='col-span-1'></div>
            <EquipSlot 
                imageSrc="/capacete_fechado.png" 
                altText="Capacete" 
                slotKey="capacete" 
            />
            <div className='col-span-1'></div>

            {/* Linha 2 */}
            <EquipSlot 
                imageSrc="/capacete_chifres.png" 
                altText="Ombreira" 
                slotKey="ombreira" 
            />
            <EquipSlot 
                imageSrc="/peitoral.png" 
                altText="Armadura" 
                slotKey="armadura" 
            />
            <EquipSlot 
                imageSrc="/capa.png" 
                altText="Capa" 
                slotKey="capa" 
            />

            {/* Linha 3 */}
            <EquipSlot 
                imageSrc="/luva.png" 
                altText="Luva" 
                slotKey="luva" 
            />
            <EquipSlot 
                imageSrc="/cinto.png" 
                altText="Cinto" 
                slotKey="cinto" 
            />
            <EquipSlot 
                imageSrc="/colar.png" 
                altText="Colar" 
                slotKey="colar" 
            />
            {/* Linha 4 */}
           <EquipSlot 
                imageSrc="/anel1.png" 
                altText="Anel 1" 
                slotKey="anel1" 
            />
            <EquipSlot 
                imageSrc="/calcas.png" 
                altText="Calças" 
                slotKey="calcas" 
            />
            <EquipSlot 
                imageSrc="/anel2.png" 
                altText="Anel 2" 
                slotKey="anel2" 
            />
            {/* Linha 5 */}
           <EquipSlot 
                imageSrc="/machado_espada.png" 
                altText="Arma Mão Esquerda" 
                slotKey="armaMaoEsquerda" 
            />
            <EquipSlot 
                imageSrc="/botas.png" 
                altText="Botas" 
                slotKey="botas" 
            />
            <EquipSlot 
                imageSrc="/espada_escudo.png" 
                altText="Arma Mão Direita" 
                slotKey="armaMaoDireita" 
            />
          </div>
 
         <div className="flex gap-4 mt-2">
  <button
    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded-md text-sm"
    onClick={() => handleToggleEquipado(true)}
  >
    Equipar
  </button>
  <button
    className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-md text-sm"
    onClick={() => handleToggleEquipado(false)}
  >
    Desequipar
  </button>
</div>


        </div>
       
        {/* Lista de Inventário */}
        <div className="bg-[#161616] rounded-lg p-4 w-full md:w-1/2 flex flex-col items-center gap-4">
 
          <div className="w-full flex justify-start">
          <img src="/mochila.png" alt="Inventário" className="w-8 h-8 opacity-70" /> {/* Ícone da image_a2c67b.png */}
          </div>

          <div className="w-full h-[400px] bg-black p-2 overflow-y-auto">
            {/* Cabeçalho da Lista */}
            <div className="flex justify-between pb-1 mb-2 font-bold text-sm">
              <span>NOME</span>
              <span>TAMANHO</span>
            </div>
    {[...itens, ...armaduras, ...armamentos].map((equip) => ( 
  <div
  key={`${equip.tipo}-${equip.id}`}
  className={`flex justify-between items-center text-sm border-b border-gray-700 py-1 px-2 cursor-pointer rounded-md transition-all
  ${selectedItem?.id === equip.id && selectedItem?.tipo === equip.tipo 
     ? "bg-blue-600 text-white" 
     : "hover:bg-gray-700"}`}
  onClick={() => setSelectedItem({ id: equip.id, tipo: equip.tipo })}
>
    <div className="flex items-center gap-2">
      {/* Ícone se estiver equipado */}
      {(equip.tipo === "Armadura" || equip.tipo === "Armamento") && (equip as Armadura | Armamento).equipado && (
        <img src="/equipa.png" alt="Equipado" className="w-4 h-4" />
      )}
      <div className="flex flex-col">
        <span className="font-semibold">{equip.nome}</span>
        <span className="text-xs text-gray-400">{equip.tipo}</span>
      </div>
    </div>
    <span>{equip.tamanho}</span>
  </div>
))}

          </div>

          <div className="flex gap-4 mt-2">
           <div className="relative group">
  <button
    className={`py-1 px-4 rounded-md text-sm transition ${
      inventarioCheio
        ? "bg-gray-600 cursor-not-allowed opacity-60"
        : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
    onClick={() => {
      if (!inventarioCheio) setIsNewItemModalOpen(true);
    }}
    disabled={inventarioCheio}
  >
    Novo Item
  </button>

  {/* Tooltip que aparece no hover */}
  {inventarioCheio && (
    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-64 bg-gray-800 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 shadow-lg text-center">
      Inventário cheio! Aumente sua força para carregar mais itens ou apague algum item para liberar espaço.
    </div>
  )}
</div>


            <button className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-md text-sm" onClick={handleDeleteItem} >Excluir</button>
          </div>

        </div>
      </div>
    </div>
   {isNewItemModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    {/* Adicionei a rolagem e max-height para evitar que o modal estoure a tela */}
    <div className="bg-zinc-800 p-6 rounded-lg w-96 text-white max-h-[500px] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">NOVO ITEM</h2>

      {/* Campos comuns */}
      <div className="mb-2">
        <label className="block text-sm mb-1">Nome</label>
        <input
          type="text"
          placeholder="Nome"
          className="w-full p-2 bg-black border border-gray-700 rounded"
          value={novoItem.nome}
          onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm mb-1">Tamanho</label>
        <select
          className="w-full p-2 bg-black border border-gray-700 rounded"
          value={novoItem.tamanho}
          onChange={(e) => setNovoItem({ ...novoItem, tamanho: e.target.value as Item['tamanho'] })}
        >
          <option value="Muito_pequeno">Muito Pequeno</option>
          <option value="Pequeno">Pequeno</option>
          <option value="Medio">Médio</option>
          <option value="Grande">Grande</option>
          <option value="Muito_grande">Muito Grande</option>
        </select>
      </div>

      {/* Tipo: Item, Armadura ou Armamento */}
      <div className="mb-3">
        <label className="block text-sm mb-1">Tipo</label>
        <select
          className="w-full p-2 bg-black border border-gray-700 rounded"
          value={novoItem.tipo}
          onChange={(e) => setNovoItem({ ...novoItem, tipo: e.target.value })}
        >
          <option value="Item">Item</option>
          <option value="Armadura">Armadura</option>
          <option value="Armamento">Armamento</option>
        </select>
      </div>

      {/* Campos extras se for Armadura */}
      {novoItem.tipo === "Armadura" && (
        <>
          <div className="flex justify-between gap-2 mb-2">
            <div className="w-1/2">
              <label className="block text-sm mb-1">Peça</label>
              <select
                className="w-full p-2 bg-black border border-gray-700 rounded"
                value={novoItem.peca}
                onChange={(e) => setNovoItem({ ...novoItem, peca: e.target.value as Armadura['peca'] })}
              >
                <option value="Peito">Peito</option>
                <option value="Cabeca">Cabeça</option>
                <option value="Ombro">Ombro</option>
                <option value="Luva">Luva</option>
                <option value="Cinto">Cinto</option>
                <option value="Colar">Colar</option>
                <option value="Anel">Anel</option>
                <option value="Perna">Perna</option>
                <option value="Bota">Bota</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm mb-1">Proteção</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 bg-black border border-gray-700 rounded"
                value={novoItem.protecao}
                onChange={(e) => setNovoItem({ ...novoItem, protecao: Number(e.target.value) })}
              />
            </div>
          </div>

         <label className="block text-sm mb-1">Características (Ex: Sangramento - Causa sangramento)</label>
<textarea
  placeholder="Ex: Sangramento - Causa sangramento (Use ENTER para nova característica)" // <--- MELHORADO!
  className="w-full mb-2 p-2 bg-black border border-gray-700 rounded h-12 text-xs"
  value={novoItem.caracteristicasArmaTexto}
  onChange={(e) => setNovoItem({ ...novoItem, caracteristicasArmaTexto: e.target.value })}
/>
        </>
      )}

     {/* Campos extras se for Armamento (Com lógica Categoria/Recarga) */}
{novoItem.tipo === "Armamento" && (
  <>
    {/* Campo de Seleção de CATEGORIA (Controlador de Frontend) */}
    <div className="mb-2">
      <label className="block text-sm mb-1">Categoria da Arma</label>
      <select
        className="w-full p-2 bg-black border border-gray-700 rounded"
        value={categoriaArma} // Usa o estado de controle separado
        onChange={(e) => setCategoriaArma(e.target.value as "CorpoACorpo" | "ADistancia")}
      >
        <option value="">Selecione a Categoria</option>
        <option value="CorpoACorpo">Corpo a Corpo</option>
        <option value="ADistancia">À Distância</option>
      </select>
    </div>

    {/* O resto dos campos SÓ APARECEM se a categoria for selecionada */}
    {categoriaArma && (
      <>
        <div className="flex justify-between gap-2 mb-2">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Dano Min</label>
            <input
              type="number"
              min="1"
              className="w-full p-2 bg-black border border-gray-700 rounded"
              value={novoItem.danoMin}
              onChange={(e) => setNovoItem({ ...novoItem, danoMin: Number(e.target.value) })}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm mb-1">Dano Max</label>
            <input
              type="number"
              min="1"
              className="w-full p-2 bg-black border border-gray-700 rounded"
              value={novoItem.danoMax}
              onChange={(e) => setNovoItem({ ...novoItem, danoMax: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-sm mb-1">Habilidade</label>
          <input
            type="text"
            placeholder="Habilidade (ex: Corte, Perfuração)"
            className="w-full p-2 bg-black border border-gray-700 rounded"
            value={novoItem.habilidade}
            onChange={(e) => setNovoItem({ ...novoItem, habilidade: e.target.value })}
          />
        </div>

        {/* Linha com Alcance e Recarga/Vazio */}
        <div className="flex justify-between gap-2 mb-2">
          <div className="w-1/2">
            <label className="block text-sm mb-1">Alcance</label>
            <select
              className="w-full p-2 bg-black border border-gray-700 rounded"
              value={novoItem.alcance}
              onChange={(e) => setNovoItem({ ...novoItem, alcance: e.target.value as Armamento['alcance'] })}
            >
              <option value="Pessoal">Pessoal</option>
              <option value="Curto">Curto</option>
              <option value="Medio">Médio</option>
              <option value="Longo">Longo</option>
              <option value="Superior">Superior</option>
            </select>
          </div>
    
<div className="mb-2">
  <label className="block text-sm mb-1">Turno</label>
  <input
    type="number"
    min="0"
    placeholder="Capacidade do Carregador (0 para Corpo a Corpo)"
    className="w-full p-2 bg-black border border-gray-700 rounded"
    value={novoItem.carregador}
    onChange={(e) => setNovoItem({ ...novoItem, carregador: Number(e.target.value) })}
  />
</div>

          {/* CAMPO RECARGA CONDICIONAL (Apenas para À Distância) */}
          {categoriaArma === "ADistancia" && (
            <div className="w-1/2">
              <label className="block text-sm mb-1">Recarga</label>
              <select
                className="w-full p-2 bg-black border border-gray-700 rounded"
                value={novoItem.recarga}
                onChange={(e) => setNovoItem({ ...novoItem, recarga: e.target.value })}
              >
                <option value="Instantaneo">Instantaneo</option>
                <option value="Turno_inteiro">Turno Inteiro</option>
                <option value="Acao_extra">Ação Extra</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Cadência para Armas à Distância */}
        {categoriaArma === "ADistancia" && (
          <div className="mb-2">
            <label className="block text-sm mb-1">Cadência</label>
            <input
              type="number"
              min="0"
              placeholder="Cadência (ex: 1)"
              className="w-full p-2 bg-black border border-gray-700 rounded"
              value={novoItem.cadencia}
              onChange={(e) => setNovoItem({ ...novoItem, cadencia: Number(e.target.value) })}
            />
          </div>
        )}

        {/* CAMPOS COMPLEXOS (Texto para Parsing) */}
        <label className="block text-sm mb-1 mt-3">Requerimentos</label>
        <textarea
          placeholder="Ex: Força 10, Destreza 5 (Separe por vírgula ou Enter)"
          className="w-full mb-2 p-2 bg-black border border-gray-700 rounded h-12 text-xs"
          value={novoItem.requerimentosTexto}
          onChange={(e) => setNovoItem({ ...novoItem, requerimentosTexto: e.target.value })}
        />

        <label className="block text-sm mb-1">Penalidades</label>
        <textarea
          placeholder="Ex: Percepção -2, Destreza -1 (Separe por vírgula ou Enter)"
          className="w-full mb-2 p-2 bg-black border border-gray-700 rounded h-12 text-xs"
          value={novoItem.penalidadesTexto}
          onChange={(e) => setNovoItem({ ...novoItem, penalidadesTexto: e.target.value })}
        />

        <label className="block text-sm mb-1">Características</label>
        <textarea
          placeholder="Ex: Sangramento - Causa sangramento (Separe por Enter)"
          className="w-full mb-2 p-2 bg-black border border-gray-700 rounded h-12 text-xs"
          value={novoItem.caracteristicasArmaTexto}
          onChange={(e) => setNovoItem({ ...novoItem, caracteristicasArmaTexto: e.target.value })}
        />
      </>
    )}
  </>
)}

      {/* Campo quantidade (só para Item comum) */}
      {novoItem.tipo === "Item" && (
        <>
          <label className="block text-sm mb-1">Quantidade</label>
          <input
            type="number"
            min="1"
            className="w-full mb-2 p-2 bg-black border border-gray-700 rounded"
            value={novoItem.quantidade}
            onChange={(e) => setNovoItem({ ...novoItem, quantidade: Number(e.target.value) })}
          />
        </>
      )}

      <label className="block text-sm mb-1">Descrição</label>
      <textarea
        placeholder="Descrição"
        className="w-full mb-2 p-2 bg-black border border-gray-700 rounded h-20"
        value={novoItem.descricao}
        onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
      />

      <div className="flex justify-between mt-3">
        <button
          onClick={() => setIsNewItemModalOpen(false)}
          className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddItem}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          Adicionar
        </button>
      </div>
    </div>
  </div>
)}


    {/* RENDERIZAÇÃO DO MODAL DE SELEÇÃO */}
    <SelectionModal 
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        images={availableImages}
        onSelect={handleImageSelect}
        currentSlotName={currentSlotKey ? EQUIP_SLOTS_MAP[currentSlotKey].dbName : ''}
    />
  </div>
);
}