"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Edit, Trash2, Search, UserPlus, Save, X, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Tipos
type Military = {
    id: string
    name: string
    rank: string
    role?: string
    created_at?: string
    seniority?: number
}

const RANKS = ["Cel", "TC", "MJ", "CP", "Cap", "1T", "2T", "Asp", "SO", "1S", "2S", "3S", "Cb", "S1", "S2"]

export function MilitaryManagement() {
    const [militaryList, setMilitaryList] = useState<Military[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentId, setCurrentId] = useState<string | null>(null)

    // Estado do Formulário
    const [formData, setFormData] = useState({
        name: "",
        rank: ""
    })

    // Carregar dados ao montar
    useEffect(() => {
        fetchMilitary()
    }, [])

    const fetchMilitary = async () => {
        setLoading(true)
        try {
            // Ordenação personalizada para patentes seria ideal, mas por enquanto alfabética pelo posto/nome
            const { data, error } = await supabase
                .from("military_personnel")
                .select("*")
                .order("seniority", { ascending: true, nullsFirst: false })
                .order("name", { ascending: true })

            if (error) throw error

            setMilitaryList(data || [])
        } catch (error: any) {
            console.error("Erro ao buscar militares:", error)
            toast({
                title: "Erro ao carregar",
                description: error.message || "Não foi possível carregar a lista de militares.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ name: "", rank: "" })
        setIsEditing(false)
        setCurrentId(null)
    }

    const handleOpenCreate = () => {
        resetForm()
        setIsModalOpen(true)
    }

    const handleOpenEdit = (military: Military) => {
        setFormData({
            name: military.name,
            rank: military.rank
        })
        setCurrentId(military.id)
        setIsEditing(true)
        setIsModalOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.rank) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha o nome e o posto/graduação.",
                variant: "destructive",
            })
            return
        }

        try {
            if (isEditing && currentId) {
                // Atualizar
                const { error } = await (supabase as any)
                    .from("military_personnel")
                    .update({
                        name: formData.name.toUpperCase(),
                        rank: formData.rank,
                        updated_at: new Date().toISOString()
                    } as any)
                    .eq("id", currentId)

                if (error) throw error

                toast({ title: "Militar atualizado com sucesso!" })
            } else {
                // Criar - define seniority como último + 1
                const maxSeniority = militaryList.length > 0
                    ? Math.max(...militaryList.map(m => m.seniority || 0))
                    : 0;

                const { error } = await (supabase as any)
                    .from("military_personnel")
                    .insert([{
                        name: formData.name.toUpperCase(),
                        rank: formData.rank,
                        seniority: maxSeniority + 1
                    }] as any)

                if (error) throw error

                toast({ title: "Militar cadastrado com sucesso!" })
            }

            setIsModalOpen(false)
            fetchMilitary()
        } catch (error: any) {
            console.error("Erro ao salvar:", error)
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover ${name} do efetivo?\nIsso não apagará o histórico de presença passado, mas removerá da lista atual.`)) {
            return
        }

        try {
            const { error } = await supabase
                .from("military_personnel")
                .delete()
                .eq("id", id)

            if (error) throw error

            toast({ title: "Militar removido com sucesso!" })
            fetchMilitary()
        } catch (error: any) {
            console.error("Erro ao deletar:", error)
            toast({
                title: "Erro ao remover",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
        if (loading) return;
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Validações de limites
        if (targetIndex < 0 || targetIndex >= militaryList.length) return;

        // Pegar elementos para troca (usando indices da lista filtrada ou completa? Idealmente completa se não houver filtro)
        // Se houver filtro, não permitir mover ou avisar.
        if (searchTerm) {
            toast({ title: "Limpe a busca para reordenar a lista.", variant: "destructive" });
            return;
        }

        const currentItem = militaryList[currentIndex];
        const targetItem = militaryList[targetIndex];

        // Optimistic UI Update (opcional, mas aqui vamos direto pro banco pra garantir consistência)
        // Trocar seniority
        const newCurrentSeniority = targetItem.seniority ?? targetIndex + 1; // Fallback se null
        const newTargetSeniority = currentItem.seniority ?? currentIndex + 1;

        try {
            setLoading(true);
            // Update 1
            const { error: error1 } = await (supabase as any)
                .from('military_personnel')
                .update({ seniority: newCurrentSeniority } as any)
                .eq('id', currentItem.id);

            if (error1) throw error1;

            // Update 2
            const { error: error2 } = await (supabase as any)
                .from('military_personnel')
                .update({ seniority: newTargetSeniority } as any)
                .eq('id', targetItem.id);

            if (error2) throw error2;

            await fetchMilitary(); // Recarrega para garantir
        } catch (error: any) {
            console.error("Erro ao reordenar:", error)
            toast({
                title: "Erro ao mover",
                description: error.message,
                variant: "destructive",
            })
            setLoading(false) // Retorna loading state
        }
    }


    // Filtragem
    const filteredList = militaryList.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.rank.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou posto..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Militar
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Efetivo Atual ({militaryList.length})</CardTitle>
                    <CardDescription>
                        Gerencie a lista de militares.<br />
                        {!searchTerm && "Use as setas para ajustar a Antiguidade (quem está acima tem prioridade)."}
                        {searchTerm && <span className="text-orange-500 font-medium">Limpe a busca para habilitar reordenação.</span>}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px] text-center">Ordem</TableHead>
                                        <TableHead>Posto/Grad</TableHead>
                                        <TableHead>Nome de Guerra</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                Nenhum militar encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredList.map((military, index) => (
                                            <TableRow key={military.id}>
                                                <TableCell className="text-center">
                                                    {!searchTerm && (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                disabled={index === 0}
                                                                onClick={() => handleMove(index, 'up')}
                                                                title="Mover para cima"
                                                            >
                                                                <ArrowUp className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                disabled={index === filteredList.length - 1}
                                                                onClick={() => handleMove(index, 'down')}
                                                                title="Mover para baixo"
                                                            >
                                                                <ArrowDown className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {searchTerm && <span className="text-muted-foreground">-</span>}
                                                </TableCell>
                                                <TableCell className="font-medium">{military.rank}</TableCell>
                                                <TableCell>{military.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenEdit(military)}
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(military.id, military.name)}
                                                            title="Remover"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Criação/Edição */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar Militar" : "Novo Militar"}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Posto / Graduação</label>
                            <Select
                                value={formData.rank}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, rank: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {RANKS.map(rank => (
                                        <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome de Guerra</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="EX: SILVA"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit}>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
