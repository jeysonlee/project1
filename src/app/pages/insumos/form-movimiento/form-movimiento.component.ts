import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { InsumoMovimientosService } from 'src/app/services/insumo-movimientos.service';
import { InsumosService } from 'src/app/services/insumos.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-form-movimiento',
  templateUrl: './form-movimiento.component.html',
  styleUrls: ['./form-movimiento.component.scss'],
})
export class FormMovimientoComponent implements OnInit {

  form: FormGroup;
  insumos: any[] = [];
  usuarios: any[] = [];
  esAdministrador: boolean = false;
  usuarioActual: any = null;
  mostrarUmbral: boolean = true;

  constructor(
    private fb: FormBuilder,
    private movimientosService: InsumoMovimientosService,
    private insumosService: InsumosService,
    private usersService: UsersService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.form = this.fb.group({
      tipoMovimiento: ['ENTRADA', Validators.required],
      usuarioId: [''],
      insumoId: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      costoUnitario: [0, Validators.min(0)],
      umbralMinimo: [0, Validators.min(0)],
      motivo: ['Compra', Validators.required]
    });
  }

  async ngOnInit() {
  }
  async ionViewWillEnter() {
        await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      // Obtener usuario actual
      this.usuarioActual = await this.usersService.getCurrentUser();
      this.esAdministrador = this.usuarioActual?.rol === 'Administrador';

      // Cargar insumos usando readAll
      this.insumos = await this.insumosService.readAll();

      if (this.esAdministrador) {
        // Si es admin, cargar lista de usuarios usando readAll
        this.usuarios = await this.usersService.readAll();
        // Inicializar con el usuario actual
        this.form.patchValue({ usuarioId: this.usuarioActual.id });
      } else {
        // Si es usuario regular, fijar su ID automáticamente
        this.form.patchValue({ usuarioId: this.usuarioActual.id });
        // Deshabilitar el campo para que no se pueda cambiar
        this.form.get('usuarioId')?.disable();
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mostrarAlerta('Error', 'No se pudieron cargar los datos');
    }
  }

  onTipoMovimientoChange() {
    const tipo = this.form.get('tipoMovimiento')?.value;

    if (tipo === 'ENTRADA') {
      this.form.patchValue({ motivo: 'Compra' });
      this.form.get('costoUnitario')?.enable();
    } else {
      this.form.patchValue({
        motivo: 'Uso en tarea',
        costoUnitario: 0
      });
      this.form.get('costoUnitario')?.disable();
    }
  }

  async onInsumoChange() {
    const insumoId = this.form.get('insumoId')?.value;
    if (!insumoId) return;

    try {
      // Verificar si ya tiene stock registrado para ocultar el campo de umbral
      const stock = await this.movimientosService.getStockInsumo(insumoId, this.usuarioActual.id);
      this.mostrarUmbral = !stock && this.form.get('tipoMovimiento')?.value === 'ENTRADA';

      // Si es entrada, obtener el costo unitario del insumo
      if (this.form.get('tipoMovimiento')?.value === 'ENTRADA') {
        const insumo = await this.insumosService.getById(insumoId);
        if (insumo) {
          this.form.patchValue({ costoUnitario: insumo.costo_unitario || 0 });
        }
      }
    } catch (error) {
      console.error('Error al verificar stock:', error);
    }
  }

  get costoTotal(): number {
    const cantidad = this.form.get('cantidad')?.value || 0;
    const costoUnitario = this.form.get('costoUnitario')?.value || 0;
    return cantidad * costoUnitario;
  }

  async registrarMovimiento() {
    if (this.form.invalid) {
      this.mostrarAlerta('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const formValue = this.form.getRawValue();
    const usuarioId = this.esAdministrador ? formValue.usuarioId : this.usuarioActual.id;

    console.log('Valores del formulario:', formValue);
    console.log('Usuario seleccionado:', usuarioId);

      if (formValue.tipoMovimiento === 'ENTRADA') {
        await this.movimientosService.registrarEntrada(
          usuarioId,
          formValue.insumoId,
          formValue.cantidad,
          formValue.costoUnitario,
          formValue.motivo,
          this.mostrarUmbral ? formValue.umbralMinimo : 0
        );
      } else {
        await this.movimientosService.registrarSalida(
          usuarioId,
          formValue.insumoId,
          formValue.cantidad,
          formValue.motivo
        );
      }


      this.modalCtrl.dismiss({ success: true });

  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
