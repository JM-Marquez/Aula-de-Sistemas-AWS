export interface LabStep { title: string; instruction: string; command: string; output: string; explanation: string }
export interface ItScenario { id: string; area: string; level: string; title: string; summary: string; impact: string; symptom: string; objective: string; steps: LabStep[] }

export const IT_SCENARIOS: ItScenario[] = [
  {
    id: 'linux-ssh', area: 'Linux', level: 'Inicial', title: 'El servidor no acepta conexiones SSH',
    summary: 'Un técnico no puede acceder por SSH a un servidor Linux después de una intervención.',
    impact: '3 usuarios afectados · Servicio de administración', symptom: 'Connection refused al conectar al puerto 22.',
    objective: 'Identificar si el servicio SSH está detenido, revisar el registro y recuperar el acceso sin desactivar controles de seguridad.',
    steps: [
      { title: 'Comprobar el estado del servicio', instruction: 'Empieza comprobando si el demonio SSH está activo.', command: 'systemctl status ssh', output: '○ ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service)\n     Active: inactive (dead) since 09:42:18 UTC\n   Main PID: 0', explanation: 'El servicio está detenido. Antes de cambiar firewall o reinstalar paquetes, confirma el estado y la causa.' },
      { title: 'Consultar los últimos eventos', instruction: 'Revisa los eventos recientes del servicio para entender qué ocurrió.', command: 'journalctl -u ssh -n 8 --no-pager', output: 'Oct 21 09:42:17 srv-app systemd[1]: Stopping OpenBSD Secure Shell server...\nOct 21 09:42:18 srv-app sshd[812]: Received signal 15; terminating.\nOct 21 09:42:18 srv-app systemd[1]: ssh.service: Deactivated successfully.', explanation: 'El servicio se detuvo de forma ordenada; no hay indicios de un fallo de configuración. La siguiente acción es iniciarlo y verificarlo.' },
      { title: 'Restaurar el servicio', instruction: 'Inicia SSH y vuelve a comprobar su estado.', command: 'sudo systemctl start ssh && systemctl is-active ssh', output: 'active', explanation: 'El servicio vuelve a estar activo. En un entorno real, documenta el cambio y averigua por qué se detuvo para evitar recurrencias.' },
    ],
  },
  {
    id: 'aws-s3', area: 'AWS', level: 'Intermedio', title: 'La aplicación no puede leer objetos de S3',
    summary: 'Una función Lambda devuelve AccessDenied al intentar descargar un informe de un bucket privado.',
    impact: 'Aplicación interna · Informes bloqueados', symptom: 'AccessDenied en GetObject para el prefijo informes/2026/.',
    objective: 'Distinguir el rol de ejecución de la política del bucket y aplicar el principio de mínimo privilegio.',
    steps: [
      { title: 'Identificar el principal', instruction: 'Inspecciona la identidad que está usando la función.', command: 'aws sts get-caller-identity', output: '{\n  "Account": "123456789012",\n  "Arn": "arn:aws:sts::123456789012:assumed-role/report-reader-role/report-job"\n}', explanation: 'La petición usa report-reader-role. La revisión debe centrarse en los permisos de ese rol y en las políticas que puedan denegar el acceso.' },
      { title: 'Comprobar la política del rol', instruction: 'Simula la evaluación de permisos para la acción necesaria.', command: 'aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123456789012:role/report-reader-role --action-names s3:GetObject --resource-arns arn:aws:s3:::empresa-reportes/informes/2026/resumen.pdf', output: 'EvalDecision: implicitDeny\nMatchedStatements: []', explanation: 'No existe un Allow aplicable para GetObject sobre ese recurso. No es necesario hacer público el bucket.' },
      { title: 'Definir el permiso mínimo', instruction: 'La corrección debe permitir solo lectura en el prefijo requerido.', command: 'aws s3api get-bucket-policy --bucket empresa-reportes', output: 'Bucket privado · Block Public Access: ENABLED\nNo hay una política que conceda lectura al rol report-reader-role.', explanation: 'La solución es conceder s3:GetObject al rol sobre arn:aws:s3:::empresa-reportes/informes/2026/*, manteniendo el bloqueo de acceso público.' },
    ],
  },
  {
    id: 'network-dns', area: 'Redes', level: 'Inicial', title: 'Los usuarios no pueden resolver la intranet',
    summary: 'Los equipos llegan a la puerta de enlace, pero no pueden abrir intranet.empresa.local.',
    impact: '12 usuarios afectados · Sede principal', symptom: 'El navegador indica que no encuentra el servidor DNS.',
    objective: 'Separar un problema de conectividad IP de un problema de resolución DNS.',
    steps: [
      { title: 'Revisar la configuración IP', instruction: 'Comprueba dirección, máscara, puerta de enlace y DNS configurados.', command: 'ipconfig /all', output: 'IPv4: 192.168.20.45\nGateway: 192.168.20.1\nDNS servers: 192.168.20.53', explanation: 'El equipo tiene dirección y puerta de enlace. El DNS configurado es 192.168.20.53.' },
      { title: 'Comprobar conectividad con el DNS', instruction: 'Prueba conectividad IP directa con el servidor DNS.', command: 'ping 192.168.20.53', output: 'Reply from 192.168.20.53: bytes=32 time=2ms TTL=64\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)', explanation: 'Hay conectividad IP con el DNS. El siguiente paso es probar la resolución de nombres.' },
      { title: 'Consultar el registro DNS', instruction: 'Pregunta al servidor DNS por el nombre interno.', command: 'nslookup intranet.empresa.local', output: 'Server:  dns01.empresa.local\nAddress: 192.168.20.53\n*** dns01 no encuentra intranet.empresa.local: Non-existent domain', explanation: 'La red funciona, pero el registro no existe o no está publicado en la zona consultada. Escala al administrador DNS para revisar el registro A/CNAME.' },
    ],
  },
  {
    id: 'security-login', area: 'Seguridad', level: 'Intermedio', title: 'Actividad de inicio de sesión sospechosa',
    summary: 'El equipo de seguridad detecta varios intentos fallidos y un acceso correcto desde una ubicación inusual.',
    impact: 'Cuenta corporativa · Posible compromiso', symptom: 'Múltiples fallos de autenticación seguidos de un acceso correcto.',
    objective: 'Analizar eventos de autenticación, determinar el alcance y priorizar una respuesta segura.',
    steps: [
      { title: 'Revisar eventos de autenticación', instruction: 'Filtra los eventos recientes de la cuenta afectada.', command: 'grep "user=mperez" /var/log/auth.log | tail -n 6', output: `08:11:02 Failed password user=mperez src=203.0.113.77\n08:11:08 Failed password user=mperez src=203.0.113.77\n08:11:14 Failed password user=mperez src=203.0.113.77\n08:12:01 Accepted password user=mperez src=203.0.113.77`, explanation: 'Hay varios intentos fallidos seguidos de un acceso correcto desde el mismo origen. Trátalo como posible compromiso hasta verificarlo.' },
      { title: 'Comprobar sesiones activas', instruction: 'Identifica si la cuenta mantiene sesiones que deban investigarse.', command: 'who', output: 'mperez pts/1 203.0.113.77 08:12 (active)', explanation: 'Existe una sesión activa desde el origen sospechoso. Conserva evidencias y coordina la contención con el responsable de seguridad.' },
      { title: 'Priorizar la contención', instruction: 'Selecciona la respuesta inicial más segura en el procedimiento de la empresa. En esta simulación, registra la acción recomendada.', command: 'incident status --id INC-204 --action contain-account', output: `INC-204 updated\nStatus: CONTAINMENT_REQUESTED\nEvidence: authentication-log, active-session\nNext: revoke sessions, reset credentials, review MFA and notify security lead`, explanation: 'La respuesta inicial es contener la cuenta y revocar sesiones, preservar registros, restablecer credenciales y revisar MFA. No borres los logs: son evidencias.' },
    ],
  },
]
