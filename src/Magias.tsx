import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import MenuLateral from './components/menu_lateral' 
import { useUsuarioStore } from "./context/UsuarioContext"
import { Plus, X, HelpCircle } from "lucide-react"

export type TipoMagia = 'Apoio' | 'Ataque' | 'Controle' | 'Defesa' | 'Invocacao';

type Magia = {
    id: number
    nome: string
    tipo: TipoMagia
    subtipo?: string
    personagemId: number
    cura?: MagiaCura[]
    buff?: MagiaBuff[]
    cleanse?: MagiaCleanse[]
    movimento?: MagiaMovimento[]
    dano?: MagiaDano[]
    dot?: MagiaDoT[]
    debuff?: MagiaDebuff[]
    curse?: MagiaCurse[]
    moveIni?: MagiaRemove[]
    escudo?: MagiaEscudo[]
    resguardo?: MagiaDef[]
    zumbi?: MagiaNecro[]
    golem?: MagiaGolem[]
    bicho?: MagiaIdolo[]
}

type MagiaIdolo = {
    id: number
    grau: string
    custo: string
    invoPV: string
    invoATKMin: string
    invoATKMax: string
    invoDMGMin: string
    invoDMGMax: string
}

type MagiaGolem = {
    id: number
    grau: string
    custo: string
    invoPV: string
    invoATKMin: string
    invoATKMax: string
    armadura: string
}

type MagiaNecro = {
    id: number
    grau: string
    custo: string
    invoPV: string
    invoATKMin: string
    invoATKMax: string
}

type MagiaDef = {
    id: number
    grau: string
    custo: string
    alvo: string
    tipoAlvo: string
}

type MagiaEscudo = {
    id: number
    grau: string
    custo: string
    escudoMin: string
    escudoMax: string
    alvo: string
    tipoAlvo: string
}

type MagiaRemove = {
    id: number
    grau: string
    custo: string
    distancia: string
    alvo: string
    tipoAlvo: string
}

type MagiaCurse = {
    id: number
    grau: string
    custo: string
    alvo: string
    tipoAlvo: string
}

type MagiaDebuff = {
    id: number
    grau: string
    custo: string
    alvo: string
    tipoAlvo: string
}

type MagiaDoT = {
    id: number
    grau: string
    custo: string
    alvos: string
    tipoAlvo: string
    duracao: string
    danoMin: string
    danoMax: string
}

type MagiaDano = {
    id: number
    grau: string
    custo: string
    alvos: string
    tipoAlvo: string
    danoMin: string
    danoMax: string
}

type MagiaMovimento = {
    id: number
    grau: string
    custo: string
    alvos: string
    tipoAlvo: string
    distancia: string
}

type MagiaCleanse = {
    id: number
    grau: string
    custo: string
    alvos: string
    tipoAlvo: string
    purifica: string
}

type MagiaBuff = {
    id: number
    grau: string
    custo: string
    duracao: string
    alvos: string
    tipoAlvo: string
}

type MagiaCura = {
  id: number
  grau: string
  custo: string
  curaMin: string
  curaMax: string
  alvos: string
  tipoAlvo: string
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
    status?: Status
}

const fallbackStatus: Status = {
    vida: 0, mana: 0, sanidade: 0, armadura: 0, estoicismo: 0, afinco: 0,
}

// Função de busca do Personagem 
const fetchPersonagem = async (id: string | undefined, setPersonagem: React.Dispatch<React.SetStateAction<Personagem | null>>) => {
    if (!id) return;
    try {
        const res = await fetch(`http://localhost:3000/personagens/${id}`);
        if (!res.ok) throw new Error("Erro na requisição da ficha.");
        const data = await res.json();
        
        const normalizar = (array: any[] | undefined) => array && array.length > 0 ? array[0] : null;

        setPersonagem({
            ...data,
            status: normalizar(data.status) || fallbackStatus,
        });
    } catch (err) {
        console.error("Erro ao buscar personagem:", err);
    }
}

// Função para buscar Magias (Busca todas, pois não há personagemId no modelo Magia)
const fetchMagias = async (setMagias: React.Dispatch<React.SetStateAction<Magia[]>>) => {
    try {
        const res = await fetch(`http://localhost:3000/magias?include=graus`); 
        if (!res.ok) throw new Error("Erro na requisição das magias.");
        const data: Magia[] = await res.json();
        
        setMagias(data);
    } catch (err) {
        console.error("Erro ao buscar magias:", err);
    }
}

