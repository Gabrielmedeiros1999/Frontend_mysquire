import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import MenuLateral from "./components/menu_lateral";
import { useUsuarioStore } from "./context/UsuarioContext";
import { Plus, X, Trash2, Eraser, Pencil } from "lucide-react"; 
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

export type Personagem = {
  id: number;
  nome: string;
  idade: number;
  raca: string;
  ranque: number;
  experiencia: number;
  altura: string;
  afinidade: string;
  caracteristicas?: string;
  background?: string;
  foto: string;
  movimento: string;
};

type Mapa = {
  id: number;
  nome: string;
  imagem?: string;
  personagemId: number;
};

const fetchPersonagem = async (
  id: string | undefined,
  setPersonagem: React.Dispatch<React.SetStateAction<Personagem | null>>
) => {
  if (!id) return;
  try {
    const res = await fetch(`http://localhost:3000/personagens/${id}`);
    if (!res.ok) throw new Error("Erro na requisição do personagem.");
    const data = await res.json();
    setPersonagem(data);
  } catch (err) {
    console.error("Erro ao buscar personagem:", err);
  }
};

const fetchMapas = async (
  personagemId: number,
  setMapas: React.Dispatch<React.SetStateAction<Mapa[]>>
) => {
  try {
    const res = await fetch(`http://localhost:3000/mapas`);
    if (!res.ok) throw new Error("Erro na requisição dos mapas.");
    const data: Mapa[] = await res.json();
    const filtrados = data.filter((m) => m.personagemId === personagemId);
    setMapas(filtrados);
  } catch (err) {
    console.error("Erro ao buscar mapas:", err);
  }
};

interface MapaFormProps {
  onClose: () => void;
  onSave: () => void;
  personagemId: number;
}

