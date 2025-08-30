# Configuração da API de Previsão do Tempo

## 🌤️ OpenWeatherMap API

Este projeto agora usa dados reais da previsão do tempo para **Santa Maria, RS, Brasil** através da API do OpenWeatherMap.

### 📍 Localização Configurada
- **Cidade**: Santa Maria, Rio Grande do Sul, Brasil
- **Coordenadas**: -29.6868, -53.8149
- **Base Aérea**: Esquadrão POKER

### 🔑 Status da API Key

**✅ API Key Configurada**: `919d1409d67fca679b877a8abcb08a7b`

**⏳ Status**: **Em Processo de Ativação**
- Sua chave de API será ativada **nas próximas horas**
- Enquanto isso, o sistema usa **dados simulados realistas**
- **Não é necessário fazer nada** - a ativação é automática

### 📧 Confirmação Recebida

```
Querido cliente!
Obrigado por assinar o OpenWeatherMap gratuito!

Chave de API: 919d1409d67fca679b877a8abcb08a7b

- Nas próximas horas, sua chave de API será ativada e estará pronta para uso
- Você poderá criar mais chaves de API posteriormente na página da sua conta
- Por favor, sempre use sua chave de API em cada chamada de API
```

### ⚙️ Configuração Atual

O arquivo `.env.local` já está configurado com:
```bash
NEXT_PUBLIC_OPENWEATHER_API_KEY=919d1409d67fca679b877a8abcb08a7b
```

### 📊 Dados Fornecidos

#### Condições Atuais:
- ✅ Temperatura atual, máxima e mínima
- ✅ Condição meteorológica (ensolarado, nublado, chuvoso)
- ✅ Umidade relativa do ar
- ✅ Velocidade e direção do vento
- ✅ Probabilidade de chuva
- ✅ Pressão atmosférica
- ✅ Horários do nascer e pôr do sol
- ✅ Visibilidade
- ✅ Sensação térmica

#### Previsão de 5 Dias:
- ✅ Temperaturas diárias
- ✅ Condições meteorológicas
- ✅ Probabilidade de chuva
- ✅ Velocidade do vento
- ✅ Umidade e pressão

### 🚀 Funcionalidades

- **Atualização automática** a cada 30 minutos
- **Dados em português brasileiro**
- **Unidades métricas** (Celsius, km/h, hPa)
- **Fallback inteligente** para dados simulados durante ativação
- **Indicador de última atualização**
- **Tratamento de erros** robusto
- **Status da API** visível na interface

### 🔄 Transição Automática

1. **Agora**: Dados simulados realistas + mensagem de status
2. **Quando ativar**: Transição automática para dados reais
3. **Sem interrupção**: O sistema continua funcionando normalmente

### 💰 Planos da API

- **Gratuito**: 1.000 chamadas/dia (suficiente para desenvolvimento)
- **Pago**: Planos a partir de $40/mês para uso comercial

### 🔒 Segurança

- A API key é pública (NEXT_PUBLIC_) pois roda no cliente
- Para produção, considere usar uma API key restrita por domínio
- O OpenWeatherMap oferece proteção contra abuso

### 📱 Responsividade

- **Desktop**: Cards em grid de 5 colunas
- **Mobile**: Cards empilhados verticalmente
- **Tablet**: Layout adaptativo

### 🎨 Design

- **Card de hoje**: Tema verde para destaque
- **Outros dias**: Tema azul para consistência
- **Modo escuro**: Suporte completo
- **Hover effects**: Transições suaves
- **Ícones meteorológicos**: Representação visual clara
- **Indicador de status**: Aviso amarelo durante ativação

### 🚁 Aplicação Militar

Esta implementação é especialmente útil para:
- **Planejamento de voos**
- **Decisões operacionais**
- **Segurança da missão**
- **Logística e manutenção**
- **Treinamentos e exercícios**

### 📞 Suporte

Se precisar de ajuda:
1. **Aguarde a ativação** da API key (nas próximas horas)
2. Verifique a documentação da API
3. Confirme se sua API key está ativa
4. Verifique as coordenadas configuradas

### 🔍 Como Verificar se a API Está Ativa

1. **Acesse o dashboard** em `http://localhost:3000/dashboard`
2. **Procure pela mensagem amarela** "API em Ativação"
3. **Quando desaparecer**: A API está funcionando com dados reais
4. **Verifique o console** do navegador para logs de status

---

**Importante**: 
- ✅ **Sistema funcionando** com dados simulados
- ⏳ **API em ativação** - será automática
- 🚀 **Sem ação necessária** do usuário
- 📊 **Dados meteorológicos** disponíveis para planejamento
