"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudRain, CloudLightning, Wind, Thermometer, MapPin, Sun, Sunrise, Sunset, Droplets, Gauge, Eye, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchWeatherData, WeatherData } from "@/lib/weather-api"

export function WeatherForecast() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [apiStatus, setApiStatus] = useState<"loading" | "active" | "inactive" | "error">("loading")

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await fetchWeatherData()
        setWeather(data)
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
        
        // Verifica se está usando dados reais ou simulados
        // Dados reais da API terão temperaturas variadas, simulados são fixos
        const isRealData = data.current.temperature !== 22 || 
                          data.current.humidity !== 65 || 
                          data.current.wind !== 15
        
        if (isRealData) {
          setApiStatus("active")
          console.log("🎉 API OpenWeatherMap funcionando com dados reais!")
        } else {
          setApiStatus("inactive")
          console.log("⚠️ Usando dados simulados - API pode estar em ativação")
        }
        
      } catch (error) {
        console.error("Erro ao carregar dados meteorológicos:", error)
        setError("Erro ao carregar dados meteorológicos")
        setApiStatus("error")
      } finally {
        setLoading(false)
      }
    }

    loadWeatherData()
    
    // Atualiza dados a cada 30 minutos
    const interval = setInterval(loadWeatherData, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sun":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "cloud":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "rain":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      case "lightning":
        return <CloudLightning className="h-8 w-8 text-yellow-600" />
      case "wind":
        return <Wind className="h-8 w-8 text-gray-400" />
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />
    }
  }

  const getCardColor = (day: string) => {
    // Card de hoje em verde, outros em azul
    if (day === "Hoje") {
      return "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/40 border-green-200 dark:border-green-800"
    }
    return "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/40 border-blue-200 dark:border-blue-800"
  }

  const getTextColor = (day: string) => {
    // Texto do card de hoje em verde, outros em azul
    if (day === "Hoje") {
      return "text-green-800 dark:text-green-300"
    }
    return "text-blue-800 dark:text-blue-300"
  }

  const getBorderColor = (day: string) => {
    // Borda do card de hoje em verde, outros em azul
    if (day === "Hoje") {
      return "border-green-200 dark:border-green-700"
    }
    return "border-blue-200 dark:border-blue-700"
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-red-600" />
            Previsão do Tempo - Base Aérea (Santa Maria - RS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 dark:text-blue-400">Carregando dados meteorológicos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-red-600" />
            Previsão do Tempo - Base Aérea (Santa Maria - RS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">
              {error || "Erro ao carregar dados meteorológicos"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Verificando conexão com serviço meteorológico...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-red-600" />
            Previsão do Tempo - Base Aérea (Santa Maria - RS)
          </CardTitle>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Última atualização: {lastUpdate}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da API */}
        {apiStatus === "inactive" && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  <strong>Verificando API:</strong> Testando conexão com OpenWeatherMap
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Enquanto isso, estamos usando dados simulados realistas para demonstração
                </p>
              </div>
            </div>
          </div>
        )}

        {apiStatus === "active" && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                  <strong>✅ API Ativa:</strong> Dados meteorológicos em tempo real
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  Conectado com OpenWeatherMap - Dados precisos para Santa Maria, RS
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Condições atuais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-950/40 rounded-lg">
          <div className="flex items-center gap-3">
            <Thermometer className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">Umidade: {weather.current.humidity}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Wind className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Vento: {weather.current.wind} km/h {weather.current.windDirection}</span>
          </div>
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Visibilidade: {weather.current.visibility} km</span>
          </div>
        </div>

        {/* Previsão para a semana */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
            Previsão para a semana
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Todos os cards com informações expandidas */}
            {weather.forecast.map((day, index) => (
              <div
                key={index}
                className={`p-4 bg-gradient-to-br ${getCardColor(day.day)} rounded-lg border-2 hover:shadow-lg transition-all duration-200`}
              >
                <div className="text-center mb-3">
                  <div className={`text-lg font-bold ${getTextColor(day.day)} mb-2`}>
                    {day.day}
                  </div>
                  <div className="flex justify-center mb-3">
                    {getWeatherIcon(day.icon)}
                  </div>
                  <div className={`text-2xl font-bold ${getTextColor(day.day)} mb-1`}>
                    {day.temperature}°C
                  </div>
                  <div className={`text-sm ${getTextColor(day.day)} mb-3 opacity-80`}>
                    {day.condition}
                  </div>
                </div>
                
                {/* Informações detalhadas */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span>Máx: {day.maxTemp}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-blue-500" />
                    <span>Mín: {day.minTemp}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>Chuva: {day.rainProbability}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <span>Vento: {day.wind} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span>Umidade: {day.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    <span>Pressão: {day.pressure} hPa</span>
                  </div>
                </div>
                
                {/* Horários do sol (apenas para hoje) */}
                {day.day === "Hoje" && (
                  <div className={`mt-3 pt-3 border-t ${getBorderColor(day.day)}`}>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <Sunrise className="h-4 w-4 text-orange-500" />
                        <span>Nascer: {weather.current.sunrise}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sunset className="h-4 w-4 text-red-500" />
                        <span>Pôr: {weather.current.sunset}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Aviso importante */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300 text-center font-medium">
            <strong>Importante:</strong> Verifique as condições meteorológicas antes dos voos
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">
            {apiStatus === "active" 
              ? "Dados fornecidos pelo OpenWeatherMap - Coordenadas: Santa Maria, RS (-29.6868, -53.8149)"
              : "Dados simulados para demonstração - API será ativada em breve"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
