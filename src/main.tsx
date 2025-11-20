import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'sonner'
import ProtectedRoute from './components/ProtectedRoute.tsx'

import App from './App.tsx'
import CadUsuario from './CadUsuario.tsx'
import CarouselPersonagem from './CarouselPersonagem.tsx'
import CadPersonagem from './CadPersonagem.tsx'
import Ficha from './ficha.tsx'
import Atributo from './Atributos.tsx'
import Anotacao from './Anotacoes.tsx'
import Magia from './Magias.tsx'
import Mapa from './Mapas.tsx'
import Equipamento from './Equipamentos.tsx'

import Layout from './Layout.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const rotas = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'cadUsuario', element: <CadUsuario />},
      { path: 'carouselPersonagem', element: <CarouselPersonagem />},
      { path: 'cadPersonagem', element: <CadPersonagem />},
      // rotas protegidas — só acessa se estiver logado
      {
        path: 'personagens/:id',
        element: (
          <ProtectedRoute>
            <Ficha />
          </ProtectedRoute>
        ),
      },
      {
        path: 'personagens/:id/atributos',
        element: (
          <ProtectedRoute>
            <Atributo />
          </ProtectedRoute>
        ),
      },
      {
        path: 'personagens/:id/anotacoes',
        element: (
          <ProtectedRoute>
            <Anotacao />
          </ProtectedRoute>
        ),
      },
      {
        path: 'personagens/:id/magias',
        element: (
          <ProtectedRoute>
            <Magia />
          </ProtectedRoute>
        ),
      },
      {
        path: 'personagens/:id/mapas',
        element: (
          <ProtectedRoute>
            <Mapa />
          </ProtectedRoute>
        ),
      },
      {
        path: 'personagens/:id/equipamentos',
        element: (
          <ProtectedRoute>
            <Equipamento />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
    <Toaster richColors position="top-center" /> 
  </StrictMode>,
)