interface MagiaItemProps {
    magia: Magia;
    isSelected: boolean; 
    onSelect: (magia: Magia) => void; 
}

// Componente para exibir um item da magia na lista
const MagiaItem: React.FC<MagiaItemProps> = ({ magia, isSelected, onSelect }) => {
  const displayTipo = (tipo: TipoMagia) => (tipo === 'Invocacao' ? 'Invocação' : tipo);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`relative rounded-lg p-3 cursor-pointer transition-colors w-full 
      ${isSelected ? 'bg-blue-800 border-2 border-blue-500' : 'bg-[#161616] hover:bg-[#202020]'}`}
      onClick={() => onSelect(magia)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h2 className="text-base font-semibold text-white">{magia.nome}</h2>
          <div
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative"
          >
            <HelpCircle size={14} className="text-gray-400 cursor-help" />
            {showTooltip && (
  <div className="absolute left-4 top-0 z-50 bg-zinc-700 text-white text-xs p-3 rounded-md shadow-lg w-60">

    {/* Exibe Cura */}
    {magia.cura && magia.cura.length > 0 && (
      magia.cura.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Cura: {c.curaMin} - {c.curaMax}</p>
          <p>Custo: {c.custo} PM</p>
          <p>Alvo: {c.alvos}</p>
          <p>Tipo Alvo: {c.tipoAlvo}</p>
        </div>
      ))
    )}

    {/* Exibe Potencialização (Buff) */}
    {magia.buff && magia.buff.length > 0 && (
      magia.buff.map((p) => (
        <div key={p.id} className="mb-2">
          <p className="font-bold">{p.grau.replace("Grau", "")}º Grau</p>
          <p>Duração: {p.duracao} turnos</p>
          <p>Custo: {p.custo} PM</p>
          <p>Alvo: {p.alvos}</p>
          <p>Tipo Alvo: {p.tipoAlvo}</p>
        </div>
      ))
    )}
    
    {/* Exibe Purificação */}
{magia.cleanse && magia.cleanse.length > 0 && (
  magia.cleanse.map((p) => (
    <div key={p.id} className="mb-2">
      <p className="font-bold">{p.grau.replace("Grau", "")}º Grau</p>
      <p>Purifica: {p.purifica}</p>
      <p>Alvo: {p.alvos}</p>
      <p>Tipo Alvo: {p.tipoAlvo}</p>
      <p>Custo: {p.custo} PM</p>
    </div>
  ))
)}

{magia.movimento && magia.movimento.length > 0 && (
  magia.movimento.map((p) => (
    <div key={p.id} className="mb-2">
      <p className="font-bold">{p.grau.replace("Grau", "")}º Grau</p>
      <p>Distancia: {p.distancia}</p>
      <p>Alvo: {p.alvos}</p>
      <p>Tipo Alvo: {p.tipoAlvo}</p>
      <p>Custo: {p.custo} PM</p>
    </div>
  ))
)}

{magia.dano && magia.dano.length > 0 && (
      magia.dano.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Dano: {c.danoMin} - {c.danoMax}</p>
          <p>Custo: {c.custo} PM</p>
          <p>Alvo: {c.alvos}</p>
          <p>Tipo Alvo: {c.tipoAlvo}</p>
        </div>
      ))
    )}

{magia.dot && magia.dot.length > 0 && (
      magia.dot.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Dano: {c.danoMin} - {c.danoMax}</p>
          <p>Custo: {c.custo} PM</p>
          <p>Alvo: {c.alvos}</p>
          <p>Tipo Alvo: {c.tipoAlvo}</p>
          <p>Duração: {c.duracao}</p>
        </div>
      ))
    )}

    {magia.debuff && magia.debuff.length > 0 && (
      magia.debuff.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Custo: {c.custo} PM</p>
          <p>Alvo: {c.alvo}</p>
          <p>Tipo Alvo: {c.tipoAlvo}</p>
        </div>
      ))
    )}

{magia.curse && magia.curse.length > 0 && (
      magia.curse.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Custo: {c.custo} PM</p>
          <p>Alvo: {c.alvo}</p>
          <p>Tipo Alvo: {c.tipoAlvo}</p>
        </div>
      ))
    )}