const MapaForm: React.FC<MapaFormProps> = ({ onClose, onSave, personagemId }) => {
  const [nome, setNome] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Converter arquivo em Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImagem(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const payload: any = {
      nome,
      personagemId: Number(personagemId)
      };

     if (imagem) {
      payload.imagem = imagem; 
      }

      const res = await fetch("http://localhost:3000/mapas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar o mapa.");

      onSave();
      onClose();
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 p-8 rounded-xl w-full max-w-sm text-white relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X size={24} />
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4">Novo Mapa</h2>

          {erro && <div className="bg-red-700 p-2 mb-3">{erro}</div>}

          {/* Nome */}
          <label className="block mb-1">Nome do Mapa</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 bg-[#161616] border border-[#333] rounded"
            required
          />

          {/* URL */}
          <label className="block mt-4 mb-1">Imagem por URL (opcional)</label>
          <input
            type="text"
            placeholder="https://exemplo.com/mapa.png"
            className="w-full p-2 bg-[#161616] border border-[#333] rounded"
            onChange={(e) => setImagem(e.target.value.trim() === "" ? null : e.target.value)}
          />

          {/* Upload */}
         <label className="block mt-4 mb-1">Ou enviar arquivo .png/.jpg (opcional) </label>

{/* Input escondido */}
<input
  id="upload"
  type="file"
  accept="image/*"
  onChange={handleFileUpload}
  className="hidden"
/>

{/* Botão estilizado */}
<label
  htmlFor="upload"
  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition"
>
  Escolher arquivo
</label>

          {/* Preview */}
          {imagem && (
            <img
              src={imagem}
              className="mt-4 w-full rounded border border-gray-600"
            />
          )}

          {/* Botões */}
          <div className="flex justify-end mt-6 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Mapas() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useUsuarioStore();
  const [personagem, setPersonagem] = useState<Personagem | null>(null);
  const [personagensList, setPersonagensList] = useState<Personagem[]>([]);
  const [mapas, setMapas] = useState<Mapa[]>([]);
  const [selectedMapa, setSelectedMapa] = useState<Mapa | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const stageRef = useRef<any>(null);
  const [lines, setLines] = useState<any[]>([]); 
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Estado para a cor atual do desenho (padrão preto)
  const [toolColor, setToolColor] = useState<string>("black"); 
  // Estado para a ferramenta ativa 
  const [tool, setTool] = useState<"pen" | "eraser">("pen"); 
  
  // Define a cor de fundo do Stage (para quando não houver mapa selecionado)
  const canvasBgClass = selectedMapa ? "bg-white" : "bg-zinc-900"; 
  
  // carregar imagem de fundo (do mapa salvo)
  const [background] = useImage(selectedMapa?.imagem || "");

  const handleMouseDown = (e: any) => {
    // DESABILITA O DESENHO SE NÃO HOUVER MAPA SELECIONADO
    if (!selectedMapa) return;
    
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    
    // Configura a linha com base na ferramenta
    let strokeColor = toolColor;
    let strokeWidth = 2;
    let compositeOperation = 'source-over';

    if (tool === 'eraser') {
      strokeColor = 'white'; 
      strokeWidth = 10;
      compositeOperation = 'destination-out'; 
    }
    
    setLines([...lines, { 
      tool: tool, 
      color: strokeColor, 
      points: [pos.x, pos.y], 
      strokeWidth: strokeWidth,
      compositeOperation: compositeOperation
    }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Função para limpar o desenho 
  const clearDrawing = () => {
    if (!window.confirm("Tem certeza que deseja limpar o desenho? Esta ação não pode ser desfeita.")) {
      return;
    }
    setLines([]); // Zera o array de linhas, limpando o desenho
  };

  // salvar o desenho
  const saveDrawing = async () => {
    if (!selectedMapa || !stageRef.current) {
      alert("Selecione um mapa para salvar.");
      return;
    }
    
    const dataUrl = stageRef.current.toDataURL({
        mimeType: "image/png",
        background: 'white', 
    });

    try {
      const res = await fetch(`http://localhost:3000/mapas/${selectedMapa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: selectedMapa.nome,
          personagemId: personagem?.id,
          imagem: dataUrl,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar o desenho.");
      alert("Mapa salvo com sucesso!");
      fetchMapas(personagem!.id, setMapas);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o mapa.");
    }
  };

  const handleDelete = async () => {
    if (!selectedMapa || !window.confirm(`Excluir o mapa "${selectedMapa.nome}"?`)) return;
    try {
      const res = await fetch(`http://localhost:3000/mapas/${selectedMapa.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir o mapa.");
      fetchMapas(personagem!.id, setMapas);
      setSelectedMapa(null);
    } catch (err) {
      console.error("Erro ao deletar mapa:", err);
      alert("Falha ao excluir o mapa.");
    }
  };

  const fetchPersonagensList = async () => {
    if (!usuario?.id) return;
    const res = await fetch(`http://localhost:3000/personagens?usuarioId=${usuario.id}`);
    const data = await res.json();
    setPersonagensList(data);
  };

  useEffect(() => {
    fetchPersonagem(id, setPersonagem);
    if (usuario?.id) fetchPersonagensList();
  }, [id, usuario?.id]);

  useEffect(() => {
    if (personagem?.id) fetchMapas(personagem.id, setMapas);
  }, [personagem]);
  
  // Efeito para limpar o desenho (lines) e resetar a ferramenta quando um NOVO mapa é selecionado
  useEffect(() => {
    setLines([]);
    setTool("pen");
    setToolColor("black");
  }, [selectedMapa]);

  if (!personagem) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando Mapas...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0F0C0F] text-white flex flex-row">
      <MenuLateral
        personagem={personagem}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        personagemId={personagem.id}
        personagensList={personagensList}
      />

      <div className={`w-full ${isMenuOpen ? "pl-[250px]" : "pl-[80px]"} p-8 transition-all duration-300 flex flex-col items-center`}>
        <h1 className="text-xl font-bold mb-6">Editor de Mapas</h1>

        {/* CONTAINER DO EDITOR - Flex para alinhar barra de ferramentas e Stage */}
        <div className="flex items-start">
          
          {/* BARRA DE FERRAMENTAS LATERAL */}
          <div className="flex flex-col items-center bg-zinc-900 border border-gray-700 rounded-l-lg p-2 mr-0 h-[300px]">
            {/* Ícone Lápis - Selecionar Ferramenta de Desenho */}
            <button
              onClick={() => setTool("pen")}
              disabled={!selectedMapa} // Desabilita se não houver mapa
              className={`p-2 rounded-lg transition-colors ${
                tool === "pen" && selectedMapa 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
              title="Caneta (Desenhar)"
            >
              <Pencil size={24} />
            </button>
            
            {/* Seletor de Cor - Aparece apenas com a ferramenta Lápis selecionada E mapa selecionado */}
            {tool === "pen" && selectedMapa && (
              <input 
                type="color" 
                value={toolColor} 
                onChange={(e) => setToolColor(e.target.value)} 
                className="w-8 h-8 rounded-full border-none cursor-pointer my-2"
                style={{ background: toolColor, WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', padding: 0 }}
                title="Cor da Tinta"
              />
            )}

            {/* Ícone Borracha - Selecionar Ferramenta de Apagar */}
            <button
              onClick={() => setTool("eraser")} // Agora apenas seleciona a ferramenta
              disabled={!selectedMapa} // Desabilita se não houver mapa
              className={`p-2 rounded-lg mt-2 transition-colors ${
                tool === "eraser" && selectedMapa
                  ? "bg-red-600 text-white" 
                  : "text-gray-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
              title="Borracha (Apagar)"
            >
              <Eraser size={24} />
            </button>
            
            {/* Botão LIMPAR TUDO - Mantido para resetar o desenho */}
            <button
              onClick={clearDrawing} 
              disabled={!selectedMapa || lines.length === 0}
              className={`p-2 rounded-lg mt-8 transition-colors ${
                selectedMapa && lines.length > 0 
                  ? "text-red-500 hover:bg-red-900" 
                  : "text-gray-600 cursor-not-allowed"
              }`}
              title="Limpar TODO o Desenho"
            >
              <Trash2 size={24} /> 
            </button>

          </div>

          {/* CANVAS PRINCIPAL (Stage) */}
          <Stage
            width={600}
            height={300}
            ref={stageRef}
            // Eventos de mouse só ativados se houver mapa selecionado 
            onMouseDown={selectedMapa ? handleMouseDown : undefined}
            onMousemove={selectedMapa ? handleMouseMove : undefined}
            onMouseup={selectedMapa ? handleMouseUp : undefined}
            // Fundo do Stage CONDICIONAL: branco se mapa selecionado, bg-gray-700 caso contrário.
            className={`border border-gray-700 rounded-r-lg ${canvasBgClass}`} 
            style={{
            cursor:
             !selectedMapa
             ? "not-allowed"
             : tool === "eraser"
             ? "url('/apaga.png') 0 16, auto"
             : "crosshair"
          }}
          >
            <Layer>
              {background && <KonvaImage image={background} width={600} height={300} />}
            </Layer>
            <Layer>
              {lines.map((line, i) => (
                <Line 
                  key={i} 
                  points={line.points} 
                  stroke={line.color} 
                  strokeWidth={line.strokeWidth} 
                  tension={0.5} 
                  lineCap="round" 
                  globalCompositeOperation={line.compositeOperation}
                />
              ))}
            </Layer>
          </Stage>
        </div>

        {/* Lista de mapas */}
        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          {mapas.length > 0 ? (
            mapas.map((mapa) => (
              <div
                key={mapa.id}
                onClick={() => setSelectedMapa(mapa)}
                className={`p-4 w-[160px] text-center rounded-lg cursor-pointer border transition 
                  ${selectedMapa?.id === mapa.id
                    ? "border-blue-500 bg-blue-800"
                    : "border-gray-700 bg-[#161616] hover:bg-[#202020]"}`}
              >
                {mapa.nome}
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-6">Nenhum mapa cadastrado.</p>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition"
          >
            <Plus size={18} /> Novo Mapa
          </button>

          <button
            onClick={saveDrawing}
            disabled={!selectedMapa}
            className={`font-bold py-2 px-4 rounded flex items-center gap-2 transition 
              ${selectedMapa
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
          >
            💾 Salvar Mapa
          </button>

          <button
            onClick={handleDelete}
            disabled={!selectedMapa}
            className={`font-bold py-2 px-4 rounded flex items-center gap-2 transition 
              ${selectedMapa
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
          >
            <Trash2 size={18} /> Excluir
          </button>
        </div>
      </div>

      {isFormOpen && (
        <MapaForm
          onClose={() => setIsFormOpen(false)}
          onSave={() => fetchMapas(personagem!.id, setMapas)}
          personagemId={personagem.id}
        />
      )}
    </div>
  );
}