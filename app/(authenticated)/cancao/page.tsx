"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Music, Star, Shield, Award, Play, Pause, Volume2, Download, AlertCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
import { useToast } from "@/hooks/use-toast"
import { useRequireAuth } from "@/context/auth-context"

export default function CancaoPage() {
  const { user } = useRequireAuth()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [loop, setLoop] = useState(false)
  const [cancao, setCancao] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { toast } = useToast()

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleLoop = () => {
    if (audioRef.current) {
      const newLoopState = !loop
      audioRef.current.loop = newLoopState
      setLoop(newLoopState)
      
      toast({
        title: newLoopState ? "Loop ativado" : "Loop desativado",
        description: newLoopState ? "A canção será reproduzida em loop" : "A canção será reproduzida uma vez",
      })
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Verificar acesso e carregar canção
  useEffect(() => {
    const loadCancao = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Verificar se o usuário tem acesso permitido
        if (!user || !user.email) {
          setError('Usuário não autenticado')
          setLoading(false)
          return
        }

        const allowedEmails = ['poker@teste.com', 'pokeradmin@teste.com']
        if (!allowedEmails.includes(user.email)) {
          setError('Acesso restrito. Apenas usuários autorizados podem acessar esta página.')
          setLoading(false)
          return
        }

        console.log('✅ Acesso autorizado para:', user.email)

        // Usar dados da canção diretamente (sem depender da tabela)
        const cancaoData = {
          id: 'cancao-poker',
          titulo: 'Canção do 1º Esquadrão do 10º Grupo de Aviação - Esquadrão POKER',
          descricao: 'Hino oficial do Esquadrão POKER, símbolo de tradição, honra e orgulho que representa a história e os valores do 1º Esquadrão do 10º Grupo de Aviação.',
          arquivo_path: 'cancaopoker.mp3',
          formato_audio: 'mp3',
          versao: '1.0',
          downloads_count: 0,
          ultimo_download: null
        }

        console.log('✅ Canção carregada com sucesso:', cancaoData)
        setCancao(cancaoData)
      } catch (err) {
        console.error('Erro ao carregar canção:', err)
        setError('Erro interno ao carregar canção')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadCancao()
    }
  }, [user])

  // Função para baixar a canção
  const handleDownload = async () => {
    if (!cancao) return

    try {
      // Registrar download no Supabase
      const response = await fetch('/api/cancao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancaoId: cancao.id }),
      })

      if (!response.ok) {
        throw new Error('Erro ao registrar download')
      }

      // Baixar arquivo do Supabase Storage
      const { data, error } = await supabase.storage
        .from('cancoes')
        .download(cancao.arquivo_path)

      if (error) {
        throw error
      }

      // Criar link de download
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `cancao-poker-${cancao.versao}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Download realizado!",
        description: "A canção foi baixada com sucesso.",
      })
    } catch (error) {
      console.error('Erro no download:', error)
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar a canção. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header principal */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg">
              <Music className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Canção do Esquadrão
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs sm:text-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Tradição
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs sm:text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                História
              </Badge>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Honra
              </Badge>
            </div>
          </div>
        </div>

        {/* Cabeçalho da canção */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800 dark:text-blue-200 leading-tight">
              CANÇÃO DO 1º ESQUADRÃO DO 10º GRUPO DE AVIAÇÃO
            </CardTitle>
            <div className="text-base sm:text-lg lg:text-xl font-semibold text-blue-600 dark:text-blue-300 mt-2">
              ESQUADRÃO "POKER"
            </div>
          </CardHeader>
        </Card>

        {/* Player de Áudio */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="text-center pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2">
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              Ouça a Canção
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-emerald-700 dark:text-emerald-300 mt-4">Carregando canção...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            ) : cancao ? (
              <>
                {/* Elemento de áudio oculto */}
                {(() => {
                  const audioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cancoes/${cancao.arquivo_path}`
                  console.log('🎵 URL do áudio:', audioUrl)
                  console.log('🌐 NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
                  console.log('📁 arquivo_path:', cancao.arquivo_path)
                  
                  return (
                    <audio
                      ref={audioRef}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    >
                      <source src={audioUrl} type="audio/mpeg" />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                  )
                })()}

                {/* Controles do player */}
                <div className="space-y-4">
                  {/* Botão principal de play/pause */}
                  <div className="flex justify-center items-center gap-4">
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 sm:w-10 sm:h-10" />
                      ) : (
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-0.5" />
                      )}
                    </Button>
                    
                    {/* Botão de Loop */}
                    <Button
                      onClick={toggleLoop}
                      variant={loop ? "default" : "outline"}
                      size="sm"
                      className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 ${
                        loop 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" 
                          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                      }`}
                      title={loop ? "Desativar loop" : "Ativar loop"}
                    >
                      <div className="relative">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loop && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </Button>
                  </div>

                  {/* Barra de progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-emerald-700 dark:text-emerald-300">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-emerald-200 dark:bg-emerald-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #10b981 ${(currentTime / (duration || 1)) * 100}%, #d1fae5 ${(currentTime / (duration || 1)) * 100}%)`
                      }}
                    />
                  </div>

                  {/* Controle de volume */}
                  <div className="flex items-center justify-center gap-3">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-2 bg-emerald-200 dark:bg-emerald-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 w-8">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  {/* Botão de download */}
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                      onClick={handleDownload}
                      disabled={!cancao}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar MP3
                    </Button>
                  </div>

                  {/* Informações da canção */}
                  <div className="text-center pt-4 border-t border-emerald-200 dark:border-emerald-700">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                      <p>Versão: {cancao?.versao}</p>
                      <p>Downloads: {cancao?.downloads_count || 0}</p>
                      {cancao?.ultimo_download && (
                        <p>Último download: {new Date(cancao.ultimo_download).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Letra da canção */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 sm:space-y-8 text-base sm:text-lg leading-relaxed max-w-4xl mx-auto">
              
              {/* Primeira estrofe */}
              <div className="space-y-3 text-center">
                <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  Primeira Estrofe
                </div>
                <div className="text-slate-800 dark:text-slate-200 space-y-2">
                  <p className="text-sm sm:text-base lg:text-lg">Se da guerra os perigos afloram,</p>
                  <p className="text-sm sm:text-base lg:text-lg">Nobres filhos se imolam a lutar;</p>
                  <p className="text-sm sm:text-base lg:text-lg">Do celeiro de ases decolam,</p>
                  <p className="text-sm sm:text-base lg:text-lg">Alçam voo bravos leões do ar!</p>
                </div>
              </div>

              {/* Segunda estrofe */}
              <div className="space-y-3 text-center">
                <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  Segunda Estrofe
                </div>
                <div className="text-slate-800 dark:text-slate-200 space-y-2">
                  <p className="text-sm sm:text-base lg:text-lg">São audazes guerreiros de raça,</p>
                  <p className="text-sm sm:text-base lg:text-lg">Voo rasante e furtivo a espiar,</p>
                  <p className="text-sm sm:text-base lg:text-lg">Qual felino na espreita da caça,</p>
                  <p className="text-sm sm:text-base lg:text-lg">São os olhos da pátria a voar.</p>
                </div>
              </div>

              {/* Estribilho - Destaque especial */}
              <div className="space-y-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 sm:p-6 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider text-center">
                  Estribilho
                </div>
                <div className="text-amber-800 dark:text-amber-200 space-y-2 text-center font-semibold">
                  <p className="text-sm sm:text-base lg:text-lg"><strong>Salve! Bravo Esquadrão POKER,</strong></p>
                  <p className="text-sm sm:text-base lg:text-lg"><strong>Escol nobre do conhecimento.</strong></p>
                  <p className="text-sm sm:text-base lg:text-lg"><strong>Salve! Bravo Esquadrão POKER,</strong></p>
                  <p className="text-sm sm:text-base lg:text-lg"><strong>Estandarte do reconhecimento.</strong></p>
                </div>
              </div>

              {/* Terceira estrofe */}
              <div className="space-y-3 text-center">
                <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  Terceira Estrofe
                </div>
                <div className="text-slate-800 dark:text-slate-200 space-y-2">
                  <p className="text-sm sm:text-base lg:text-lg">Ao cumprir a missão, traz latente</p>
                  <p className="text-sm sm:text-base lg:text-lg">As visões do inimigo a aclarar;</p>
                  <p className="text-sm sm:text-base lg:text-lg">Quer nos olhos, no filme ou na mente,</p>
                  <p className="text-sm sm:text-base lg:text-lg">Mil segredos vão-se desvelar.</p>
                </div>
              </div>

              {/* Quarta estrofe */}
              <div className="space-y-3 text-center">
                <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  Quarta Estrofe
                </div>
                <div className="text-slate-800 dark:text-slate-200 space-y-2">
                  <p className="text-sm sm:text-base lg:text-lg">De sagazes mentores silentes</p>
                  <p className="text-sm sm:text-base lg:text-lg">Nascem dados de valor sem par.</p>
                  <p className="text-sm sm:text-base lg:text-lg">Traduzir em informes videntes</p>
                  <p className="text-sm sm:text-base lg:text-lg">Para a Força Amiga empregar.</p>
                </div>
              </div>

              {/* Repetição do Estribilho */}
              <div className="space-y-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 sm:p-6 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider text-center">
                  Estribilho (Repetição)
                </div>
                <div className="text-amber-800 dark:text-amber-200 space-y-2 text-center font-semibold">
                  <p className="text-sm sm:text-base lg:text-lg"><strong>Salve! Bravo Esquadrão POKER,</strong></p>
                  <p className="text-sm sm:text-base lg:text-lg"><strong>Escol nobre do conhecimento.</strong></p>
                  <p className="text-sm sm:text-base lg:text-lg"><strong>Salve! Bravo Esquadrão POKER,</strong></p>
                  <p className="text-sm sm:text-base lg:text-lg"><strong>Estandarte do reconhecimento.</strong></p>
                </div>
              </div>

              {/* Quinta estrofe (antiga "Estribilho Final") */}
              <div className="space-y-3 text-center">
                <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  Quinta Estrofe
                </div>
                <div className="text-slate-800 dark:text-slate-200 space-y-2">
                  <p className="text-sm sm:text-base lg:text-lg">Decisivo no palco da luta,</p>
                  <p className="text-sm sm:text-base lg:text-lg">Missão nobre na arte da guerra,</p>
                  <p className="text-sm sm:text-base lg:text-lg">É o primeiro a se dar em labuta,</p>
                  <p className="text-sm sm:text-base lg:text-lg">Pois conhece o valor que encerra.</p>
                </div>
              </div>

              {/* Sexta estrofe (antiga "Quinta Estrofe") */}
              <div className="space-y-3 text-center">
                <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  Sexta Estrofe
                </div>
                <div className="text-slate-800 dark:text-slate-200 space-y-2">
                  <p className="text-sm sm:text-base lg:text-lg">Caçador de destreza e bravura,</p>
                  <p className="text-sm sm:text-base lg:text-lg">Já provou, com orgulho, na história</p>
                  <p className="text-sm sm:text-base lg:text-lg">Que o labor que fomenta assegura</p>
                  <p className="text-sm sm:text-base lg:text-lg">O saber que conduz à vitória.</p>
                </div>
              </div>

              {/* Instrução final */}
              <div className="text-center pt-4">
                <div className="inline-block bg-slate-100 dark:bg-slate-700 px-3 sm:px-4 py-2 rounded-lg">
                  <span className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">
                    Estribilho (2 vezes)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações históricas */}
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              Sobre a Canção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              A Canção do Esquadrão POKER é um símbolo de tradição, honra e orgulho que representa 
              a história e os valores do 1º Esquadrão do 10º Grupo de Aviação. Esta canção celebra 
              a bravura, a dedicação e o compromisso dos pilotos e tripulantes que servem na 
              missão de reconhecimento e vigilância aérea.
            </p>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Cada estrofe reflete os princípios fundamentais do Esquadrão: coragem em combate, 
              precisão na missão, e o compromisso inabalável com a defesa da pátria. O estribilho 
              serve como um chamado à união e ao orgulho de pertencer a esta unidade de elite.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
