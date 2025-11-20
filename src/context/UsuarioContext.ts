import type { UsuarioType } from '../utils/UsuarioType'
import { create } from 'zustand'

type UsuarioStore = {
  usuario: UsuarioType | null // 👈 agora pode ser null
  logaUsuario: (usuarioLogado: UsuarioType) => void
  deslogaUsuario: () => void
}

export const useUsuarioStore = create<UsuarioStore>((set) => ({
  usuario: null, // 👈 começa sem usuário logado
  logaUsuario: (usuarioLogado) => set({ usuario: usuarioLogado }),
  deslogaUsuario: () => set({ usuario: null }), // 👈 desloga limpando o usuário
}))

// 🔁 Restaura usuário salvo no localStorage ao iniciar o app
const usuarioSalvo = localStorage.getItem("usuario");
if (usuarioSalvo) {
  const parsed = JSON.parse(usuarioSalvo);
  useUsuarioStore.setState({ usuario: parsed });
}

