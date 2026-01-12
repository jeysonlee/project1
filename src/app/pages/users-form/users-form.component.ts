import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UsersService } from '../../services/users.service';
import { RolesService } from 'src/app/services/roles.service';
import { v4 as uuidv4 } from 'uuid';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
})
export class UsersFormComponent implements OnInit {

  @Input() user: any;

  form!: FormGroup;
  isEdit = false;
  roles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private modalCtrl: ModalController,
    private roleService: RolesService
  ) {}

  async ngOnInit() {
    this.isEdit = !!this.user;

    this.form = this.fb.group({
      username: ['', Validators.required],
      password: [
        '',
        this.isEdit ? [] : [Validators.required, Validators.minLength(6)]
      ],
      rol_id: ['', Validators.required],
      nombre: [''],
      apellido: [''],
      email: ['', Validators.email],
      telefono: ['']
    });

    if (this.isEdit) {
      this.form.patchValue({
        username: this.user.username,
        rol_id: this.user.rol_id,
        nombre: this.user.nombre,
        apellido: this.user.apellido,
        email: this.user.email,
        telefono: this.user.telefono
      });
    }

    this.roles = await this.roleService.read();
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.value;

    if (this.isEdit) {
      await this.usersService.update({
        id: this.user.id,
        ...data,
        password: data.password ? data.password : null
      });
    } else {
      await this.usersService.create({
        id: uuidv4(),
        ...data
      });
    }

    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
