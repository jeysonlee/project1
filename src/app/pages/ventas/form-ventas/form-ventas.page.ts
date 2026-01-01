import { UsersService } from './../../../services/users.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VentasService } from 'src/app/services/ventas.service';
import { CosechasService } from 'src/app/services/cosechas.service';

@Component({
  selector: 'app-form-ventas',
  templateUrl: './form-ventas.page.html',
})
export class FormVentasPage implements OnInit {

  cosechas: any[] = [];
  detalles: any[] = [];
  esFresco = false;
  Math = Math; // Exponer Math para usar en el template
  ventaId: string | null = null;
  esEdicion = false;
  usuarioActual: any = null;
  esAdmin = false;
  usuarios: any[] = [];

  venta: any = {
    fecha_venta: new Date().toISOString(),
    usuario_id: '',
    usuario_nombre: '',
    nr_venta: '',
    estado_humedad: 'SECO',
    kg_bruto: 0,
    kg_seco: 0,
    kg_bruto_aproximados: 0,
    kg_seco_aproximados: 0,
    cantidad_vendida_kg: 0,
    desc_humedad: 60,
    precio_kg: 0,
    total_venta: 0,
    lugar_venta: '',
    comprador: '',
    vendedor: ''
  };

  constructor(
    private ventasService: VentasService,
    private cosechasService: CosechasService,
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.cosechas = await this.cosechasService.readAll();

    // Usuario actual
    this.usuarioActual = await this.usersService.getCurrentUser();
    this.esAdmin = this.usuarioActual.rol === 'Administrador';

    if (this.esAdmin) {
      this.usuarios = await this.usersService.readAll();
    } else {
      // USER: asignar automáticamente
      this.venta.usuario_id = this.usuarioActual.id;
      this.venta.usuario_nombre =
        `${this.usuarioActual.nombre} ${this.usuarioActual.apellido}`;
    }

    this.ventaId = this.route.snapshot.paramMap.get('id');

    if (this.ventaId) {
      this.esEdicion = true;
      await this.cargarVenta(this.ventaId);
    }
  }

  onUsuarioSeleccionado(event: any) {
    const usuario = this.usuarios.find(u => u.id === event.detail.value);
    if (usuario) {
      this.venta.usuario_nombre = `${usuario.nombre} ${usuario.apellido}`;
    }
  }


  // Cargar datos de la venta y sus detalles
  async cargarVenta(id: string) {
  const data = await this.ventasService.getWithDetails(id);
    console.log('Datos de la venta cargada:', data);
  // Venta principal
  this.venta = {
    ...this.venta,
    ...data.venta
  };

  this.esFresco = this.venta.estado_humedad === 'FRESCO';

  // Detalles
  this.detalles = data.detalles;

  // Marcar cosechas seleccionadas
  this.detalles.forEach(d => {
    const cosecha = this.cosechas.find(c => c.id === d.cosecha_id);
    if (cosecha) {
      cosecha.seleccionada = true;
      cosecha.cantidad_a_vender = d.cantidad_vendida_kg;
      cosecha.vender_todo = false;
    }
  });

  this.recalcular();
}


  cambiarEstado() {
    this.venta.estado_humedad = this.esFresco ? 'FRESCO' : 'SECO';
    this.venta.desc_humedad = 0;

    // Resetear cantidades de las cosechas seleccionadas al cambiar tipo de venta
    this.cosechas.forEach((c: any) => {
      if (c.seleccionada) {
        if (c.vender_todo) {
          // Si tiene "vender todo" marcado, actualizar con el nuevo máximo
          c.cantidad_a_vender = this.esFresco
            ? (c.kg_bruto_disponible || 0)
            : (c.kg_seco_disponible || 0);
        }
      }
    });

    this.recalcular();
  }

  toggleCosecha(c: any) {
    if (c.seleccionada) {
      // Inicializar cantidad a vender en 0
      c.cantidad_a_vender = 0;
      c.vender_todo = false;

      this.detalles.push({
        cosecha_id: c.id,
        parcela_id: c.parcela_id,
        kg_bruto: c.kg_bruto,
        kg_bruto_disponible: c.kg_bruto_disponible,
        kg_seco: 0,
        kg_seco_disponible: c.kg_seco_disponible,
        cantidad_vendida_kg: 0,
        porcentaje_total_venta: 0,
        subtotal: 0
      });
    } else {
      this.detalles = this.detalles.filter(d => d.cosecha_id !== c.id);
      c.cantidad_a_vender = 0;
      c.vender_todo = false;
    }
    this.recalcular();
  }