{magia.escudo && magia.escudo.length > 0 && (
      magia.escudo.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Escudo: {c.escudoMin} - {c.escudoMax}</p>
          <p>Custo: {c.custo} PM</p>
          <p>Alvo: {c.alvo}</p>
          <p>Tipo Alvo: {c.tipoAlvo}</p>
        </div>
      ))
    )}

    {magia.moveIni && magia.moveIni.length > 0 && (
      magia.moveIni.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Custo: {c.custo} PM</p>
          <p>Alvo: {c.alvo}</p>
          <p>Tipo Alvo: {c.tipoAlvo}</p>
          <p>Distancia: {c.distancia}</p>
        </div>
      ))
    )}

    {magia.resguardo && magia.resguardo.length > 0 && (
      magia.resguardo.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Custo: {c.custo} PM</p>
          <p>Alvo: {c.alvo}</p>
          <p>Tipo Alvo: {c.tipoAlvo}</p>
        </div>
      ))
    )}
 
{magia.zumbi && magia.zumbi.length > 0 && (
      magia.zumbi.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Dano: {c.invoATKMin} - {c.invoATKMax}</p>
          <p>Custo: {c.custo} PM</p>
          <p>Vida: {c.invoPV}</p>
        </div>
      ))
    )}

{magia.golem && magia.golem.length > 0 && (
      magia.golem.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Dano: {c.invoATKMin} - {c.invoATKMax}</p>
          <p>Custo: {c.custo} PM</p>
          <p>Vida: {c.invoPV}</p>
          <p>Armadura: {c.armadura}</p>
        </div>
      ))
    )}

    
{magia.bicho && magia.bicho.length > 0 && (
      magia.bicho.map((c) => (
        <div key={c.id} className="mb-2">
          <p className="font-bold">{c.grau.replace("Grau", "")}º Grau</p>
          <p>Ataque: {c.invoATKMin} - {c.invoATKMax}</p>
          <p>Dano: {c.invoDMGMin} - {c.invoDMGMax}</p>
          <p>Custo: {c.custo} PM</p>
          <p>Vida: {c.invoPV}</p>
       
        </div>
      ))
    )}

    {/* Caso não exista nenhum subtipo */}
    {(!magia.cura || magia.cura.length === 0) &&
     (!magia.buff || magia.buff.length === 0) &&
     (!magia.cleanse || magia.cleanse.length === 0) && 
     (!magia.movimento || magia.movimento.length === 0) &&
     (!magia.dano || magia.dano.length === 0) &&
     (!magia.dot || magia.dot.length === 0) &&
     (!magia.debuff || magia.debuff.length === 0) &&
     (!magia.curse || magia.curse.length === 0) &&
     (!magia.moveIni || magia.moveIni.length === 0) &&
     (!magia.escudo || magia.escudo.length === 0) &&
     (!magia.resguardo || magia.resguardo.length === 0) &&
     (!magia.zumbi|| magia.zumbi.length === 0) &&
     (!magia.golem|| magia.golem.length === 0) &&
     (!magia.bicho|| magia.bicho.length === 0) &&(
      <p className="italic text-gray-400">Sem informações de graus</p>
    )}

  </div>
)}

          </div>
        </div>
        <p className="text-sm text-gray-400 text-right">{displayTipo(magia.tipo)}</p>
      </div>
    </div>
  );
};

interface MagiaFormProps {
    magiaParaEditar?: Magia | null; 
    onClose: () => void;
    onSave: () => void; 
    personagemId: number;
}

