"use client"

import { MilitaryManagement } from "@/components/military-management"

export default function MilitaryAdminPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Gestão de Efetivo</h1>
                <p className="text-muted-foreground">
                    Gerencie a lista de militares disponíveis no controle de presença.
                    As alterações feitas aqui refletem imediatamente na lista de chamada.
                </p>
            </div>

            <MilitaryManagement />
        </div>
    )
}
