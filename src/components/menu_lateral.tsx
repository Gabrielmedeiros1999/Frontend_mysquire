import { Link, useLocation, useNavigate } from "react-router-dom"
import type { Personagem } from "../ficha";
import { useUsuarioStore } from "../context/UsuarioContext";

interface MenuLateralProps {
    personagem: Personagem| null;
    isMenuOpen: boolean;
    toggleMenu: () => void;
    personagemId: number; 
    personagensList: Personagem[]; 
}

export default function MenuLateral({ personagem, isMenuOpen, toggleMenu, personagemId, personagensList }: MenuLateralProps) {
    
    const location = useLocation()
    const navigate = useNavigate();
    const { deslogaUsuario } = useUsuarioStore();

    const handleLogout = () => {
     // limpa o contexto e o localStorage
    deslogaUsuario();
    localStorage.removeItem("usuario");

     // redireciona para login ou tela inicial
    navigate("/login");
   };
    
    if (!personagem) {
        // Renderiza um menu simples ou tela de carregamento se o personagem não estiver carregado
        return (
            <div className="bg-[#121212] w-[8rem] min-h-screen border-r-2 border-[#8A8A8A] flex flex-col transition-all duration-300">
                <div className={`flex flex-col justify-between pt-10 pl-8 border-r-2 border-t-2 border-[#8A8A8A] w-full`}>
                    <div className="flex flex-col gap-4">
                        <img src="/personagem.png" alt="Carregando" className="size-16" />
                        <Link to='/cadPersonagem'><img src="/mais.png" alt="" className="size-16"/></Link>
                    </div>
                    <button onClick={handleLogout}>
                     <img src="/Logout.png" alt="Sair" className="size-14 mb-4 cursor-pointer hover:opacity-80 transition-opacity" />
                    </button>
                </div>
            </div>
        );
    }
    
   // Destacar item conforme a rota atual
const getHighlightClass = (path: string) => {
    return location.pathname === path
        ? 'bg-[#8A8A8A]/30 border-l-4 border-white'
        : '';
};

    const menuWidthClass = isMenuOpen ? 'w-[30%]' : 'w-[8rem]'; 
    const navContentClass = isMenuOpen ? 'w-[75%] opacity-100 transition-opacity duration-300' : 'w-0 opacity-0 transition-opacity duration-100 overflow-hidden';
    const mainIconColClass = isMenuOpen ? 'w-[25%]' : 'w-full';
    
const afinidadeMap: Record<string, string> = {
    Restricao: "Restrição",
    Parcialidade: "Parcialidade",
    Totalidade: "Totalidade"
};

    return (
        <div className={`bg-[#121212] ${menuWidthClass} min-h-screen border-r-2 border-[#8A8A8A] flex flex-col transition-all duration-300  left-0 top-0 bottom-0 z-10`}>
            <div className="flex flex-row flex-grow">
                
                {/* Coluna de Ícones */}
                <div className={`flex flex-col justify-between pt-10 pl-4 border-r-2 border-t-2 border-[#8A8A8A] ${mainIconColClass}`}>
                    <div className=" flex flex-col gap-4">
                        <Link to='/carouselPersonagem'><img src="/volta.png" alt="" className="size-8"/></Link>
                        {/* ÍCONE DO PERSONAGEM */}
                        <img 
                            src={personagem.foto || "/personagem.png"} // Use a foto do personagem se disponível
                            alt="Ficha" 
                            className="size-16 lg:size-11 cursor-pointer rounded-full ring-4 ring-white " 
                            onClick={toggleMenu} // Chama a função para abrir/fechar
                        />
                        
                        {/* 2. LISTA DE OUTROS PERSONAGENS */}
                        {personagensList
                            // Filtra o personagem atual para não repetir
                            .filter(p => p.id !== personagemId) 
                            // Mapeia os outros personagens para ícones
                            .map(p => (
                                <Link key={p.id} to={`/personagens/${p.id}`} title={p.nome}>
                                    <img 
                                        // Use a foto ou um ícone de fallback
                                        src={p.foto || "/personagem.png"} 
                                        alt={p.nome} 
                                        className="size-14 lg:size-10 cursor-pointer rounded-full opacity-60 hover:opacity-100 transition-opacity duration-150 "
                                    />
                                </Link>
                            ))}
                            
                        <Link to='/cadPersonagem'><img src="/mais.png" alt="" className="size-16"/></Link>
                    </div>
                    <Link to='/'><img src="/Logout.png" alt="" className="size-14 mb-4"/></Link>
                </div>

                {/* Conteúdo do Menu (Escondido quando recolhido) */}
                <div className={`${navContentClass} flex flex-col`}>
                    {isMenuOpen && ( 
                        <>
                            <div className="text-2xl py-4 border-b-2 border-[#8A8A8A] ">
                                <div className="pl-4 flex flex-col gap-">
                                    <div className="flex flex-col font-bold">
                                        <h1>Nome do Personagem: </h1>
                                        <h1 >{personagem.nome}</h1>
                                    </div>
                                    <div>
                                        <h2>Afinidade Mística: {afinidadeMap[personagem.afinidade] || personagem.afinidade}</h2>
                                        <h2>Raça: {personagem.raca}</h2>
                                        <h2>Ranque: {personagem.ranque}</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col mt-10 pb-20 gap-6">
                                {/* Itens do Menu */}
                                <Link to={`/personagens/${personagemId}`}>
                                    <div className={`flex flex-row items-center pl-4 gap-4 transition-colors duration-200 hover:bg-[#8A8A8A]/30 ${getHighlightClass(`/personagens/${personagemId}`)}`}>
                                        <img src="/ficha.png" alt="" className="size-16 border-2 border-white"/>
                                        <h2 className="text-lg">Ficha</h2>
                                    </div>
                                </Link>
                                <Link to={`/personagens/${personagemId}/atributos`}>
                                <div className={`flex flex-row items-center pl-4 gap-4 transition-colors duration-200 hover:bg-[#8A8A8A]/30 ${getHighlightClass(`/personagens/${personagemId}/atributos`)}`}>
                                    <img src="/atributo.png" alt="" className="size-16 border-2 border-white"/>
                                    <h2 className="text-lg">Atributos</h2>
                                </div>
                                </Link>
                                <Link to={`/personagens/${personagemId}/equipamentos`}>
                                <div className={`flex flex-row items-center pl-4 gap-4 transition-colors duration-200 hover:bg-[#8A8A8A]/30 ${getHighlightClass(`/personagens/${personagemId}/equipamentos`)}`}>
                                    <img src="/equipamento.png" alt="" className="size-16 border-2 border-white"/>
                                    <h2 className="text-lg">Equipamentos</h2>
                                </div>
                                </Link>
                                <Link to={`/personagens/${personagemId}/magias`}>
                                <div className={`flex flex-row items-center pl-4 gap-4 transition-colors duration-200 hover:bg-[#8A8A8A]/30 ${getHighlightClass(`/personagens/${personagemId}/magias`)}`}>
                                    <img src="/magia.png" alt="" className="size-16 border-2 border-white"/>
                                    <h2 className="text-lg">Magias</h2>
                                </div>
                                </Link>
                                 <Link to={`/personagens/${personagemId}/mapas`}>
                                <div className={`flex flex-row items-center pl-4 gap-4 transition-colors duration-200 hover:bg-[#8A8A8A]/30 ${getHighlightClass(`/personagens/${personagemId}/mapas`)}`}>
                                    <img src="/mapa.png" alt="" className="size-16 border-2 border-white"/>
                                    <h2 className="text-lg">Mapas</h2>
                                </div>
                                </Link>
                                <Link to={`/personagens/${personagemId}/anotacoes`}>
                                <div className={`flex flex-row items-center pl-4 gap-4 transition-colors duration-200 hover:bg-[#8A8A8A]/30 ${getHighlightClass(`/personagens/${personagemId}/anotacoes`)}`}>
                                    <img src="/anota.png" alt="" className="size-16 border-2 border-white"/>
                                    <h2 className="text-lg">Anotações</h2>
                                </div>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}