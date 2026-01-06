import Link from 'next/link'
import { Shield, Users, ArrowRight } from 'lucide-react'
import SimpleCrudAdmin from '@/components/simple-crud-admin'

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Administração do Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie usuários, senhas e configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/admin/military" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 text-blue-600 dark:text-blue-400">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Gestão de Efetivo
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Adicionar, editar e remover militares da lista de presença e escalas.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative overflow-hidden border-l-4 border-l-green-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Gestão de Usuários
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Controle de acesso, senhas e cadastro de novos operadores do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      <SimpleCrudAdmin />
    </div>
  )
}
