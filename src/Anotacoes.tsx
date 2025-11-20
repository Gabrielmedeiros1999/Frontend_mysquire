import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import MenuLateral from './components/menu_lateral' 
import { Search } from "lucide-react" 
import { useUsuarioStore } from "./context/UsuarioContext" 

type Anotacoes = {
    id: number
    titulo: string
    subtitulo: string
    descricao: string
    personagemId: number
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
}

const fetchPersonagem = async (id: string | undefined, setPersonagem: React.Dispatch<React.SetStateAction<Personagem | null>>) => {
    if (!id) return;
    try {
        const res = await fetch(`http://localhost:3000/personagens/${id}`);
        if (!res.ok) throw new Error("Erro na requisição da Anotacação.");
        const data = await res.json();
        
        setPersonagem({ ...data });
    } catch (err) {
        console.error("Erro ao buscar personagem:", err);
    }
}

const fetchAnotacoes = async (personagemId: number, setAnotacoes: React.Dispatch<React.SetStateAction<Anotacoes[]>>) => {
    try {
        const res = await fetch(`http://localhost:3000/anotacoes`); 
        if (!res.ok) throw new Error("Erro na requisição das anotações.");
        const data: Anotacoes[] = await res.json();
        
        // Filtra as anotações
        const notasDoPersonagem = data.filter(nota => nota.personagemId === personagemId);
        
        setAnotacoes(notasDoPersonagem);

    } catch (err) {
        console.error("Erro ao buscar anotações:", err);
    }
}

interface AnotacaoItemProps {
    nota: Anotacoes;
    isSelected: boolean; 
    onSelect: (nota: Anotacoes) => void; 
}

const AnotacaoItem: React.FC<AnotacaoItemProps> = ({ nota, isSelected, onSelect }) => (
    <div 
        className={`bg-[#161616] rounded-lg p-4 cursor-pointer transition-colors 
                    ${isSelected ? 'bg-blue-800 border-2 border-blue-500' : 'hover:bg-[#202020]'}`}
        onClick={() => onSelect(nota)}
    >
        <h2 className="text-xl font-semibold text-white">{nota.titulo}</h2>
        <h3 className="text-sm text-gray-400">{nota.subtitulo}</h3>
        <p className="text-sm text-gray-300 line-clamp-2">{nota.descricao}</p>
    </div>
);

interface AnotacaoFormProps {
    personagemId: number;
    anotacaoParaEditar?: Anotacoes | null; 
    onClose: () => void;
    onSave: () => void; 
}