  toggleVenderTodo(c: any, event: any) {
    const isChecked = event.detail.checked;
    c.vender_todo = isChecked;

    console.log('toggleVenderTodo - Checkbox marcado:', isChecked);

    if (isChecked) {
      // Agregar todo el kilaje disponible según el tipo de venta
      const maxDisponible = this.esFresco
        ? (c.kg_bruto_disponible || 0)
        : (c.kg_seco_disponible || 0);
      c.cantidad_a_vender = Number(maxDisponible);
      console.log('Asignando cantidad máxima:', c.cantidad_a_vender);
    } else {
      // Limpiar cantidad al deseleccionar
      c.cantidad_a_vender = 0;
      console.log('Limpiando cantidad a 0');
    }

    this.recalcular();
  }
recalcular() {

  // 1️⃣ Actualizar detalles con las cantidades ingresadas por el usuario
  this.detalles.forEach(d => {
    const cosecha = this.cosechas.find((c: any) => c.id === d.cosecha_id);
    if (!cosecha) return;

    // Obtener la cantidad que el usuario quiere vender
    const cantidadAVender = cosecha.cantidad_a_vender || 0;

    // Determinar el máximo disponible según el tipo de venta
    const maxDisponible = this.esFresco ? d.kg_bruto_disponible : d.kg_seco_disponible;

    // Asignar kg_bruto y kg_seco que se están vendiendo de esta cosecha
    if (this.esFresco) {
      d.kg_bruto = Math.min(cantidadAVender, maxDisponible);
      // Calcular kg_seco proporcionalmente
      const porcentaje = d.kg_bruto_disponible > 0 ? d.kg_bruto / d.kg_bruto_disponible : 0;
      d.kg_seco = +(d.kg_seco_disponible * porcentaje).toFixed(4);
    } else {
      d.kg_seco = Math.min(cantidadAVender, maxDisponible);
      // Calcular kg_bruto proporcionalmente
      const porcentaje = d.kg_seco_disponible > 0 ? d.kg_seco / d.kg_seco_disponible : 0;
      d.kg_bruto = +(d.kg_bruto_disponible * porcentaje).toFixed(4);
    }
  });

  // 2️⃣ Calcular aproximados (suma de kg_bruto y kg_seco de detalles)
  this.venta.kg_bruto_aproximados = this.detalles.reduce((s, d) => s + d.kg_bruto, 0);
  this.venta.kg_seco_aproximados = this.detalles.reduce((s, d) => s + d.kg_seco, 0);
  this.venta.kg_seco = this.venta.kg_seco_aproximados.toFixed(4);
  // 3️⃣ Calcular kg_seco final aplicando descuento de humedad si es venta FRESCO
  if (this.esFresco) {
    this.venta.kg_seco = this.venta.kg_bruto * (1 - this.venta.desc_humedad / 100);
  }

  // 4️⃣ La cantidad_vendida_kg final es el kg_seco (después de descuento si aplica)
  this.venta.cantidad_vendida_kg = this.venta.kg_seco;

  // 5️⃣ Distribuir la cantidad_vendida_kg entre los detalles proporcionalmente
  const totalKgSecoAproximado = this.venta.kg_seco_aproximados;

  this.detalles.forEach(d => {
    if (totalKgSecoAproximado > 0) {
      // Porcentaje de participación basado en kg_seco aproximado
      d.porcentaje = d.kg_seco / totalKgSecoAproximado;
      d.porcentaje_total_venta = +(d.porcentaje * 100).toFixed(2);

      // Cantidad vendida final de este detalle (después de descuento si aplica)
      d.cantidad_vendida_kg = +(this.venta.cantidad_vendida_kg * d.porcentaje).toFixed(2);
    } else {
      d.porcentaje = 0;
      d.porcentaje_total_venta = 0;
      d.cantidad_vendida_kg = 0;
    }

    // Calcular subtotal: cantidad_vendida_kg * precio_kg
    d.subtotal = +(d.cantidad_vendida_kg * this.venta.precio_kg).toFixed(2);
  });

  // 6️⃣ Total venta: cantidad_vendida_kg * precio_kg
  this.venta.total_venta = +(this.venta.cantidad_vendida_kg * this.venta.precio_kg).toFixed(2);
}


  getDiferencia(): number {
    return this.venta.kg_bruto - this.venta.kg_bruto_aproximados;
  }

  getCosechaFecha(cosechaId: string): string {
    const cosecha = this.cosechas.find((c: any) => c.id === cosechaId);
    return cosecha ? cosecha.fecha_cosecha : '';
  }

  generarNumeroVenta(): string {
    const f = new Date();
    return `${String(f.getDate()).padStart(2,'0')}${String(f.getMonth()+1).padStart(2,'0')}${f.getFullYear()}${String(f.getHours()).padStart(2,'0')}${String(f.getMinutes()).padStart(2,'0')}${String(f.getSeconds()).padStart(2,'0')}`;
  }
async guardar() {

  if (!this.esEdicion) {
    this.venta.nr_venta = this.generarNumeroVenta();

    await this.ventasService.createWithDetails(
      this.venta,
      this.detalles
    );
  } else {
    await this.ventasService.updateWithDetails(
      this.ventaId!,
      this.venta,
      this.detalles
    );
  }

  this.router.navigate(['/tabs/ventas']);
}

/* TEMPORAL PARA CAMBIOS EN EL RECLACULAR */
kgBrutoManual = false;
onKgBrutoManual() {
  this.kgBrutoManual = true;
  this.recalcular();
}
}
