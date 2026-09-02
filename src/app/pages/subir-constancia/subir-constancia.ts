import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SolicitudesService } from '../../services/solicitudes';

@Component({
  selector: 'app-subir-constancia',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './subir-constancia.html',
  styleUrl: './subir-constancia.scss',
})
export class SubirConstancia implements OnInit {
  archivoSeleccionado: File | null = null;
  estatusConstancia: 'Pendiente' | 'Completada' = 'Pendiente';
  nombreArchivoGuardado: string = '';

  msgExito: string = '';
  msgError: string = '';
  cargando: boolean = false;
  isDragging: boolean = false;

  jefeSeleccionado: string = '';
  listaJefes: any[] = [];
  catalogoCompletoFirmas: any[] = [];

  tecnicoAutomatico: string = '';
  divisionalAutomatico: string = '';
  tecnicoRpe: string = '';
  divisionalRpe: string = '';

  private apiSubir = 'http://localhost/sica/api/subir_constancia.php';
  private urlUploads = 'http://localhost/sica/api/uploads/';

  constructor(
    private http: HttpClient,
    private solicitudes: SolicitudesService, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.obtenerEstatusActual();
    this.cargarFirmantesDisponibles(); 
  }

  cargarFirmantesDisponibles() {
    this.solicitudes.obtenerFirmantes().subscribe({
      next: (res: any) => {
        console.log('Firmantes cargados en panel de constancias:', res);

        if (res?.status === 'success' && res?.firmas) {
          this.catalogoCompletoFirmas = res.firmas;

          this.listaJefes = this.catalogoCompletoFirmas.filter(
            (f: any) => f.puesto_tipo == '3'
          );

          const tec = this.catalogoCompletoFirmas.find(
            (f: any) => f.puesto_tipo == '2'
          );
          this.tecnicoAutomatico = tec?.nombre || 'GERARDO AVILA ECHEVERRIA';
          this.tecnicoRpe = tec?.rpe || 'GE0F7';

          const div = this.catalogoCompletoFirmas.find(
            (f: any) => f.puesto_tipo == '1'
          );
          this.divisionalAutomatico = div?.nombre || 'HUGO ENRIQUE HERNÁNDEZ GRAJALES';
          this.divisionalRpe = div?.rpe || '9L3RA';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando firmantes en constancias:', err);
      }
    });
  }

  obtenerEstatusActual() {
    const rpeSesion = localStorage.getItem('rpe') || '';

    if (!rpeSesion) {
      this.estatusConstancia = 'Pendiente';
      this.nombreArchivoGuardado = '';
      return;
    }

    this.http.get<any>(`${this.apiSubir}?rpe=${rpeSesion}`).subscribe({
      next: (res) => {
        console.log("Respuesta del servidor al consultar estatus:", res);

        if (res && res.status === 'success') {
          if (res.constancia_status) {
            this.estatusConstancia = res.constancia_status;
            this.nombreArchivoGuardado = res.constancia_archivo || '';
          }
          else if (res.usuario) {
            this.estatusConstancia = res.usuario.constancia_status || 'Pendiente';
            this.nombreArchivoGuardado = res.usuario.constancia_archivo || '';
          }

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Error al recuperar el estatus desde el servidor:", err);
      }
    });
  }

  descargarResponsiva() {
    const rpeUsuario = localStorage.getItem('rpe') || 'SIN RPE';
    const nombreUsuario = localStorage.getItem('nombre') || 'Usuario del Sistema';

    const infoJefe = this.catalogoCompletoFirmas.find(f => (f.nombre || f.nombre_firmante || f.nombre_oficial) === this.jefeSeleccionado);
    const rpeJefeSeleccionado = infoJefe ? infoJefe.rpe : 'SIN RPE';

    const fechaHoy = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const doc = new jsPDF();
    const img = new Image();
    img.src = 'images/logo-cfe.png';

    img.onload = () => {
      // Página 1
      doc.addImage(img, 'PNG', 155, 8, 40, 18);

      doc.setFontSize(18);
      doc.setTextColor(0, 130, 70);
      doc.setFont('helvetica', 'bold');
      doc.text('SICA-CFE', 14, 16);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Control de Asistencias CFE', 14, 23);

      doc.setDrawColor(0, 130, 70);
      doc.setLineWidth(0.5);
      doc.line(14, 27, 196, 27);

      doc.setFontSize(9.5);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'italic');
      doc.text(`Documento emitido de forma digital`, 14, 33);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text('CARTA RESPONSIVA Y DE CONFIDENCIALIDAD DE ACCESO', 14, 41);

      autoTable(doc, {
        startY: 46,
        theme: 'grid',
        head: [['Concepto', 'Información Institucional del Solicitante']],
        body: [
          ['RPE', rpeUsuario],
          ['Nombre Completo', nombreUsuario.toUpperCase()],
          ['Fecha de Emisión', fechaHoy],
          ['Recurso Tecnológico', 'SISTEMA DE CONTROL DE ASISTENCIAS (SICA-CFE)'],
          ['Tipo de Acceso', 'WEB / ACCESO LOCAL'],
          ['Justificación', 'Se requiere la asignación de usuario y roles para el correcto análisis, revisión de incidencias y administración de asistencias del personal de la zona correspondiente.']
        ],
        headStyles: {
          fillColor: [0, 130, 70],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9.5
        },
        alternateRowStyles: {
          fillColor: [242, 249, 242]
        },
        styles: { fontSize: 9.5, cellPadding: 2.8 }
      });

      let y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(0);
      doc.text("MARCO NORMATIVO", 14, y);
      doc.line(14, y + 1.2, 196, y + 1.2);

      y += 6;
      doc.setFontSize(9.5);
      doc.text("LEYES", 14, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.setFontSize(9);
      const leyes = [
        "• Ley de la Empresa Pública del Estado, Comisión Federal de Electricidad, vigente.",
        "• Ley Federal de Transparencia y Acceso a la Información Pública, vigente.",
        "• Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados, vigente.",
        "• Ley General de Responsabilidades Administrativas, vigente.",
        "• Ley General de Transparencia y Acceso a la Información Pública, vigente."
      ];
      leyes.forEach(line => { y += 4.8; doc.text(line, 14, y); });

      y += 6.5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.setFontSize(9.5);
      doc.text("REGLAMENTOS", 14, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.setFontSize(9);
      const reglamentos = [
        "• Reglamento de la Ley de la Comisión Federal de Electricidad, vigente.",
        "• Reglamento de la Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental, vigente."
      ];
      reglamentos.forEach(line => { y += 4.8; doc.text(line, 14, y); });

      y += 6.5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.setFontSize(9.5);
      doc.text("NORMATIVIDAD INTERNA", 14, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.setFontSize(9);

      const normatividad = [
        "• Código de Conducta, vigente.",
        "• Código de Ética de las personas servidoras públicas de la comisión federal de electricidad y personas empleadas de las empresas filiales, Autorizado por el Consejo de Administración en Acuerdo CA-CFE-033/2025 del 21-05-2025.",
        "• Estándares en Materia de Soluciones Tecnológicas y Bases de Datos, vigente (ubicado en el Portal de la Subdirección de Transformación Digital).",
        "• Lineamientos en Materia de Seguridad de la Información de la CFE, Filiales y terceros, vigente.",
        "• Lineamientos en Materia de Servicios de Internet en la CFE, sus Empresas Subsidiarias y Filiales, vigente.",
        "• Lineamientos Internos para Identificar y Proteger la Información Susceptible de Considerarse como Reservada o Confidencial, vigente.",
        "• Políticas de Tecnologías de la Información, Comunicaciones y Seguridad de la Información de la CFE, vigente.",
        "• Políticas y Normas para Garantizar a los Trabajadores de CFE la Protección de sus Datos Personales, vigentes."
      ];

      normatividad.forEach(line => {
        y += 4.6;
        const splitLines = doc.splitTextToSize(line, 182);
        doc.text(splitLines, 14, y);
        y += (splitLines.length - 1) * 4.4;
      });

      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.setFont("helvetica", "normal");
      doc.text("Hoja 1 de 3 | Control Interno CFE", 14, 282);

      // Página 2
      doc.addPage();

      doc.addImage(img, 'PNG', 155, 8, 40, 18);
      doc.setFontSize(18);
      doc.setTextColor(0, 130, 70);
      doc.setFont('helvetica', 'bold');
      doc.text('SICA-CFE', 14, 16);
      doc.setDrawColor(0, 130, 70);
      doc.setLineWidth(0.5);
      doc.line(14, 27, 196, 27);

      y = 38;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.setFontSize(9.5);

      const parrafoManifiesto = "Por medio de la presente Carta Responsiva y de Confidencialidad manifiesto mi consentimiento y conformidad para sujetarme a la normativa de Tecnologías de la Información, Comunicaciones y Seguridad de la Información (TICSI), en materia de confidencialidad y seguridad en el uso de la información y resguardo de la misma, así como en el uso adecuado de la documentación, información y datos registrados en: sistemas informáticos, servicios, plataformas e infraestructuras de TIC de la Comisión Federal de Electricidad (CFE) y/o Empresas Filiales (EF).\n\nEn mi calidad de administrador, operador, personal de TICSI, usuario y/o prestador de servicios de los sistemas informáticos, recursos de TICSI y/o servicios de TICSI de la CFE, suscribo el presente documento y declaro que estoy de acuerdo y me comprometo a:";

      const splitManifiesto = doc.splitTextToSize(parrafoManifiesto, 182);
      doc.text(splitManifiesto, 14, y);
      y += splitManifiesto.length * 4.8 + 4;

      const compromisos1 = [
        "• Leer y conocer las Políticas y los Lineamientos relativos a las Tecnologías de Información, Comunicaciones y Seguridad de la Información de la CFE.",
        "• Leer, comprender y dar cumplimiento a los LINEAMIENTOS EN MATERIA DE SEGURIDAD DE LA INFORMACION DE LA CFE, destacando formalmente sobre lo establecido en el punto 5.2 LINEAMIENTOS PARA PROTEGER LA INFORMACIÓN DE LA EMPRESA.",
        "• Utilizar mi cuenta de acceso única y exclusivamente para los fines que me fue asignada en el SICA.",
        "• Salvaguardar mi cuenta y clave de acceso (contraseña) y no compartirlas con otras personas.",
        "• Solicitar la baja de mi servicio y/o cuenta de acceso cuando el uso del sistema ya no forme parte de mis funciones asignadas.",
        "• Solicitar la baja o actualización de mi cuenta de acceso al momento de que mi situación laboral o adscripción se modifique.",
        "• Conocer, cumplir y mantenerme actualizado sobre lo establecido en los Lineamientos en materia de Seguridad de la Información aplicables.",
        "• Responder como suscriptor autorizado sobre el uso de los sistemas, recursos y servicios en función del rol y permisos jerárquicos provistos.",
        "• No difundir y no compartir documentación, información o bases de datos de asistencias consideradas como reservadas o confidenciales.",
        "• No compartir información sensible con personal externo o empresas del mercado con actividades relacionadas al sector eléctrico.",
        "• Asumir la obligación sobre la confidencialidad tratada en el presente documento de forma permanente aun al finalizar la relación laboral.",
        "• Asumir la responsabilidad sobre el uso de mi cuenta, clave de acceso (contraseña), firma electrónica y operaciones bajo mi cargo.",
        "• Ser responsable de evitar cualquier uso indebido o malintencionado sobre las claves bajo mi titularidad.",
        "• Ejercer las acciones y funciones en tiempo y forma sobre las soluciones tecnológicas e industriales proporcionadas."
      ];

      compromisos1.forEach(comp => {
        const splitComp = doc.splitTextToSize(comp, 182);
        doc.text(splitComp, 14, y);
        y += splitComp.length * 4.8 + 1.8;
      });

      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text("Hoja 2 de 3 | Control Interno CFE", 14, 282);

      // Página 3
      doc.addPage();

      doc.addImage(img, 'PNG', 155, 8, 40, 18);
      doc.setFontSize(18);
      doc.setTextColor(0, 130, 70);
      doc.setFont('helvetica', 'bold');
      doc.text('SICA-CFE', 14, 16);
      doc.setDrawColor(0, 130, 70);
      doc.setLineWidth(0.5);
      doc.line(14, 27, 196, 27);

      y = 38;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.setFontSize(9.5);

      const compromisos2 = [
        "• Mantener actualizado en mis equipos de cómputo corporativos tanto el sistema operativo como el antivirus institucional homologado.",
        "• Notificar de manera inmediata al responsable de TI en caso de que mi usuario cuente con mayores privilegios que los mínimos necesarios.",
        "• Notificar al área técnica en caso de detectar cualquier vulnerabilidad o posible incidente de ciberseguridad en la red local de la CFE.",
        "• Usar el equipo de cómputo, red y los recursos informáticos asignados exclusivamente para los fines institucionales correspondientes.",
        "• Conocer, controlar y tratar los 'datos de carácter personal' del SICA conforme a la legislación aplicable en protección de datos.",
        "• No divulgar la 'Información Reservada y/o Confidencial', reproducirla o retransmitirla por medio alguno a terceros sin mandatos judiciales expresos.",
        "• El acceso asignado será válido únicamente dentro del periodo autorizado en el sistema, requiriendo renovación periódica.",
        "• El suscriptor acepta de conformidad que el uso del sistema podrá ser monitoreado y auditado por las áreas de seguridad corporativa.",
        "• Queda estrictamente prohibido el uso de accesos locales en dispositivos no autorizados o ajenos a la infraestructura corporativa de CFE."
      ];

      compromisos2.forEach(comp => {
        const splitComp = doc.splitTextToSize(comp, 182);
        doc.text(splitComp, 14, y);
        y += splitComp.length * 4.8 + 1.8;
      });

      y += 3;
      const parrafoLegalFinal = "Entiendo que la 'Información Reservada y/o Confidencial' está protegida por los Artículos 113 y 114 de la Ley General de Transparencia. Toda información de asistencia a la que tengo acceso es considerada propiedad de la CFE y bien patrimonial documental, por lo que deberá ser resguardada celosamente.\n\nEstoy enterado que la violación o el incumplimiento de las obligaciones plasmadas en esta Carta Responsiva daría lugar a las consecuencias legales y sanciones administrativas que correspondan conforme a la normatividad interna de la empresa.";
      const splitLegalFinal = doc.splitTextToSize(parrafoLegalFinal, 182);
      doc.text(splitLegalFinal, 14, y);
      y += splitLegalFinal.length * 4.8 + 6;

      doc.setFont("helvetica", "bold");
      doc.text(`Xalapa, Veracruz, a ${fechaHoy}.`, 14, y);

      y += 18;
      doc.setDrawColor(160);
      doc.setLineWidth(0.4);

      // FILA 1 DE FIRMAS
      doc.line(14, y, 90, y);
      doc.line(120, y, 196, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0);

      // Usuario Solicitante
      doc.text(nombreUsuario.toUpperCase(), 14, y + 5);
      doc.text(`RPE: ${rpeUsuario}`, 14, y + 9);
      doc.setFont("helvetica", "bold");
      doc.text("USUARIO SOLICITANTE", 14, y + 14);

      // Jefe de Departamento Divisional (Automático con RPE)
      doc.setFont("helvetica", "normal");
      doc.text(this.divisionalAutomatico.toUpperCase(), 120, y + 5);
      doc.text(`RPE: ${this.divisionalRpe}`, 120, y + 9);
      doc.setFont("helvetica", "bold");
      doc.text("JEFE DE DEPARTAMENTO DE RECURSOS HUMANOS", 120, y + 14);

      y += 32;

      // FILA 2 DE FIRMAS
      doc.line(14, y, 90, y);
      doc.line(120, y, 196, y);

      // Responsable Técnico (Automático con RPE)
      doc.setFont("helvetica", "normal");
      doc.text(this.tecnicoAutomatico.toUpperCase(), 14, y + 5);
      doc.text(`RPE: ${this.tecnicoRpe}`, 14, y + 9);
      doc.setFont("helvetica", "bold");
      doc.text("RESPONSABLE TÉCNICO", 14, y + 14);

      // Responsable Operativo Seleccionado (Dinámico con RPE)
      doc.setFont("helvetica", "normal");
      const nombreJefeOficial = infoJefe ? (infoJefe.nombre || infoJefe.nombre_firmante || infoJefe.nombre_oficial) : this.jefeSeleccionado;
      doc.text(nombreJefeOficial.toUpperCase(), 120, y + 5);
      doc.text(`RPE: ${rpeJefeSeleccionado}`, 120, y + 9);
      doc.setFont("helvetica", "bold");
      doc.text("JEFE DIRECTO", 120, y + 14);

      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.setFont("helvetica", "normal");
      doc.text("Hoja 3 de 3 | Control Interno CFE", 14, 282);

      doc.save(`Responsiva_SICA_${rpeUsuario}.pdf`);
    };
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validarYAsignarArchivo(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.validarYAsignarArchivo(event.target.files[0]);
    }
  }

  validarYAsignarArchivo(file: File) {
    this.msgError = '';
    this.msgExito = '';

    if (file.type !== 'application/pdf') {
      this.msgError = 'El formato del archivo no es válido. Asegúrese de subir un documento PDF.';
      this.archivoSeleccionado = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.msgError = 'El archivo excede el límite de tamaño permitido de 5MB.';
      this.archivoSeleccionado = null;
      return;
    }

    this.archivoSeleccionado = file;
    this.cdr.detectChanges();
  }

  removerArchivo() {
    this.archivoSeleccionado = null;
    this.cdr.detectChanges();
  }

  subirDocumento() {
    if (!this.archivoSeleccionado) return;

    this.cargando = true;
    this.msgExito = '';
    this.msgError = '';
    this.cdr.detectChanges();

    const rpeSesion = localStorage.getItem('rpe') || '';

    const formData = new FormData();
    formData.append('constancia', this.archivoSeleccionado);
    formData.append('rpe', rpeSesion);

    this.http.post<any>(this.apiSubir, formData).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res && res.status === 'success') {
          this.msgExito = res.message;
          this.archivoSeleccionado = null;

          this.estatusConstancia = 'Completada';
          this.nombreArchivoGuardado = res.archivo;

          this.cdr.detectChanges();
        } else {
          this.msgError = res.message || 'Error al procesar el archivo.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.cargando = false;
        this.msgError = err.error?.message || 'Error en la conexión con el servidor de archivos.';
        this.cdr.detectChanges();
      }
    });
  }

  verPdfActual() {
    if (this.nombreArchivoGuardado) {
      window.open(`${this.urlUploads}${this.nombreArchivoGuardado}`, '_blank');
    }
  }

  habilitarModificacion() {
    this.estatusConstancia = 'Pendiente';
    this.archivoSeleccionado = null;
    this.cdr.detectChanges();
  }
}