// Modal/Formulário para Criar/Editar Magia
const MagiaForm: React.FC<MagiaFormProps> = ({ magiaParaEditar, onClose, onSave, personagemId }) => {
    const [nome, setNome] = useState(magiaParaEditar?.nome || '');
    const [tipo, setTipo] = useState<TipoMagia>(magiaParaEditar?.tipo || 'Ataque'); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [subtipo, setSubtipo] = useState<string>('');

const subtiposDeMagia = [
  { value: 'Cura', label: 'Cura' },
  { value: 'Potencializacao', label: 'Potencialização' },
  { value: 'Purificacao', label: 'Purificação' },
  { value: 'Movimento', label: 'Movimento' },
  { value: 'Dano', label: 'Dano' },
  { value: 'Dano_progressivo', label: 'Dano Progressivo' },
  { value: 'Debilitante', label: 'Debilitante' },
  { value: 'Opressora', label: 'Opressora' },
  { value: 'Disruptiva', label: 'Disruptiva' },
  { value: 'Escudo', label: 'Escudo' },
  { value: 'Resguardo', label: 'Resguardo' },
  { value: 'Necromancia', label: 'Necromancia' },
  { value: 'Animacao', label: 'Animação' },
  { value: 'Evocacao', label: 'Evocação' },
];

    // Tipos de magia ajustados conforme o enum Tipo no schema.prisma
    const tiposDeMagia: { value: TipoMagia, label: string }[] = [
        { value: 'Apoio', label: 'Apoio' },
        { value: 'Ataque', label: 'Ataque' },
        { value: 'Controle', label: 'Controle' },
        { value: 'Defesa', label: 'Defesa' },
        { value: 'Invocacao', label: 'Invocação' }, 
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const isEditing = !!magiaParaEditar;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing 
            ? `http://localhost:3000/magias/${magiaParaEditar.id}`
            : 'http://localhost:3000/magias';

        const dataToSend = { nome, tipo,subtipo,  personagemId: personagemId };

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = `Erro ao ${isEditing ? 'atualizar' : 'salvar'} a magia.`;
                try {
                     const errorData = JSON.parse(errorText);
                     if(errorData.erro?.message) {
                        errorMessage = errorData.erro.message; 
                     } else if (errorData.erro?.issues && errorData.erro.issues.length > 0) {
                        errorMessage = errorData.erro.issues.map((i: any) => i.message).join('; ');
                     } else if (errorData.erro) {
                        errorMessage = JSON.stringify(errorData.erro);
                     }
                } catch {} 
                
                throw new Error(errorMessage);
            }

            onSave(); 
            onClose();

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 p-8 rounded-xl shadow-2xl w-full max-w-sm relative text-white">
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-white hover:text-gray-400"
                >
                    <X size={24} />
                </button>
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        {magiaParaEditar ? 'Editar Magia' : 'Nova Magia'}
                    </h2>
                    
                    {error && <div className="bg-red-800 text-white p-3 rounded mb-4 text-sm">{error}</div>}

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full p-2 bg-[#161616] border border-[#333] rounded focus:border-blue-500"
                            placeholder="Ex: Bola de Fogo"
                            required
                        />
                    </div>

                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as TipoMagia)}
                            className="w-full p-2 bg-[#161616] border border-[#333] rounded focus:border-blue-500"
                            required
                        >
                            <option value="" disabled>Selecione um tipo de magia</option>
                            {tiposDeMagia.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mb-6">
  <label className="block text-sm font-medium mb-1">Subtipo</label>
  <select
    value={subtipo}
    onChange={(e) => setSubtipo(e.target.value)}
    className="w-full p-2 bg-[#161616] border border-[#333] rounded focus:border-blue-500"
    required
  >
    <option value="" disabled>Selecione um subtipo</option>
    {subtiposDeMagia.map((s) => (
      <option key={s.value} value={s.value}>{s.label}</option>
    ))}
  </select>
</div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !nome}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Processando...' : (magiaParaEditar ? 'Salvar Edição' : 'Adicionar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Magia() {
    const { id } = useParams<{ id: string }>()
    const [personagem, setPersonagem] = useState<Personagem | null>(null)
    const [personagensList, setPersonagensList] = useState<Personagem[]>([]) 
    const { usuario } = useUsuarioStore()
    
    // Estados para Magias e CRUD
    const [magias, setMagias] = useState<Magia[]>([])
    const [selectedMagia, setSelectedMagia] = useState<Magia | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Controle do menu lateral
    const [isMenuOpen, setIsMenuOpen] = useState(true) 
    const toggleMenu = () => { setIsMenuOpen(prev => !prev); }
    
    // Função para recarregar a lista de magias
    const refreshMagias = () => {
        fetchMagias(setMagias);
        setSelectedMagia(null);
    };

    // Função para deletar a magia
    const handleDelete = async () => {
        if (!selectedMagia || !window.confirm(`Tem certeza que deseja excluir a magia "${selectedMagia.nome}"?`)) {
            return;
        }
    
        try {
            const url = `http://localhost:3000/magias/${selectedMagia.id}`;
            const res = await fetch(url, { method: 'DELETE' });
    
            if (!res.ok) {
                throw new Error("Erro ao excluir a magia.");
            }
            refreshMagias();
        } catch (err) {
            console.error("Erro ao deletar magia:", err);
            alert("Falha ao excluir a magia.");
        }
    }
    
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedMagia(null); 
    };
    
    const handleEditClick = () => { 
        if (selectedMagia) {
            setIsFormOpen(true);
        }
    }

    // Busca a lista completa de personagens (filtrada pelo usuário)
    const fetchPersonagensList = async () => {
        if (!usuario?.id) { return; }
        try {
            const res = await fetch(`http://localhost:3000/personagens?usuarioId=${usuario.id}`);
            if (!res.ok) throw new Error("Erro na requisição da lista de personagens.");
            const data: Personagem[] = await res.json();
            setPersonagensList(data);
        } catch (err) {
            console.error("Erro ao buscar lista de personagens:", err);
        }
    }
    
    // Efeitos
    useEffect(() => {
        fetchPersonagem(id, setPersonagem);
        refreshMagias();
        
        if (usuario?.id){
            fetchPersonagensList();
        }
    }, [id, usuario?.id])

    if (!personagem) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Carregando Magias...
            </div>
        )
    }

    const ManaAfincoDisplay = () => (
        <div className="bg-[#161616] rounded-lg p-4 lg:p-6 flex flex-col gap-4 w-full max-w-sm text-center">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h1 className="text-sm">Pontos de Mana</h1>
                    {/* Aqui usei 95 como valor máximo, ajuste conforme a sua lógica */}
                    <h1 className="bg-black py-2 px-3 rounded-md text-xl font-bold mt-1">
                        {personagem.status?.mana} 
                    </h1>
                </div>
                <div>
                    <h1 className="text-sm">Pontos de Afinco</h1>
                    {/* Aqui usei 12 como valor máximo, ajuste conforme a sua lógica */}
                    <h1 className="bg-black py-2 px-3 rounded-md text-xl font-bold mt-1">
                        {personagem.status?.afinco} 
                    </h1>
                </div>
            </div>
        </div>
    );
    
    const BotoesAcoes = () => {
        const isSelected = !!selectedMagia;

        return (
            <div className="flex justify-center gap-4 mt-8">
                <button 
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
                    onClick={() => {
                        setSelectedMagia(null); 
                        setIsFormOpen(true);
                    }} 
                >
                    <Plus size={18} /> Nova Magia
                </button>
                <button 
                    className={`text-sm font-bold py-2 px-4 rounded transition duration-200 
                                ${isSelected ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={handleEditClick}
                    disabled={!isSelected}
                >
                    Editar
                </button>
                <button 
                    className={`text-sm font-bold py-2 px-4 rounded transition duration-200 
                                ${isSelected ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={handleDelete}
                    disabled={!isSelected}
                >
                    Excluir
                </button>
            </div>
        );
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
            <div className={`w-full ${isMenuOpen ? 'pl-[250px]' : 'pl-[80px]'} max-w-[1600px] p-8 transition-all duration-300 mx-auto overflow-y-auto flex flex-col items-center`}>
                
                {/* Seção 1: Imagem e Mana/Afinco */}
                <div className="flex flex-col items-center justify-center gap-6 mb-12">
                    <img src={personagem.foto} 
                        className="w-[180px] h-auto rounded-lg object-cover"
                        alt={`Foto de ${personagem.nome}`}
                    />
                    <ManaAfincoDisplay />
                </div>
                
                {/* Seção 2: Lista de Magias */}
                <h2 className="text-xl font-bold mb-4 text-white">Lista de Magias</h2>
                <div className="w-full max-w-lg flex flex-col">
                    
                    {/* Cabeçalho da Lista (Simulando o layout da tabela) */}
                    <div className="grid grid-cols-2 text-gray-400 font-semibold border-b border-gray-700 pb-2 mb-3 px-3">
                        <span className="text-left uppercase">Nome</span>
                        <span className="text-right uppercase">Tipo</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {magias.length > 0 ? (
                            magias.map(magia => (
                                <MagiaItem 
                                    key={magia.id} 
                                    magia={magia} 
                                    isSelected={magia.id === selectedMagia?.id} 
                                    onSelect={setSelectedMagia}
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-500 mt-10">
                                Nenhuma magia cadastrada.
                            </div>
                        )}
                    </div>
                </div>

                {/* Seção 3: Botões de Ação */}
                <BotoesAcoes />

            </div>
            
            {/* Modal do Formulário */}
            {isFormOpen && (
                <MagiaForm 
                    magiaParaEditar={selectedMagia} 
                    onClose={handleCloseForm}
                    onSave={refreshMagias} 
                    personagemId={personagem.id}
                />
            )}
        </div>
    )
}