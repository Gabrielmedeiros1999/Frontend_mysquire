import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useUsuarioStore } from "./context/UsuarioContext"
import { useState } from "react"

type Inputs = {
  email: string
  senha: string
  manter: boolean
}

const apiUrl = import.meta.env.VITE_API_URL

export default function App() {
  const { register, handleSubmit } = useForm<Inputs>()    
  const { logaUsuario } = useUsuarioStore()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)

  // --- Função para timeout do fetch ---
  function fetchTimeout(url: string, options: RequestInit, timeout = 6000) {
    return Promise.race([
      fetch(url, options),
      new Promise((_res, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeout)
      )
    ])
  }

  async function verificaLogin(data: Inputs) {

    if (isLoading) return; // evita clique duplo
    setIsLoading(true)

    try {
      const response: any = await fetchTimeout(`${apiUrl}/usuarios/login`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ email: data.email, senha: data.senha })
      })

      if (!response.ok) {
        toast.error("Login ou senha incorretos")
        setIsLoading(false)
        return
      }

      const dados = await response.json()

      // Salva no contexto
      logaUsuario(dados)

      // Salva no localStorage apenas se marcado
      if (data.manter) {
        localStorage.setItem("usuario", JSON.stringify(dados))
      } else {
        localStorage.removeItem("usuario")
      }

      toast.success("✓ Login realizado!")
      navigate("/carouselPersonagem", { replace: true })

    } catch (err: any) {
      toast.error("Erro de conexão com o servidor")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section>
      <p style={{ height: 48 }}></p>
      <div className="flex flex-col items-center mx-auto md:h-screen">
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-zinc-700">
          <div className="md:space-y-6 sm:p-8">
            <div className="flex justify-center">
              <img src="./icone.png" className="h-[3811] w-[22502]" alt="Logo Jogo" />
            </div>

            <form className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(verificaLogin)}>

              <div>
                <label className="block mb-2 text-[22px] font-medium text-white">Seu e-mail</label>
                <input type="email" required {...register("email")}
                  className="bg-white border border-white text-black rounded-lg p-2.5 w-full" />
              </div>

              <div>
                <label className="block mb-2 text-[22px] font-medium text-white">Senha de Acesso</label>
                <input type="password" required {...register("senha")}
                  className="bg-white border border-white text-black rounded-lg p-2.5 w-full" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <input id="remember" type="checkbox" {...register("manter")}
                    className="w-4 h-4 border rounded bg-gray-50" />
                  <label htmlFor="remember" className="ml-3 text-gray-300">Manter Conectado</label>
                </div>
                <a className="text-sm font-medium text-orange-200 hover:underline">Esqueceu sua senha?</a>
              </div>

              <button type="submit"
                disabled={isLoading}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                           font-medium rounded-lg text-sm px-5 py-2.5">
                {isLoading ? "Entrando..." : "Entrar"}
              </button>

              <p className="text-sm font-light text-white">
                Ainda não possui conta? <Link to="/cadUsuario" className="font-medium text-orange-200 hover:underline">Cadastre-se</Link>
              </p>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}
