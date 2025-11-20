import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom";

type Inputs = {
    nome: string
    email: string
    senha: string
    senha2: string
}

const apiUrl = import.meta.env.VITE_API_URL


export default function CadCliente() {
    const { register, handleSubmit } = useForm<Inputs>()
    const navigate = useNavigate()

    async function cadastraCliente(data: Inputs) {

        if (data.senha != data.senha2) {
            toast.error("Erro... Senha e Confirme Senha precisam ser iguais")
            return
        }
        
        if (data.nome.length < 10) {
            toast.error("Erro... Nome  deve possuir no mínimo 10 caracteres")
            return
        }

        const response = await
            fetch(`${apiUrl}/usuarios`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    nome: data.nome,
                    email: data.email,
                    senha: data.senha
                })
            })

        console.log(response)
        if (response.status == 201) {
            toast.success("Ok! Cadastro realizado com sucesso...")
            navigate("/")
        } else {
            toast.error("Erro... Não foi possível realizar o cadastro")
        }
    }

    return (
        <section>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-zinc-700 dark:border-zinc-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <div className="flex items-center justify-center  gap-10">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Criar Conta
                        </h1>
                        <img src="./icone.png" className="h-[8rem]" alt="Logo Jogo" />
                        </div>
                        <form className="space-y-4 md:space-y-6" 
                          onSubmit={handleSubmit(cadastraCliente)}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome:</label>
                                <input type="text" id="nome" className="bg-white border border-white text-black text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-white dark:placeholder-zinc-300 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Digite o seu nome de usuário" required 
                                    {...register("nome")} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">E-mail:</label>
                                <input type="email" id="email" className="bg-white border border-white text-black text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-white dark:placeholder-zinc-300 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Digite o seu e-mail" required 
                                    {...register("email")} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Senha de Acesso:</label>
                                <input type="password" id="password" placeholder="Digite sua senha" className="bg-white border border-white text-black text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-white dark:placeholder-zinc-300 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" required 
                                      {...register("senha")} />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirme a Senha:</label>
                                <input type="password" id="confirm-password" placeholder="Confirme sua senha" className="bg-white border border-white text-black text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-white dark:placeholder-zinc-300 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" required 
                                      {...register("senha2")} />
                            </div>
                            <button type="submit" className="w-full text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Criar sua Conta</button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Já possui uma conta? <Link to="/" className="font-medium text-orange-200  hover:underline dark:text-orange-200 ">Entrar</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}