const AnotacaoForm: React.FC<AnotacaoFormProps> = ({ personagemId, anotacaoParaEditar, onClose, onSave }) => {
    const [titulo, setTitulo] = useState(anotacaoParaEditar?.titulo || '');
    const [subtitulo, setSubtitulo] = useState(anotacaoParaEditar?.subtitulo || '');
    const [descricao, setDescricao] = useState(anotacaoParaEditar?.descricao || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const isEditing = !!anotacaoParaEditar;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing 
            ? `http://localhost:3000/anotacoes/${anotacaoParaEditar.id}`
            : 'http://localhost:3000/anotacoes';

        const dataToSend = { titulo, subtitulo, descricao, personagemId };

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.erro?.message || `Erro ao ${isEditing ? 'atualizar' : 'salvar'} a anotação.`);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-zinc-800   p-8 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">
                    {anotacaoParaEditar ? 'Editar Anotação' : 'Nova Anotação'}
                </h2>
                
                {error && <div className="bg-red-800  text-white p-3 rounded mb-4">{error}</div>}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="w-full p-2 bg-[#161616] border border-[#333] rounded focus:border-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Subtítulo</label>
                    <input
                        type="text"
                        value={subtitulo}
                        onChange={(e) => setSubtitulo(e.target.value)}
                        className="w-full p-2 bg-[#161616] border border-[#333] rounded focus:border-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        rows={5}
                        className="w-full p-2 bg-[#161616] border border-[#333] rounded focus:border-blue-500 resize-none"
                    />
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
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : (anotacaoParaEditar ? 'Salvar Edição' : 'Salvar Nota')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default function Anotacao() {
    const { id } = useParams<{ id: string }>()
    const [personagem, setPersonagem] = useState<Personagem | null>(null)
    const [personagensList, setPersonagensList] = useState<Personagem[]>([])
    const [anotacoes, setAnotacoes] = useState<Anotacoes[]>([])
    const [isMenuOpen, setIsMenuOpen] = useState(true) 
    
    // Estados para CRUD
    const [isFormOpen, setIsFormOpen] = useState(false); 
    const [selectedAnotacao, setSelectedAnotacao] = useState<Anotacoes | null>(null);
    
    // Estado para busca
    const [searchTerm, setSearchTerm] = useState('');
    
    //Obtém o usuário logado
    const { usuario } = useUsuarioStore(); 

    const toggleMenu = () => { setIsMenuOpen(prev => !prev); }
    
    //Função para buscar a lista de personagens, filtrada pelo usuário
    const fetchPersonagensList = async () => {
        // Sai se o ID do usuário não estiver carregado
        if (!usuario?.id) return;

        try {
            // Adiciona o filtro usuarioId na URL
            const res = await fetch(`http://localhost:3000/personagens?usuarioId=${usuario.id}`);
            if (!res.ok) throw new Error("Erro na requisição da lista de personagens.");
            const data: Personagem[] = await res.json();
            setPersonagensList(data);
        } catch (err) {
            console.error("Erro ao buscar lista de personagens:", err);
        }
    };
    
    const refreshAnotacoes = () => {
        if (personagem) {
            fetchAnotacoes(personagem.id, setAnotacoes);
        }
    };
    
    const handleEditClick = () => { 
        if (selectedAnotacao) {
            setIsFormOpen(true);
        }
    }
    
    const handleDelete = async () => {
        if (!selectedAnotacao || !window.confirm(`Tem certeza que deseja excluir a nota "${selectedAnotacao.titulo}"?`)) {
            return;
        }
    
        try {
            const url = `http://localhost:3000/anotacoes/${selectedAnotacao.id}`;
            const res = await fetch(url, {
                method: 'DELETE',
            });
    
            if (!res.ok) {
                throw new Error("Erro ao excluir a anotação.");
            }
    
            // Limpa a seleção e atualiza a lista
            setSelectedAnotacao(null);
            refreshAnotacoes();
    
        } catch (err) {
            console.error("Erro ao deletar anotação:", err);
            alert("Falha ao excluir a anotação.");
        }
    }

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedAnotacao(null);
    };

    // Efeitos
    useEffect(() => {
        fetchPersonagem(id, setPersonagem);
        
        // Chamada da lista de personagens agora depende do usuário estar carregado
        if (usuario?.id) {
            fetchPersonagensList();
        }
    }, [id, usuario?.id]) // Adicionamos usuario.id como dependência
    
    useEffect(() => { 
        if(personagem) {
             refreshAnotacoes();
        }
    }, [personagem])

     if (!personagem) {
                return (
                    <div className="min-h-screen bg-black text-white flex items-center justify-center">
                        Carregando Anotações...
                    </div>
                )
            }

    const filteredAnotacoes = anotacoes.filter(nota =>
        nota.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const BotoesAcoes = () => {
        const isSelected = !!selectedAnotacao;

        return (
            <div className="flex justify-center gap-4 mt-8">
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                    onClick={() => {
                        setSelectedAnotacao(null); 
                        setIsFormOpen(true);
                    }} 
                >
                    Nova Nota
                </button>
                <button 
                    className={`font-bold py-2 px-4 rounded transition duration-200 
                                ${isSelected ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={handleEditClick}
                    disabled={!isSelected}
                >
                    Editar Nota
                </button>
                <button 
                    className={`font-bold py-2 px-4 rounded transition duration-200 
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
                personagensList={personagensList} // Agora esta lista está filtrada
            /> 
            <div className="w-full max-w-[1600px] p-8 overflow-y-auto"> 

                {/* Seção 1: Imagem e Contador de Notas */}
                <div className="flex flex-col items-center justify-center gap-6 mb-12">
                    <img 
                        src={personagem.foto} 
                        className="w-[220px] md:w-[260px] lg:w-[300px] h-auto rounded-lg object-cover"
                    />
                    
                    <div className="bg-[#161616] rounded-lg p-4 lg:p-6 flex flex-col gap-4 w-full max-w-sm text-center">
                        <h1 className="text-xl md:text-2xl lg:text-lg">Notas</h1>
                        <h1 className="bg-black py-2 px-3 rounded-md text-3xl md:text-3xl lg:text-3xl font-bold">
                            {anotacoes.length}
                        </h1>
                    </div>
                </div>

                {/* Seção 2: Busca */}
                <div className="flex justify-center mb-8">
                    <div className="w-full max-w-xl flex items-center bg-[#161616] rounded-lg p-2">
                        <input 
                            type="text" 
                            placeholder="Digite o título da nota" 
                            className="bg-transparent w-full focus:outline-none text-white px-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="w-5 h-5 text-gray-400 cursor-pointer" />
                    </div>
                </div>

                {/* Seção 3: Lista de Anotações */}
                <div className="flex flex-col items-center bg-black">
                    <div className="w-full max-w-xl flex flex-col gap-4">
                        {filteredAnotacoes.length > 0 ? (
                            filteredAnotacoes.map(nota => (
                                <AnotacaoItem 
                                    key={nota.id} 
                                    nota={nota} 
                                    isSelected={nota.id === selectedAnotacao?.id} 
                                    onSelect={setSelectedAnotacao}
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-500 mt-10 ">
                                {searchTerm ? `Nenhuma nota encontrada com o termo "${searchTerm}".` : 'Nenhuma anotação criada.'}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Seção 4: Botões de Ação */}
                <BotoesAcoes />

            </div>
            
            {/* Modal do Formulário */}
            {isFormOpen && personagem && (
                <AnotacaoForm 
                    personagemId={personagem.id}
                    anotacaoParaEditar={selectedAnotacao} 
                    onClose={handleCloseForm}
                    onSave={refreshAnotacoes} 
                />
            )}
        </div>
    )
}