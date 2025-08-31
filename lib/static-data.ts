/**
 * ------------------------------------------------------------------
 *  Dados estáticos utilizados por componentes client-side.
 *  Altere ou complemente estes arrays conforme necessário.
 * ------------------------------------------------------------------
 */

/** Militares disponíveis para registro de presença */
export const militaryPersonnel = [
  { id: "1", name: "CARNEIRO", rank: "TC" },
  { id: "2", name: "MAIA", rank: "MJ" },
  { id: "3", name: "MIRANDA", rank: "CP" },
  { id: "4", name: "CAMILA CALDAS", rank: "CP" },
  { id: "5", name: "FARIAS", rank: "CP" },
  { id: "6", name: "SPINELLI", rank: "CP" },
  { id: "7", name: "ALMEIDA", rank: "CP" },
  { id: "8", name: "JÚNIOR", rank: "CP" },
  { id: "9", name: "FELIPPE MIRANDA", rank: "CP" },
  { id: "10", name: "EDUARDO", rank: "CP" },
  { id: "11", name: "MAIRINK", rank: "CP" },
  { id: "12", name: "ISMAEL", rank: "1T" },
  { id: "13", name: "OBREGON", rank: "2T" },
  { id: "14", name: "ELIASAFE", rank: "SO" },
  { id: "15", name: "MENEZES", rank: "1S" },
  { id: "16", name: "JACOBS", rank: "1S" },
  { id: "17", name: "RIBAS", rank: "2S" },
  { id: "18", name: "EDGAR", rank: "2S" },
  { id: "19", name: "MADUREIRO", rank: "2S" },
  { id: "20", name: "ORIEL", rank: "2S" },
  { id: "21", name: "FRANK", rank: "2S" },
  { id: "22", name: "BRAZ", rank: "2S" },
  { id: "23", name: "PITTIGLIANI", rank: "3S" },
  { id: "24", name: "L. TEIXEIRA", rank: "3S" },
  { id: "25", name: "MAIA", rank: "3S" },
  { id: "26", name: "ANNE", rank: "3S" },
  { id: "27", name: "JAQUES", rank: "3S" },
  { id: "28", name: "HOEHR", rank: "3S" },
  { id: "29", name: "VILELA", rank: "3S" },
  { id: "30", name: "HENRIQUE", rank: "3S" },
  { id: "31", name: "VIEIRA", rank: "S1" },
  { id: "32", name: "NYCOLAS", rank: "S1" },
  { id: "33", name: "GABRIEL REIS", rank: "S1" },
  { id: "34", name: "MATEUS FONTOURA", rank: "S2" },
  { id: "35", name: "DOUGLAS SILVA", rank: "S2" },
  { id: "36", name: "DA ROSA", rank: "S2" },
  { id: "37", name: "DENARDIN", rank: "S2" },
  { id: "38", name: "MILESI", rank: "S2" },
  { id: "39", name: "JOÃO GABRIEL", rank: "S2" },
  { id: "40", name: "VIEIRA", rank: "S2" },
]

/** Tipos de chamada conforme solicitado */
export const callTypes = [
  { id: "inicio-expediente", label: "Início de Expediente" },
  { id: "final-expediente", label: "Final de Expediente" },
  { id: "palestra-auditorio", label: "Palestra Auditório" },
  { id: "formatura", label: "Formatura" },
]

/** Status de presença com as opções específicas solicitadas */
export const attendanceStatuses = [
  { id: "presente", label: "PRESENTE", color: "green" },
  { id: "ausente", label: "AUSENTE", color: "red" },
  { id: "dispensa", label: "DISPENSA", color: "purple" },
  { id: "entrando-servico", label: "ENTRANDO DE SERVIÇO", color: "yellow" },
  { id: "formatura", label: "FORMATURA", color: "indigo" },
  { id: "gsau", label: "GSAU", color: "orange" },
  { id: "horus", label: "HÓRUS", color: "cyan" },
  { id: "mercado", label: "MERCADO", color: "pink" },
  { id: "reuniao", label: "REUNIÃO", color: "violet" },
  { id: "saindo-servico", label: "SAINDO DE SERVIÇO", color: "amber" },
  { id: "tacf", label: "TACF", color: "emerald" },
  { id: "voo", label: "VOO ✈︎", color: "sky" },
  { id: "voo-noturno", label: "VOO NOTURNO", color: "slate" },
]

/** Motivos de ausência / justificativa */
export const absenceReasons = [
  { id: "atestado", label: "Atestado médico" },
  { id: "externo", label: "Serviço externo" },
  { id: "dispensa", label: "Dispensa" },
  { id: "voo", label: "Voo" },
  { id: "instrucao", label: "Instrução" },
  { id: "servico", label: "Serviço" },
]
