import SimpleAdminPanel from '@/components/simple-admin-panel'

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
      
      <SimpleAdminPanel />
    </div>
  )
}
